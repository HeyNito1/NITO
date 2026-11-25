import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from backend.config import DATABASE_URL

# for deployment in the free version, reducing the pool size.

# # Engine database connections manage karta hai
# engine = create_engine(
#     DATABASE_URL,
#     pool_pre_ping=True,      # Dead connection detect karke restart karega
#     pool_size=30,            # 20 active persistent database connections
#     max_overflow=50,         # Heavy load par 30 extra temporary connections (Total 50) . after that remove them -- as load not to put on db 
#     pool_recycle=1800,       # 30 min me stale connections renew( recycle ) karega
#     pool_timeout=45          # 45 sec se zyada wait nahi karwayega
# )

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "5")),
    pool_recycle=1800,
    pool_timeout=45
)

# Database operations ke liye sessions create karta hai
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False
)

# Saare database models isi Base ko inherit karenge
class Base(DeclarativeBase):
    pass