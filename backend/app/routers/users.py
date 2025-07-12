from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.core.security import get_current_user
from app.crud.user import get_users, get_user_by_id, create_user, update_user, delete_user

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب جميع المستخدمين"""
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب مستخدم بالمعرف"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    return user

@router.post("/", response_model=UserResponse)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """إنشاء مستخدم جديد"""
    return create_user(db, user)

@router.put("/{user_id}", response_model=UserResponse)
def update_user_info(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """تحديث مستخدم"""
    user = update_user(db, user_id, user_update.dict(exclude_unset=True))
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    return user

@router.delete("/{user_id}")
def delete_user_account(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف مستخدم"""
    user = delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    return {"message": "تم حذف المستخدم بنجاح"}
