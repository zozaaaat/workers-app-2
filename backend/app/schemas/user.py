from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True

    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
        if len(v) > 50:
            raise ValueError('اسم المستخدم يجب أن يكون 50 حرف كحد أقصى')
        return v

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        return v

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    """استجابة المستخدم"""
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    """رمز الوصول"""
    access_token: str
    token_type: str = "bearer"
    
class LoginResponse(BaseModel):
    """استجابة تسجيل الدخول"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserLogin(BaseModel):
    """بيانات تسجيل الدخول"""
    username: str
    password: str

class UserSearchFilters(BaseModel):
    """مرشحات البحث للمستخدمين"""
    search: Optional[str] = None  # البحث في الاسم أو البريد الإلكتروني
    is_active: Optional[bool] = None
    page: int = 1
    page_size: int = 10
    username: str
    full_name: Optional[str]
    email: str
    avatar: Optional[str]
    role_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
