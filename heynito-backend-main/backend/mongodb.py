from pymongo import MongoClient, ASCENDING, DESCENDING

from backend.config import MONGODB_URI, MONGODB_DB_NAME


if not MONGODB_URI:
    raise ValueError("MONGODB_URI missing in .env")


# Shared MongoDB connection pool
client = MongoClient(
    MONGODB_URI,
    maxPoolSize=10,
    minPoolSize=0,
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    tz_aware=True
)


# Database
db = client[MONGODB_DB_NAME]


# Collections
users = db["users"]
conversations = db["conversations"]
messages = db["messages"]
usage_logs = db["usage_logs"]
payment_orders = db["payment_orders"]
bug_reports = db["bug_reports"]
document_chunks = db["document_chunks"]


def connect_mongodb():
    client.admin.command("ping")
    print("MongoDB connected successfully")


def initialize_indexes():

    # Unique user emails
    users.create_index(
        "email",
        unique=True
    )
    document_chunks.create_index([
        ("user_id", ASCENDING),
        ("filename", ASCENDING)
    ])

    document_chunks.create_index([
        ("user_id", ASCENDING),
        ("upload_id", ASCENDING),
        ("chunk_index", ASCENDING)
    ], unique=True)
    
    conversations.create_index([
        ("user_id", ASCENDING),
        ("updated_at", DESCENDING)
    ])

    # Retrieve conversations belonging to a user
    conversations.create_index([
        ("user_id", ASCENDING),
        ("created_at", DESCENDING)
    ])

    # Retrieve messages in chronological order
    messages.create_index([
        ("conversation_id", ASCENDING),
        ("created_at", ASCENDING),
        ("_id", ASCENDING)
    ])

    # Daily token usage calculations
    usage_logs.create_index([
        ("user_id", ASCENDING),
        ("created_at", ASCENDING)
    ])

    # Prevent duplicate payment orders
    payment_orders.create_index(
        "order_id",
        unique=True
    )

    payment_orders.create_index([
        ("user_id", ASCENDING),
        ("created_at", DESCENDING)
    ])

    # User bug reports
    bug_reports.create_index([
        ("user_id", ASCENDING),
        ("created_at", DESCENDING)
    ])

    print("MongoDB indexes initialized successfully")


def close_mongodb():
    client.close()