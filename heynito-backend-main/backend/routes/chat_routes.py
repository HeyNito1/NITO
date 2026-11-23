from pydantic import BaseModel, Field , field_validator  # Request body validate karta hai
from uuid import uuid4
from typing import Optional , Literal
from sqlalchemy import select
from fastapi import APIRouter, HTTPException, Depends
from backend.auth import get_current_user # logged in user ki userID fetch

from backend.llm import get_model_response 
from backend.llm import get_model_for_query
from backend.database import SessionLocal
from backend.models import User, Conversation, Message , BugReport
from backend.llm import calculate_cost

from fastapi.responses import StreamingResponse
from backend.llm import get_chat_model

from backend.models import UsageLog
from backend.llm import get_model_response_with_usage
from sqlalchemy import func
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


def check_and_enforce_token_limit(session, user: User):
    now = datetime.now(timezone.utc)
    # 1. Check if plan expired -> revert to free
    if user.plan != "free" and user.plan_expires_at and user.plan_expires_at < now:
        user.plan = "free"   # plan is expired 
        user.daily_token_limit = 10_000
        session.commit()

    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    usage = (
        session.query(
            func.coalesce(func.sum(UsageLog.input_tokens), 0),
            func.coalesce(func.sum(UsageLog.output_tokens), 0),
        )
        .filter(
            UsageLog.user_id == user.id,
            UsageLog.created_at >= today_start,
            UsageLog.created_at < today_start + timedelta(days=1),
        )
        .one()
    )

    used_input, used_output = usage[0], usage[1]
    # Check total tokens (input + output)
    total_tokens_used = used_input + used_output
    allowed_limit = user.daily_token_limit or 10_000

    if total_tokens_used >= allowed_limit:
        raise HTTPException(
            status_code=429, 
            detail=f"Daily token limit ({allowed_limit}) exceeded for your {user.plan} plan. Please upgrade."
        )




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


# in 5 models se hi allowed hai model -- and by default is -- qwen 
@router.post("/chat")
def chat(request: ChatRequest, user_id: str = Depends(get_current_user)):
    check_rate_limit(user_id)

    # ---------------- PHASE 1: PRE-AI (FAST DB READ/WRITE ~ 5ms) ----------------
    with SessionLocal() as session:
        # 1. User check
        user = session.get(User, user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        # 2. Conversation find or create
        if request.conversation_id:
            conversation = session.get(Conversation, request.conversation_id)
            if conversation is None or conversation.user_id != user.id:
                raise HTTPException(status_code=404, detail="Conversation not found")
            conversation_id = conversation.id
        else:
            conversation_id = str(uuid4())
            conversation = Conversation(id=conversation_id, user_id=user.id)
            session.add(conversation)
            session.commit()

        # 3. Check daily token limits & plan validity (total input + output tokens)
        check_and_enforce_token_limit(session, user)

        # 4. Fetch history
        history_records = session.scalars(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.id.asc())
        ).all()

        history = [{"role": item.role, "content": item.content} for item in history_records]
        history.append({"role": "user", "content": request.message})

        # 5. Save user message
        user_message = Message(
            conversation_id=conversation_id,
            role="user",
            content=request.message
        )
        session.add(user_message)
        session.commit()

    # <<< YAHAN DB CONNECTION FREE HO CHUKA HAI! POOL ME WAPAS CHALA GAYA >>>

    # ---------------- PHASE 2: AI INVOCATION (ZERO DB LOCK) ----------------
    try:
        selected_model = get_model_for_query(request.message)
        result = get_model_response_with_usage(history, selected_model)

        reply = result["reply"]
        input_tokens = result["input_tokens"]
        output_tokens = result["output_tokens"]
        selected_model = result["model"]
    except Exception:
        logger.exception("AI service request failed")
        raise HTTPException(
            status_code=502,
            detail="AI service temporarily unavailable. Please try again."
        )

    # ---------------- PHASE 3: POST-AI (FAST DB SAVE ~ 3ms) ----------------
    with SessionLocal() as session:
        # Assistant message save
        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=reply
        )
        session.add(assistant_message)

        # Usage Log save
        try:
            estimated_cost = calculate_cost(selected_model, input_tokens, output_tokens)
            usage_log = UsageLog(
                user_id=user_id,
                model=selected_model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                estimated_cost=estimated_cost,
            )
            session.add(usage_log)
        except Exception:
            logger.exception("Failed to calculate cost / create usage log")

        session.commit()

    # 8. Return response to user
    return {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "reply": reply,
        "model": selected_model
    }

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest, user_id: str = Depends(get_current_user)):
    """
    Real-time streaming response token-by-token
    """
    check_rate_limit(user_id)

    # Check token limits & plan
    with SessionLocal() as session:
        user = session.get(User, user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        check_and_enforce_token_limit(session, user)

    # 1. Best model detect ya select karo
    selected_model = get_model_for_query(request.message)
    llm = get_chat_model(selected_model)
    async def generate_tokens():
        # LangChain ka astream live chunks yield karta hai
        async for chunk in llm.astream(request.message):
            if chunk.content:
                # SSE format (Server-Sent Events) ya plain text chunk
                yield f"data: {chunk.content}\n\n"
                
    return StreamingResponse(generate_tokens(), media_type="text/event-stream")



@router.get("/usage")
def get_usage(user_id: str = Depends(get_current_user)):
    with SessionLocal() as session:
        now = datetime.now(timezone.utc)
        today_start = now.replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        usage = session.query(
            func.coalesce(func.sum(UsageLog.input_tokens), 0),
            func.coalesce(func.sum(UsageLog.output_tokens), 0),
            func.coalesce(func.sum(UsageLog.estimated_cost), 0.0),
        ).filter(
            UsageLog.user_id == user_id,
            UsageLog.created_at >= today_start,
            UsageLog.created_at < today_start + timedelta(days=1),
        ).one()

        user = session.get(User, user_id)
        return {
            "plan": user.plan if user else "free",
            "daily_token_limit": user.daily_token_limit if user else 10_000,
            "input_tokens": usage[0],
            "output_tokens": usage[1],
            "total_tokens": usage[0] + usage[1],
            "estimated_cost": usage[2],
        }





@router.post("/chat/agent")
def chat_with_agent( request: ChatRequest,  user_id: str = Depends(get_current_user) ):
    """
    Agent endpoint: Yeh query samajh kar automatically decide karega 
    ki PDF search karni hai, translate karna hai, ya normal reply dena hai.
    """
    check_rate_limit(user_id)

    # Check token limits & plan
    with SessionLocal() as session:
        user = session.get(User, user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        check_and_enforce_token_limit(session, user)

    try:
        reply = run_agent( query=request.message, user_id=user_id, chat_history=[] )
        return {"reply": reply, "agent": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



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


# 1. Bug Report Submit karne ka Endpoint
@router.post("/support/report-bug")
def submit_bug_report(
    request: BugReportRequest, 
    user_id: str = Depends(get_current_user)
):
    """
    User app se bug report ya issue submit kar sakta hai (with optional conversation_id)
    """
    check_rate_limit(user_id)
    with SessionLocal() as session:
        # User verify karein
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        # Agar conversation_id bheja hai toh check karein ki user ki hi ho
        if request.conversation_id:
            conv = session.get(Conversation, request.conversation_id)
            if conv and conv.user_id != user.id:
                raise HTTPException(status_code=403, detail="Cannot link bug report to other user's conversation")
        new_report = BugReport(
            user_id=user_id,
            description=request.description,
            conversation_id=request.conversation_id,
            status="open"
        )
        session.add(new_report)
        session.commit()
        return {
            "status": "success",
            "report_id": new_report.id,
            "message": "Thank you! Your bug report has been received and our team will review it."
        }

        
# 2. User ke apne Bug Reports dekhne ka Endpoint
@router.get("/support/my-reports")
def get_my_bug_reports(user_id: str = Depends(get_current_user)):
    """
    Logged-in user ke submitted bug reports ki list return karega
    """
    with SessionLocal() as session:
        reports = session.scalars(
            select(BugReport)
            .where(BugReport.user_id == user_id)
            .order_by(BugReport.id.desc())
        ).all()
        return [
            {
                "id": r.id,
                "description": r.description,
                "conversation_id": r.conversation_id,
                "status": r.status,
                "created_at": r.created_at.isoformat()
            }
            for r in reports
        ]
  