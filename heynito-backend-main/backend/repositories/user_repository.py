from datetime import datetime, timezone
from uuid import uuid4

from backend.mongodb import users


def get_user_by_email(email: str):
    return users.find_one({
        "email": email.strip().lower()
    })


def get_user_by_id(user_id: str):
    return users.find_one({
        "_id": user_id
    })


def create_user(email: str, password_hash: str):
    user = {
        "_id": str(uuid4()),
        "email": email.strip().lower(),
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc),
        "plan": "free",
        "plan_expires_at": None,
        "daily_token_limit": 10000
    }

    users.insert_one(user)

    return user