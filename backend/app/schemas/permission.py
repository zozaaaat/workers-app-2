from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

class PermissionBase(BaseModel):
    key: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    module: Optional[str] = None
    is_active: bool = True
    priority: int = 0

    @validator('key')
    def validate_key(cls, v):
        if len(v) < 3:
            raise ValueError('مفتاح الصلاحية يجب أن يكون 3 أحرف على الأقل')
        if len(v) > 100:
            raise ValueError('مفتاح الصلاحية يجب أن يكون 100 حرف كحد أقصى')
        # التحقق من صيغة المفتاح (module.action)
        if '.' not in v:
            raise ValueError('مفتاح الصلاحية يجب أن يكون بصيغة module.action')
        return v.lower()

    @validator('name')
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError('اسم الصلاحية يجب أن يكون حرفين على الأقل')
        if len(v) > 100:
            raise ValueError('اسم الصلاحية يجب أن يكون 100 حرف كحد أقصى')
        return v

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    key: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    module: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None

class PermissionRead(PermissionBase):
    id: int
    is_system: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PermissionGrouped(BaseModel):
    """صلاحيات مجمعة حسب الفئة"""
    category: str
    category_name: str
    permissions: List[PermissionRead]

class PermissionsByModule(BaseModel):
    """صلاحيات مجمعة حسب الوحدة"""
    module: str
    module_name: str
    categories: List[PermissionGrouped]

class PermissionSearchFilters(BaseModel):
    """مرشحات البحث للصلاحيات"""
    search: Optional[str] = None  # البحث في المفتاح أو الاسم
    category: Optional[str] = None
    module: Optional[str] = None
    is_active: Optional[bool] = None
    is_system: Optional[bool] = None
    page: int = 1
    page_size: int = 50

class PermissionListResponse(BaseModel):
    """استجابة قائمة الصلاحيات مع التصفح"""
    permissions: List[PermissionRead]
    total: int
    page: int
    page_size: int
    total_pages: int

class PermissionSummary(BaseModel):
    """ملخص الصلاحية للاستخدام في القوائم المنسدلة"""
    id: int
    key: str
    name: str
    category: Optional[str]
    module: Optional[str]

    class Config:
        from_attributes = True

class PermissionStats(BaseModel):
    """إحصائيات الصلاحيات"""
    total_permissions: int
    system_permissions: int
    custom_permissions: int
    active_permissions: int
    inactive_permissions: int
    categories: List[str]
    modules: List[str]

class PermissionBulkCreate(BaseModel):
    """إنشاء عدة صلاحيات دفعة واحدة"""
    permissions: List[PermissionCreate]

class PermissionCheck(BaseModel):
    """التحقق من صلاحية معينة"""
    permission_key: str
    user_id: Optional[int] = None
    role_id: Optional[int] = None

class PermissionCheckResponse(BaseModel):
    """استجابة التحقق من الصلاحية"""
    has_permission: bool
    source: Optional[str] = None  # role, user, superuser
