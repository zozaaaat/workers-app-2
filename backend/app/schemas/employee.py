from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class EmployeeStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINATED = "terminated"
    SUSPENDED = "suspended"
    ON_LEAVE = "on_leave"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"

class MaritalStatus(str, Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"

class EmployeeBase(BaseModel):
    # معلومات شخصية
    first_name: str = Field(..., min_length=2, max_length=50, description="الاسم الأول")
    last_name: str = Field(..., min_length=2, max_length=50, description="الاسم الأخير")
    middle_name: Optional[str] = Field(None, max_length=50, description="الاسم الأوسط")
    arabic_name: Optional[str] = Field(None, max_length=100, description="الاسم بالعربية")
    
    # هوية
    national_id: Optional[str] = Field(None, max_length=20, description="رقم الهوية الوطنية")
    passport_number: Optional[str] = Field(None, max_length=20, description="رقم جواز السفر")
    iqama_number: Optional[str] = Field(None, max_length=20, description="رقم الإقامة")
    
    # معلومات شخصية
    date_of_birth: Optional[date] = Field(None, description="تاريخ الميلاد")
    place_of_birth: Optional[str] = Field(None, max_length=100, description="مكان الميلاد")
    nationality: Optional[str] = Field(None, max_length=50, description="الجنسية")
    gender: Optional[Gender] = Field(None, description="الجنس")
    marital_status: Optional[MaritalStatus] = Field(None, description="الحالة الاجتماعية")
    
    # تواصل
    personal_email: Optional[EmailStr] = Field(None, description="البريد الإلكتروني الشخصي")
    phone_number: Optional[str] = Field(None, max_length=20, description="رقم الهاتف")
    address: Optional[str] = Field(None, max_length=500, description="العنوان")
    
    # معلومات وظيفية
    position: Optional[str] = Field(None, max_length=100, description="المنصب")
    department: Optional[str] = Field(None, max_length=100, description="القسم")
    direct_manager_id: Optional[int] = Field(None, description="معرف المدير المباشر")
    
    # راتب ومزايا
    basic_salary: Optional[float] = Field(None, ge=0, description="الراتب الأساسي")
    allowances: Optional[float] = Field(None, ge=0, description="البدلات")
    insurance_number: Optional[str] = Field(None, max_length=50, description="رقم التأمين")
    bank_account: Optional[str] = Field(None, max_length=50, description="رقم الحساب البنكي")
    
    # تواريخ مهمة
    hire_date: Optional[date] = Field(None, description="تاريخ التوظيف")
    contract_start_date: Optional[date] = Field(None, description="تاريخ بداية العقد")
    contract_end_date: Optional[date] = Field(None, description="تاريخ انتهاء العقد")
    work_permit_expiry: Optional[date] = Field(None, description="تاريخ انتهاء رخصة العمل")
    iqama_expiry: Optional[date] = Field(None, description="تاريخ انتهاء الإقامة")
    passport_expiry: Optional[date] = Field(None, description="تاريخ انتهاء جواز السفر")
    
    # حالة الموظف
    status: EmployeeStatus = Field(EmployeeStatus.ACTIVE, description="حالة الموظف")
    
    # جهة اتصال طوارئ
    emergency_contact_name: Optional[str] = Field(None, max_length=100, description="اسم جهة الاتصال للطوارئ")
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50, description="صلة القرابة")
    emergency_contact_phone: Optional[str] = Field(None, max_length=20, description="رقم هاتف الطوارئ")
    
    # ملاحظات
    notes: Optional[str] = Field(None, max_length=1000, description="ملاحظات")

    @validator('national_id')
    def validate_national_id(cls, v):
        if v and len(v) < 8:
            raise ValueError('رقم الهوية الوطنية يجب أن يكون 8 أرقام على الأقل')
        return v

    @validator('basic_salary')
    def validate_salary(cls, v):
        if v is not None and v < 0:
            raise ValueError('الراتب لا يمكن أن يكون سالب')
        return v

class EmployeeCreate(EmployeeBase):
    user_id: Optional[int] = Field(None, description="معرف المستخدم المرتبط")
    company_id: int = Field(..., description="معرف الشركة")

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    middle_name: Optional[str] = Field(None, max_length=50)
    arabic_name: Optional[str] = Field(None, max_length=100)
    national_id: Optional[str] = Field(None, max_length=20)
    passport_number: Optional[str] = Field(None, max_length=20)
    iqama_number: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    place_of_birth: Optional[str] = Field(None, max_length=100)
    nationality: Optional[str] = Field(None, max_length=50)
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    personal_email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)
    position: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    direct_manager_id: Optional[int] = None
    basic_salary: Optional[float] = Field(None, ge=0)
    allowances: Optional[float] = Field(None, ge=0)
    insurance_number: Optional[str] = Field(None, max_length=50)
    bank_account: Optional[str] = Field(None, max_length=50)
    hire_date: Optional[date] = None
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    work_permit_expiry: Optional[date] = None
    iqama_expiry: Optional[date] = None
    passport_expiry: Optional[date] = None
    status: Optional[EmployeeStatus] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = Field(None, max_length=1000)

class EmployeeRead(EmployeeBase):
    id: int
    user_id: Optional[int]
    company_id: int
    employee_number: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    # حقول محسوبة
    full_name: Optional[str] = None
    age: Optional[int] = None
    years_of_service: Optional[float] = None
    total_salary: Optional[float] = None
    
    # بيانات مرتبطة - تم تبسيطها لتجنب circular imports
    # user: Optional["UserSummary"] = None
    # company: Optional["CompanySummary"] = None
    # direct_manager: Optional["EmployeeSummary"] = None
    # subordinates: Optional[List["EmployeeSummary"]] = None

    class Config:
        from_attributes = True

class EmployeeResponse(EmployeeRead):
    """استجابة الموظف - نفس EmployeeRead"""
    pass

class EmployeeSummary(BaseModel):
    """ملخص الموظف للاستخدام في القوائم والمراجع"""
    id: int
    employee_number: Optional[str]
    first_name: str
    last_name: str
    full_name: Optional[str]
    position: Optional[str]
    department: Optional[str]
    status: EmployeeStatus
    avatar: Optional[str] = None

    class Config:
        from_attributes = True

class EmployeeSearchFilters(BaseModel):
    """مرشحات البحث للموظفين"""
    search: Optional[str] = None  # البحث في الاسم أو رقم الموظف
    department: Optional[str] = None
    position: Optional[str] = None
    status: Optional[EmployeeStatus] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    nationality: Optional[str] = None
    direct_manager_id: Optional[int] = None
    company_id: Optional[int] = None
    hire_date_from: Optional[date] = None
    hire_date_to: Optional[date] = None
    contract_expiry_from: Optional[date] = None
    contract_expiry_to: Optional[date] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    has_expiring_documents: Optional[bool] = None  # وثائق تنتهي قريباً
    page: int = 1
    page_size: int = 20
    sort_by: str = "created_at"
    sort_order: str = "desc"

class EmployeeListResponse(BaseModel):
    """استجابة قائمة الموظفين مع التصفح"""
    employees: List[EmployeeRead]
    total: int
    page: int
    page_size: int
    total_pages: int

class EmployeeStats(BaseModel):
    """إحصائيات الموظفين"""
    total_employees: int
    active_employees: int
    inactive_employees: int
    terminated_employees: int
    suspended_employees: int
    on_leave_employees: int
    departments: List[str]
    positions: List[str]
    avg_salary: Optional[float]
    total_salary_cost: Optional[float]

class EmployeeExpiryAlert(BaseModel):
    """تنبيه انتهاء وثائق الموظف"""
    employee_id: int
    employee_name: str
    document_type: str
    expiry_date: date
    days_until_expiry: int
    is_expired: bool

class EmployeeExpiryReport(BaseModel):
    """تقرير وثائق الموظفين المنتهية والتي ستنتهي قريباً"""
    expired_documents: List[EmployeeExpiryAlert]
    expiring_soon: List[EmployeeExpiryAlert]  # خلال 30 يوم
    expiring_later: List[EmployeeExpiryAlert]  # خلال 90 يوم
