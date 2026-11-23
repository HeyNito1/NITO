from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from backend.config import DATABASE_URL

# Engine database connections manage karta hai
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # Dead connection detect karke restart karega
    pool_size=30,            # 20 active persistent database connections
    max_overflow=50,         # Heavy load par 30 extra temporary connections (Total 50) . after that remove them -- as load not to put on db 
    pool_recycle=1800,       # 30 min me stale connections renew( recycle ) karega
    pool_timeout=45          # 45 sec se zyada wait nahi karwayega
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