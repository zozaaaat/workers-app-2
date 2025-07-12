from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import verify_password, create_access_token, get_password_hash, get_current_user
from app.crud.user import create_user, get_user_by_username, get_user_by_email

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """تسجيل مستخدم جديد"""
    # التحقق من عدم وجود المستخدم مسبقاً
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=400,
            detail="اسم المستخدم موجود مسبقاً"
        )
    
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=400,
            detail="البريد الإلكتروني موجود مسبقاً"
        )
    
    # إنشاء المستخدم
    user = create_user(db, user_data)
    return user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """تسجيل الدخول"""
    user = get_user_by_username(db, form_data.username)
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="اسم المستخدم أو كلمة المرور غير صحيحة",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="الحساب غير مفعل"
        )
    
    # إنشاء رمز الوصول
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """جلب معلومات المستخدم الحالي"""
    return current_user

@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user)
):
    """تسجيل الخروج"""
    # في النسخة البسيطة، لا نحتاج لعمل شيء خاص
    # في النسخة المتقدمة، يمكن إضافة قائمة سوداء للرموز
    return {"message": "تم تسجيل الخروج بنجاح"}

@router.post("/refresh", response_model=Token)
def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """تجديد رمز الوصول"""
    access_token = create_access_token(data={"sub": current_user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": current_user
    }
