from datetime import datetime, timezone

from backend.mongodb import bug_reports


def create_bug_report(
    user_id,
    description,
    conversation_id=None
):

    report = {
        "user_id": user_id,
        "description": description,
        "conversation_id": conversation_id,
        "status": "open",
        "created_at": datetime.now(timezone.utc)
    }

    result = bug_reports.insert_one(report)

    return str(result.inserted_id)


def get_user_bug_reports(user_id):

    records = bug_reports.find({
        "user_id": user_id
    }).sort("created_at", -1)

    return [
        {
            "id": str(record["_id"]),
            "description": record["description"],
            "conversation_id": record.get(
                "conversation_id"
            ),
            "status": record["status"],
            "created_at": record["created_at"].isoformat()
        }
        for record in records
    ]