from pydantic import BaseModel
from typing import Optional

class EmployeeBase(BaseModel):
    full_name: str
    email: str

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str
    employee_id: Optional[int]

class User(UserBase):
    id: int
    employee_id: Optional[int]

    class Config:
        orm_mode = True
