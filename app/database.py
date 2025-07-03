# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./workers.db"  # قاعدة بيانات SQLite في ملف workers.db

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}  # خاصية SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
from sqlalchemy.orm import Session
from fastapi import Depends

# بعد الكود الحالي مباشرة

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
