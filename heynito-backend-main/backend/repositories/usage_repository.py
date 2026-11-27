from datetime import datetime, timezone, timedelta

from fastapi import HTTPException

from backend.mongodb import users, usage_logs


def get_daily_usage(user_id: str):
    now = datetime.now(timezone.utc)

    today_start = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "created_at": {
                    "$gte": today_start,
                    "$lt": today_start + timedelta(days=1)
                }
            }
        },
        {
            "$group": {
                "_id": None,
                "input_tokens": {
                    "$sum": "$input_tokens"
                },
                "output_tokens": {
                    "$sum": "$output_tokens"
                },
                "estimated_cost": {
                    "$sum": "$estimated_cost"
                }
            }
        }
    ]

    result = next(
        usage_logs.aggregate(pipeline),
        {}
    )

    input_tokens = result.get("input_tokens", 0)
    output_tokens = result.get("output_tokens", 0)

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": input_tokens + output_tokens,
        "estimated_cost": result.get("estimated_cost", 0.0)
    }


def get_active_user(user_id: str):
    user = users.find_one({"_id": user_id})

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    now = datetime.now(timezone.utc)

    expires_at = user.get("plan_expires_at")

    if (
        user.get("plan") != "free"
        and expires_at
        and expires_at <= now
    ):
        updates = {
            "plan": "free",
            "daily_token_limit": 10000,
            "plan_expires_at": None
        }

        users.update_one(
            {"_id": user_id},
            {"$set": updates}
        )

        user.update(updates)

    return user


def enforce_token_limit(user_id: str):
    user = get_active_user(user_id)

    usage = get_daily_usage(user_id)

    limit = user.get("daily_token_limit") or 10000

    if usage["total_tokens"] >= limit:
        raise HTTPException(
            status_code=429,
            detail=(
                f"Daily token limit ({limit}) exceeded "
                f"for your {user['plan']} plan. "
                "Please upgrade."
            )
        )

    return user


def save_usage(
    user_id: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    estimated_cost: float
):
    usage_logs.insert_one({
        "user_id": user_id,
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "estimated_cost": estimated_cost,
        "created_at": datetime.now(timezone.utc)
    })