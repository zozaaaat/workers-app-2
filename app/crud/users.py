from sqlalchemy.orm import Session
from app import models
from passlib.context import CryptContext
from typing import Optional
from datetime import date

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(
    db: Session, 
    username: str, 
    email: str, 
    password: str, 
    role: str = "employee",
    full_name: Optional[str] = None,
    department: Optional[str] = None,
    created_by: Optional[int] = None
):
    hashed_password = pwd_context.hash(password)
    db_user = models.User(
        username=username, 
        email=email, 
        hashed_password=hashed_password, 
        role=role,
        full_name=full_name,
        department=department,
        created_at=date.today(),
        created_by=created_by
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, **kwargs):
    """تحديث بيانات المستخدم"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    for key, value in kwargs.items():
        if hasattr(db_user, key) and value is not None:
            if key == "password":
                # تشفير كلمة المرور الجديدة
                setattr(db_user, "hashed_password", pwd_context.hash(value))
            else:
                setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def deactivate_user(db: Session, user_id: int):
    """تعطيل المستخدم"""
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db_user.is_active = False
        db.commit()
        db.refresh(db_user)
    return db_user

def activate_user(db: Session, user_id: int):
    """تفعيل المستخدم"""
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db_user.is_active = True
        db.commit()
        db.refresh(db_user)
    return db_user

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_users_by_role(db: Session, role: str, skip: int = 0, limit: int = 100):
    """الحصول على المستخدمين حسب الدور"""
    return db.query(models.User).filter(models.User.role == role).offset(skip).limit(limit).all()

def get_active_users(db: Session, skip: int = 0, limit: int = 100):
    """الحصول على المستخدمين النشطين فقط"""
    return db.query(models.User).filter(models.User.is_active == True).offset(skip).limit(limit).all()
