from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey , Float
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


# Har user ki unique identity
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(  # Mapped --- map( python code -- neon table connection ) 
        String(100), primary_key=True
    )

    email: Mapped[str] = mapped_column(
    String(255), unique=True, nullable=False, index=True
    )

    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Subscription fields
    plan: Mapped[str] = mapped_column(
        String(20), default="free", nullable=False
    )  # "free", "pro_monthly", "pro_yearly"

    plan_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    daily_token_limit: Mapped[int] = mapped_column(
        default=10_000, nullable=False  # Free: 10,000 | Pro: 200,000 | Yearly: 500,000
    )


# Har user ki alag-alag conversations
class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True
    )

    # User ke saath conversation link karta hai
    user_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("users.id"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )


# Har conversation ke user aur assistant messages
class Message(Base):
    __tablename__ = "messages"

    # Har message ki auto-increment ID
    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    # Message ko particular conversation se link karta hai
    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id"),
        nullable=False
    )

    # Message kisne bheja: user ya assistant
    role: Mapped[str] = mapped_column(
        String(20), nullable=False
    )

    # Actual message text
    content: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    # Message creation ka time
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

# each AI request ka record 
class UsageLog(Base):
    __tablename__ = "usage_logs"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    model: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    input_tokens: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )

    output_tokens: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )

    estimated_cost: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )


# All transactions and orders record
class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(100), ForeignKey("users.id"), nullable=False)
    order_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    provider: Mapped[str] = mapped_column(String(20), nullable=False)   # "razorpay" / "stripe"
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)   # "INR" / "USD"
    plan: Mapped[str] = mapped_column(String(20), nullable=False)       # "pro_monthly" / "pro_yearly"
    status: Mapped[str] = mapped_column(String(20), default="created")  # "created", "paid", "failed"
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )



class BugReport(Base):
    __tablename__ = "bug_reports"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(100), ForeignKey("users.id"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    conversation_id: Mapped[str | None] = mapped_column(String(36), nullable=True)  # Agar specific chat me issue aaya ho
    status: Mapped[str] = mapped_column(String(20), default="open", nullable=False) # "open", "in_progress", "resolved"
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )