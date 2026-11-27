from datetime import datetime, timezone
from uuid import uuid4

from backend.mongodb import conversations, messages


def create_conversation(user_id: str, title: str):
    now = datetime.now(timezone.utc)

    conversation = {
        "_id": str(uuid4()),
        "user_id": user_id,
        "title": title[:80],
        "created_at": now,
        "updated_at": now
    }

    conversations.insert_one(conversation)

    return conversation


def get_conversation(conversation_id: str, user_id: str):
    return conversations.find_one({
        "_id": conversation_id,
        "user_id": user_id
    })


def get_user_conversations(user_id: str):
    return list(
        conversations.find({
            "user_id": user_id
        }).sort("updated_at", -1)
    )


def get_conversation_messages(conversation_id: str):
    return list(
        messages.find({
            "conversation_id": conversation_id
        }).sort([
            ("created_at", 1),
            ("_id", 1)
        ])
    )


def save_message(
    conversation_id: str,
    role: str,
    content: str
):
    now = datetime.now(timezone.utc)

    message = {
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "created_at": now
    }

    messages.insert_one(message)

    conversations.update_one(
        {"_id": conversation_id},
        {"$set": {"updated_at": now}}
    )

    return message


def get_chat_history(conversation_id: str):
    records = get_conversation_messages(conversation_id)

    return [
        {
            "role": record["role"],
            "content": record["content"]
        }
        for record in records
    ]