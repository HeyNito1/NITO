
# from sqlalchemy import select

# from backend.database import SessionLocal
# from backend.models import Conversation, Message

from fastapi import APIRouter, HTTPException, Depends
from backend.auth import get_current_user

from backend.repositories.conversation_repository import (
    get_conversation,
    get_user_conversations,
    get_conversation_messages
)

router = APIRouter()


# # User ki saari conversations fetch karna
# @router.get("/conversations")
# def get_conversations(user_id: str = Depends(get_current_user)):
#     with SessionLocal() as session:
#         conversations = session.scalars(
#             select(Conversation)
#             .where(Conversation.user_id == user_id)
#             .order_by(Conversation.created_at.desc())
#         ).all()

#         return [
#             {
#                 "conversation_id": conversation.id,
#                 "created_at": conversation.created_at
#             }
#             for conversation in conversations
#         ]

# # Ek conversation ke saare messages fetch karna
# #Ab backend check karega ki conversation logged-in user ki hi hai. Doosre user ki conversation access nahi hogi.
# @router.get("/conversations/{conversation_id}/messages")
# def get_messages( conversation_id: str, user_id: str = Depends(get_current_user) ):
#     with SessionLocal() as session:
#         conversation = session.get(Conversation, conversation_id)

#         if conversation is None or conversation.user_id != user_id:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Conversation not found"
#             )

#         messages = session.scalars(
#             select(Message)
#             .where(Message.conversation_id == conversation_id)
#             .order_by(Message.id.asc())
#         ).all()

#         return [
#             {
#                 "role": message.role,
#                 "content": message.content,
#                 "created_at": message.created_at
#             }
#             for message in messages
#         ]

@router.get("/conversations")
def get_conversations(
    user_id: str = Depends(get_current_user)
):
    records = get_user_conversations(user_id)

    return [
        {
            "conversation_id": record["_id"],
            "title": record.get("title", "New Chat"),
            "created_at": record["created_at"],
            "updated_at": record.get(
                "updated_at",
                record["created_at"]
            )
        }
        for record in records
    ]


@router.get("/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user)
):
    conversation = get_conversation(
        conversation_id,
        user_id
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    records = get_conversation_messages(
        conversation_id
    )

    return [
        {
            "role": record["role"],
            "content": record["content"],
            "created_at": record["created_at"]
        }
        for record in records
    ]