from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "employee"  # Add role to base schema

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }
    class Config:
        orm_mode = True
