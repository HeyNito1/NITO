from backend.database import Base, engine
from backend import models

# .\myenv\Scripts\python.exe create_tables.py

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")