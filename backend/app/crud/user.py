from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get_user_by_id(db: Session, user_id: int):
    """جلب مستخدم بالمعرف"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    """جلب مستخدم باسم المستخدم"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """جلب مستخدم بالبريد الإلكتروني"""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    """إنشاء مستخدم جديد"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        password_hash=hashed_password,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: dict):
    """تحديث مستخدم"""
    user = get_user_by_id(db, user_id)
    if user:
        for field, value in user_update.items():
            if field == "password":
                setattr(user, "password_hash", get_password_hash(value))
            else:
                setattr(user, field, value)
        db.commit()
        db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    """حذف مستخدم"""
    user = get_user_by_id(db, user_id)
    if user:
        db.delete(user)
        db.commit()
    return user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """جلب قائمة المستخدمين"""
    return db.query(User).offset(skip).limit(limit).all()
