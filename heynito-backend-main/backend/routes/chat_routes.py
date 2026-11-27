from backend.repositories.bug_repository import (
    create_bug_report,
    get_user_bug_reports
)

from starlette.concurrency import run_in_threadpool

from langchain_core.messages import (
    HumanMessage,
    AIMessage
)

from backend.services.chat_service import (
    prepare_chat,
    complete_chat,
    estimate_tokens
)

from backend.repositories.conversation_repository import (
    create_conversation,
    get_conversation,
    get_chat_history,
    save_message
)

from backend.repositories.usage_repository import (
    get_daily_usage,
    get_active_user,
    enforce_token_limit,
    save_usage
)

from pydantic import BaseModel, Field , field_validator  # Request body validate karta hai
from uuid import uuid4
from typing import Optional , Literal
from fastapi import APIRouter, HTTPException, Depends
from backend.auth import get_current_user # logged in user ki userID fetch

from backend.llm import get_model_response 
from backend.llm import get_model_for_query
from backend.llm import calculate_cost

from fastapi.responses import StreamingResponse
from backend.llm import get_chat_model

from backend.llm import get_model_response_with_usage
from datetime import datetime, timezone, timedelta
import logging

from collections import defaultdict
from time import time

from backend.agent import run_agent

request_tracker = defaultdict(list)
RATE_LIMIT = 10
RATE_WINDOW = 60

logger = logging.getLogger(__name__)

router = APIRouter()

def check_rate_limit(user_id: str):
    now = time()
    # Purani requests hatao (60 seconds se pehle wali)
    request_tracker[user_id] = [
        t for t in request_tracker[user_id]
        if now - t < RATE_WINDOW
    ]

    if len(request_tracker[user_id]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again in a minute."
        )

    request_tracker[user_id].append(now)


# def check_and_enforce_token_limit(session, user: User):
#     now = datetime.now(timezone.utc)
#     # 1. Check if plan expired -> revert to free
#     if user.plan != "free" and user.plan_expires_at and user.plan_expires_at < now:
#         user.plan = "free"   # plan is expired 
#         user.daily_token_limit = 10_000
#         session.commit()

#     today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
#     usage = (
#         session.query(
#             func.coalesce(func.sum(UsageLog.input_tokens), 0),
#             func.coalesce(func.sum(UsageLog.output_tokens), 0),
#         )
#         .filter(
#             UsageLog.user_id == user.id,
#             UsageLog.created_at >= today_start,
#             UsageLog.created_at < today_start + timedelta(days=1),
#         )
#         .one()
#     )

#     used_input, used_output = usage[0], usage[1]
#     # Check total tokens (input + output)
#     total_tokens_used = used_input + used_output
#     allowed_limit = user.daily_token_limit or 10_000

#     if total_tokens_used >= allowed_limit:
#         raise HTTPException(
#             status_code=429, 
#             detail=f"Daily token limit ({allowed_limit}) exceeded for your {user.plan} plan. Please upgrade."
#         )




# /chat endpoint

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)
    conversation_id: Optional[str] = None

    # Extra spaces hatao aur empty messages reject karo
    @field_validator("message")  # messages validate 
    @classmethod
    def validate_not_blank(cls, value: str) -> str:
        value = value.strip()  # starting , ending spaces remove 
        if not value:
            raise ValueError("Message cannot be empty")
        return value


# # in 5 models se hi allowed hai model -- and by default is -- qwen 
# @router.post("/chat")
# def chat(request: ChatRequest, user_id: str = Depends(get_current_user)):
#     check_rate_limit(user_id)

#     # ---------------- PHASE 1: PRE-AI (FAST DB READ/WRITE ~ 5ms) ----------------
#     with SessionLocal() as session:
#         # 1. User check
#         user = session.get(User, user_id)
#         if user is None:
#             raise HTTPException(status_code=401, detail="User not found")

#         # 2. Conversation find or create
#         if request.conversation_id:
#             conversation = session.get(Conversation, request.conversation_id)
#             if conversation is None or conversation.user_id != user.id:
#                 raise HTTPException(status_code=404, detail="Conversation not found")
#             conversation_id = conversation.id
#         else:
#             conversation_id = str(uuid4())
#             conversation = Conversation(id=conversation_id, user_id=user.id)
#             session.add(conversation)
#             session.commit()

#         # 3. Check daily token limits & plan validity (total input + output tokens)
#         check_and_enforce_token_limit(session, user)

#         # 4. Fetch history
#         history_records = session.scalars(
#             select(Message)
#             .where(Message.conversation_id == conversation_id)
#             .order_by(Message.id.asc())
#         ).all()

#         history = [{"role": item.role, "content": item.content} for item in history_records]
#         history.append({"role": "user", "content": request.message})

#         # 5. Save user message
#         user_message = Message(
#             conversation_id=conversation_id,
#             role="user",
#             content=request.message
#         )
#         session.add(user_message)
#         session.commit()

#     # <<< YAHAN DB CONNECTION FREE HO CHUKA HAI! POOL ME WAPAS CHALA GAYA >>>

#     # ---------------- PHASE 2: AI INVOCATION (ZERO DB LOCK) ----------------
#     try:
#         selected_model = get_model_for_query(request.message)
#         result = get_model_response_with_usage(history, selected_model)

#         reply = result["reply"]
#         input_tokens = result["input_tokens"]
#         output_tokens = result["output_tokens"]
#         selected_model = result["model"]
#     except Exception:
#         logger.exception("AI service request failed")
#         raise HTTPException(
#             status_code=502,
#             detail="AI service temporarily unavailable. Please try again."
#         )

#     # ---------------- PHASE 3: POST-AI (FAST DB SAVE ~ 3ms) ----------------
#     with SessionLocal() as session:
#         # Assistant message save
#         assistant_message = Message(
#             conversation_id=conversation_id,
#             role="assistant",
#             content=reply
#         )
#         session.add(assistant_message)

#         # Usage Log save
#         try:
#             estimated_cost = calculate_cost(selected_model, input_tokens, output_tokens)
#             usage_log = UsageLog(
#                 user_id=user_id,
#                 model=selected_model,
#                 input_tokens=input_tokens,
#                 output_tokens=output_tokens,
#                 estimated_cost=estimated_cost,
#             )
#             session.add(usage_log)
#         except Exception:
#             logger.exception("Failed to calculate cost / create usage log")

#         session.commit()

#     # 8. Return response to user
#     return {
#         "user_id": user_id,
#         "conversation_id": conversation_id,
#         "reply": reply,
#         "model": selected_model
#     }

@router.post("/chat")
def chat(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    check_rate_limit(user_id)

    enforce_token_limit(user_id)

    # Find or create conversation
    if request.conversation_id:

        conversation = get_conversation(
            request.conversation_id,
            user_id
        )

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

    else:
        conversation = create_conversation(
            user_id=user_id,
            title=request.message
        )

    conversation_id = conversation["_id"]

    # Retrieve previous messages
    history = get_chat_history(conversation_id)

    history.append({
        "role": "user",
        "content": request.message
    })

    # Save user message
    save_message(
        conversation_id=conversation_id,
        role="user",
        content=request.message
    )

    # Generate AI response
    try:
        selected_model = get_model_for_query(
            request.message
        )

        result = get_model_response_with_usage(
            history,
            selected_model
        )

        reply = result["reply"]
        input_tokens = result["input_tokens"]
        output_tokens = result["output_tokens"]
        selected_model = result["model"]

    except Exception:
        logger.exception("AI service request failed")

        raise HTTPException(
            status_code=502,
            detail=(
                "AI service temporarily unavailable. "
                "Please try again."
            )
        )

    # Calculate API cost
    try:
        estimated_cost = calculate_cost(
            selected_model,
            input_tokens,
            output_tokens
        )

    except Exception:
        logger.exception("Cost calculation failed")
        estimated_cost = 0.0

    # Save token usage
    save_usage(
        user_id=user_id,
        model=selected_model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        estimated_cost=estimated_cost
    )

    # Save AI response
    save_message(
        conversation_id=conversation_id,
        role="assistant",
        content=reply
    )

    return {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "reply": reply,
        "model": selected_model
    }

# @router.post("/chat/stream")
# async def chat_stream(request: ChatRequest, user_id: str = Depends(get_current_user)):
#     """
#     Real-time streaming response token-by-token
#     """
#     check_rate_limit(user_id)

#     # Check token limits & plan
#     with SessionLocal() as session:
#         user = session.get(User, user_id)
#         if user is None:
#             raise HTTPException(status_code=401, detail="User not found")
#         check_and_enforce_token_limit(session, user)

#     # 1. Best model detect ya select karo
#     selected_model = get_model_for_query(request.message)
#     llm = get_chat_model(selected_model)
#     async def generate_tokens():
#         # LangChain ka astream live chunks yield karta hai
#         async for chunk in llm.astream(request.message):
#             if chunk.content:
#                 # SSE format (Server-Sent Events) ya plain text chunk
#                 yield f"data: {chunk.content}\n\n"
                
#     return StreamingResponse(generate_tokens(), media_type="text/event-stream")

@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
):

    check_rate_limit(user_id)

    conversation_id, history = await run_in_threadpool(
        prepare_chat,
        user_id,
        request.message,
        request.conversation_id
    )

    selected_model = get_model_for_query(
        request.message
    )

    llm = get_chat_model(selected_model)

    model_messages = []

    for item in history:

        if item["role"] == "user":
            model_messages.append(
                HumanMessage(content=item["content"])
            )

        elif item["role"] == "assistant":
            model_messages.append(
                AIMessage(content=item["content"])
            )

    model_messages.append(
        HumanMessage(content=request.message)
    )

    async def generate_tokens():

        response_parts = []

        input_tokens = 0
        output_tokens = 0

        try:

            async for chunk in llm.astream(model_messages):

                usage = getattr(
                    chunk,
                    "usage_metadata",
                    None
                )

                if usage:
                    input_tokens += usage.get(
                        "input_tokens", 0
                    )

                    output_tokens += usage.get(
                        "output_tokens", 0
                    )

                content = chunk.content

                if isinstance(content, str) and content:

                    response_parts.append(content)

                    lines = content.split("\n")

                    yield (
                        "\n".join(
                            f"data: {line}"
                            for line in lines
                        ) + "\n\n"
                    )

            reply = "".join(response_parts)

            if input_tokens == 0:
                input_tokens = sum(
                    estimate_tokens(msg.content)
                    for msg in model_messages
                )

            if output_tokens == 0:
                output_tokens = estimate_tokens(reply)

            await run_in_threadpool(
                complete_chat,
                user_id,
                conversation_id,
                reply,
                selected_model,
                input_tokens,
                output_tokens
            )

        except Exception:

            logger.exception("Streaming chat failed")

            yield (
                "event: error\n"
                "data: Unable to complete response\n\n"
            )

    return StreamingResponse(
        generate_tokens(),
        media_type="text/event-stream",
        headers={
            "X-Conversation-ID": conversation_id,
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

# @router.get("/usage")
# def get_usage(user_id: str = Depends(get_current_user)):
#     with SessionLocal() as session:
#         now = datetime.now(timezone.utc)
#         today_start = now.replace(
#             hour=0, minute=0, second=0, microsecond=0
#         )

#         usage = session.query(
#             func.coalesce(func.sum(UsageLog.input_tokens), 0),
#             func.coalesce(func.sum(UsageLog.output_tokens), 0),
#             func.coalesce(func.sum(UsageLog.estimated_cost), 0.0),
#         ).filter(
#             UsageLog.user_id == user_id,
#             UsageLog.created_at >= today_start,
#             UsageLog.created_at < today_start + timedelta(days=1),
#         ).one()

#         user = session.get(User, user_id)
#         return {
#             "plan": user.plan if user else "free",
#             "daily_token_limit": user.daily_token_limit if user else 10_000,
#             "input_tokens": usage[0],
#             "output_tokens": usage[1],
#             "total_tokens": usage[0] + usage[1],
#             "estimated_cost": usage[2],
#         }

@router.get("/usage")
def get_usage(
    user_id: str = Depends(get_current_user)
):
    user = get_active_user(user_id)

    usage = get_daily_usage(user_id)

    return {
        "plan": user.get("plan", "free"),
        "daily_token_limit": (
            user.get("daily_token_limit") or 10000
        ),
        "input_tokens": usage["input_tokens"],
        "output_tokens": usage["output_tokens"],
        "total_tokens": usage["total_tokens"],
        "estimated_cost": usage["estimated_cost"]
    }



# @router.post("/chat/agent")
# def chat_with_agent( request: ChatRequest,  user_id: str = Depends(get_current_user) ):
#     """
#     Agent endpoint: Yeh query samajh kar automatically decide karega 
#     ki PDF search karni hai, translate karna hai, ya normal reply dena hai.
#     """
#     check_rate_limit(user_id)

#     # Check token limits & plan
#     with SessionLocal() as session:
#         user = session.get(User, user_id)
#         if user is None:
#             raise HTTPException(status_code=401, detail="User not found")
#         check_and_enforce_token_limit(session, user)

#     try:
#         reply = run_agent( query=request.message, user_id=user_id, chat_history=[] )
#         return {"reply": reply, "agent": True}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/agent")
def chat_with_agent(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
):

    check_rate_limit(user_id)

    conversation_id, history = prepare_chat(
        user_id=user_id,
        message=request.message,
        conversation_id=request.conversation_id
    )

    try:

        reply = run_agent(
            query=request.message,
            user_id=user_id,
            chat_history=history
        )

        input_tokens = estimate_tokens(
            request.message
        )

        input_tokens += sum(
            estimate_tokens(item["content"])
            for item in history
        )

        output_tokens = estimate_tokens(reply)

        complete_chat(
            user_id=user_id,
            conversation_id=conversation_id,
            reply=reply,
            model="agent",
            input_tokens=input_tokens,
            output_tokens=output_tokens
        )

        return {
            "user_id": user_id,
            "conversation_id": conversation_id,
            "reply": reply,
            "agent": True
        }

    except Exception:

        logger.exception("Agent chat failed")

        raise HTTPException(
            status_code=502,
            detail="Agent service temporarily unavailable."
        )

class BugReportRequest(BaseModel):
    description: str = Field(min_length=5, max_length=3000)
    conversation_id: Optional[str] = None
    @field_validator("description")
    @classmethod
    def validate_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Bug description cannot be empty")
        return value


# # 1. Bug Report Submit karne ka Endpoint
# @router.post("/support/report-bug")
# def submit_bug_report(
#     request: BugReportRequest, 
#     user_id: str = Depends(get_current_user)
# ):
#     """
#     User app se bug report ya issue submit kar sakta hai (with optional conversation_id)
#     """
#     check_rate_limit(user_id)
#     with SessionLocal() as session:
#         # User verify karein
#         user = session.get(User, user_id)
#         if not user:
#             raise HTTPException(status_code=401, detail="User not found")
#         # Agar conversation_id bheja hai toh check karein ki user ki hi ho
#         if request.conversation_id:
#             conv = session.get(Conversation, request.conversation_id)
#             if conv and conv.user_id != user.id:
#                 raise HTTPException(status_code=403, detail="Cannot link bug report to other user's conversation")
#         new_report = BugReport(
#             user_id=user_id,
#             description=request.description,
#             conversation_id=request.conversation_id,
#             status="open"
#         )
#         session.add(new_report)
#         session.commit()
#         return {
#             "status": "success",
#             "report_id": new_report.id,
#             "message": "Thank you! Your bug report has been received and our team will review it."
#         }

@router.post("/support/report-bug")
def submit_bug_report(
    request: BugReportRequest,
    user_id: str = Depends(get_current_user)
):

    check_rate_limit(user_id)

    get_active_user(user_id)

    if request.conversation_id:

        conversation = get_conversation(
            request.conversation_id,
            user_id
        )

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

    report_id = create_bug_report(
        user_id=user_id,
        description=request.description,
        conversation_id=request.conversation_id
    )

    return {
        "status": "success",
        "report_id": report_id,
        "message": (
            "Thank you! Your bug report has been received "
            "and our team will review it."
        )
    }
        
# # 2. User ke apne Bug Reports dekhne ka Endpoint
# @router.get("/support/my-reports")
# def get_my_bug_reports(user_id: str = Depends(get_current_user)):
#     """
#     Logged-in user ke submitted bug reports ki list return karega
#     """
#     with SessionLocal() as session:
#         reports = session.scalars(
#             select(BugReport)
#             .where(BugReport.user_id == user_id)
#             .order_by(BugReport.id.desc())
#         ).all()
#         return [
#             {
#                 "id": r.id,
#                 "description": r.description,
#                 "conversation_id": r.conversation_id,
#                 "status": r.status,
#                 "created_at": r.created_at.isoformat()
#             }
#             for r in reports
#         ]
  
@router.get("/support/my-reports")
def get_my_bug_reports(
    user_id: str = Depends(get_current_user)
):

    get_active_user(user_id)

    return get_user_bug_reports(user_id)