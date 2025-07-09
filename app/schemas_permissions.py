from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


# -----------------------------
# Enums للثوابت
# -----------------------------
class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ActionType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"


# -----------------------------
# Permission Schemas
# -----------------------------
class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None
    module: str


class PermissionCreate(PermissionBase):
    pass


class Permission(PermissionBase):
    id: int

    class Config:
        from_attributes = True
        orm_mode = True  # For backward compatibility


# -----------------------------
# User Permission Schemas
# -----------------------------
class UserPermissionBase(BaseModel):
    permission_id: int
    granted: bool = True


class UserPermissionCreate(UserPermissionBase):
    user_id: int


class UserPermission(UserPermissionBase):
    id: int
    user_id: int
    permission: Permission
    granted_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True  # For backward compatibility


# -----------------------------
# User Schemas (Updated)
# -----------------------------
class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    department: Optional[str] = None
    role: UserRole = UserRole.EMPLOYEE


class UserCreate(UserBase):
    password: str
    permissions: Optional[List[int]] = []  # قائمة معرفات الأذونات


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    permissions: Optional[List[int]] = None


class UserOut(UserBase):
    id: int
    is_active: int  # Changed from bool to int to match database schema
    created_at: Optional[date] = None  # Changed from datetime to date
    # permissions: List["UserPermission"] = []  # Temporarily commented out

    class Config:
        from_attributes = True
        orm_mode = True  # For backward compatibility


# -----------------------------
# Approval Request Schemas
# -----------------------------
class ApprovalRequestBase(BaseModel):
    action_type: ActionType
    entity_type: str
    entity_id: Optional[int] = None
    new_data: Dict[str, Any]
    old_data: Optional[Dict[str, Any]] = None
    description: Optional[str] = None


class ApprovalRequestCreate(ApprovalRequestBase):
    pass


class ApprovalRequestUpdate(BaseModel):
    status: ApprovalStatus
    review_notes: Optional[str] = None


class ApprovalRequest(ApprovalRequestBase):
    id: int
    user_id: int
    status: ApprovalStatus
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------
# Activity Log Schemas
# -----------------------------
class ActivityLogBase(BaseModel):
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    description: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class ActivityLogCreate(ActivityLogBase):
    user_id: int


class ActivityLog(ActivityLogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# -----------------------------
# Permission Check Response
# -----------------------------
class PermissionCheck(BaseModel):
    has_permission: bool
    requires_approval: bool = False
    message: Optional[str] = None
