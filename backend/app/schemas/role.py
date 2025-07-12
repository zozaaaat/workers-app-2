from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

class RoleBase(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    is_active: bool = True
    priority: int = 0

    @validator('name')
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError('اسم الدور يجب أن يكون حرفين على الأقل')
        if len(v) > 50:
            raise ValueError('اسم الدور يجب أن يكون 50 حرف كحد أقصى')
        # التحقق من أن الاسم يحتوي على أحرف وأرقام و _ فقط
        if not v.replace('_', '').isalnum():
            raise ValueError('اسم الدور يجب أن يحتوي على أحرف وأرقام و _ فقط')
        return v.lower()

    @validator('display_name')
    def validate_display_name(cls, v):
        if len(v) < 2:
            raise ValueError('الاسم المعروض يجب أن يكون حرفين على الأقل')
        if len(v) > 100:
            raise ValueError('الاسم المعروض يجب أن يكون 100 حرف كحد أقصى')
        return v

    @validator('priority')
    def validate_priority(cls, v):
        if v < 0:
            raise ValueError('أولوية الدور يجب أن تكون رقم موجب')
        return v

class RoleCreate(RoleBase):
    permission_ids: List[int] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None

class RoleRead(RoleBase):
    id: int
    is_system: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # العلاقات
    permissions: List['PermissionRead'] = []
    user_count: Optional[int] = 0  # عدد المستخدمين الذين لديهم هذا الدور

    class Config:
        from_attributes = True

class RoleWithUsers(RoleRead):
    """دور مع قائمة المستخدمين"""
    users: List['UserSummary'] = []

class RolePermissionUpdate(BaseModel):
    """تحديث صلاحيات الدور"""
    permission_ids: List[int] = []

class RoleSearchFilters(BaseModel):
    """مرشحات البحث للأدوار"""
    search: Optional[str] = None  # البحث في الاسم أو الوصف
    is_active: Optional[bool] = None
    is_system: Optional[bool] = None
    page: int = 1
    page_size: int = 10

class RoleListResponse(BaseModel):
    """استجابة قائمة الأدوار مع التصفح"""
    roles: List[RoleRead]
    total: int
    page: int
    page_size: int
    total_pages: int

class RoleSummary(BaseModel):
    """ملخص الدور للاستخدام في القوائم المنسدلة"""
    id: int
    name: str
    display_name: str
    priority: int
    is_system: bool

    class Config:
        from_attributes = True

class RoleStats(BaseModel):
    """إحصائيات الأدوار"""
    total_roles: int
    system_roles: int
    custom_roles: int
    active_roles: int
    inactive_roles: int
