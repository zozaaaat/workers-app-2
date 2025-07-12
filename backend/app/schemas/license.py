from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class LicenseType(str, Enum):
    DRIVING_LICENSE = "driving_license"
    PROFESSIONAL_LICENSE = "professional_license"
    HEALTH_CERTIFICATE = "health_certificate"
    SAFETY_CERTIFICATE = "safety_certificate"
    WORK_PERMIT = "work_permit"
    RESIDENCE_PERMIT = "residence_permit"
    BUSINESS_LICENSE = "business_license"
    TRADE_LICENSE = "trade_license"
    INDUSTRIAL_LICENSE = "industrial_license"
    CONSTRUCTION_PERMIT = "construction_permit"
    ENVIRONMENTAL_PERMIT = "environmental_permit"
    OTHER = "other"

class LicenseStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    PENDING_RENEWAL = "pending_renewal"
    UNDER_REVIEW = "under_review"

class LicenseBase(BaseModel):
    license_number: str = Field(..., min_length=3, max_length=100, description="رقم الرخصة")
    license_type: LicenseType = Field(..., description="نوع الرخصة")
    custom_type_name: Optional[str] = Field(None, max_length=100, description="اسم مخصص لنوع الرخصة")
    title: str = Field(..., min_length=2, max_length=200, description="عنوان الرخصة")
    description: Optional[str] = Field(None, max_length=500, description="وصف الرخصة")
    
    # معلومات الإصدار
    issuing_authority: str = Field(..., min_length=2, max_length=200, description="جهة الإصدار")
    issuing_country: Optional[str] = Field(None, max_length=100, description="بلد الإصدار")
    issuing_city: Optional[str] = Field(None, max_length=100, description="مدينة الإصدار")
    
    # التواريخ
    issue_date: date = Field(..., description="تاريخ الإصدار")
    expiry_date: date = Field(..., description="تاريخ الانتهاء")
    last_renewal_date: Optional[date] = Field(None, description="تاريخ آخر تجديد")
    next_renewal_date: Optional[date] = Field(None, description="تاريخ التجديد التالي")
    
    # التكلفة
    issue_cost: Optional[float] = Field(None, ge=0, description="تكلفة الإصدار")
    renewal_cost: Optional[float] = Field(None, ge=0, description="تكلفة التجديد")
    currency: str = Field("SAR", max_length=10, description="العملة")
    
    # الحالة والتنبيهات
    status: LicenseStatus = Field(LicenseStatus.ACTIVE, description="حالة الرخصة")
    is_renewable: bool = Field(True, description="قابلة للتجديد")
    renewal_period_days: Optional[int] = Field(None, ge=1, description="فترة التجديد بالأيام")
    alert_before_expiry_days: int = Field(30, ge=1, description="التنبيه قبل انتهاء الرخصة بالأيام")
    
    # ملاحظات
    notes: Optional[str] = Field(None, max_length=1000, description="ملاحظات")

    @validator('expiry_date')
    def validate_expiry_date(cls, v, values):
        if 'issue_date' in values and v <= values['issue_date']:
            raise ValueError('تاريخ الانتهاء يجب أن يكون بعد تاريخ الإصدار')
        return v

    @validator('license_number')
    def validate_license_number(cls, v):
        # إزالة المسافات والتحقق من الطول
        v = v.strip()
        if len(v) < 3:
            raise ValueError('رقم الرخصة يجب أن يكون 3 أحرف على الأقل')
        return v

class LicenseCreate(LicenseBase):
    company_id: Optional[int] = Field(None, description="معرف الشركة")
    employee_id: Optional[int] = Field(None, description="معرف الموظف")

    @validator('company_id', 'employee_id')
    def validate_entity(cls, v, values):
        # يجب أن تكون الرخصة مرتبطة بشركة أو موظف
        company_id = values.get('company_id')
        employee_id = values.get('employee_id')
        
        if not company_id and not employee_id:
            raise ValueError('الرخصة يجب أن تكون مرتبطة بشركة أو موظف')
        
        if company_id and employee_id:
            raise ValueError('الرخصة لا يمكن أن تكون مرتبطة بشركة وموظف في نفس الوقت')
        
        return v

class LicenseUpdate(BaseModel):
    license_number: Optional[str] = Field(None, min_length=3, max_length=100)
    license_type: Optional[LicenseType] = None
    custom_type_name: Optional[str] = Field(None, max_length=100)
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    issuing_authority: Optional[str] = Field(None, min_length=2, max_length=200)
    issuing_country: Optional[str] = Field(None, max_length=100)
    issuing_city: Optional[str] = Field(None, max_length=100)
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    last_renewal_date: Optional[date] = None
    next_renewal_date: Optional[date] = None
    issue_cost: Optional[float] = Field(None, ge=0)
    renewal_cost: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=10)
    status: Optional[LicenseStatus] = None
    is_renewable: Optional[bool] = None
    renewal_period_days: Optional[int] = Field(None, ge=1)
    alert_before_expiry_days: Optional[int] = Field(None, ge=1)
    notes: Optional[str] = Field(None, max_length=1000)

class LicenseRead(LicenseBase):
    id: int
    company_id: Optional[int]
    employee_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    # حقول محسوبة
    days_until_expiry: Optional[int] = None
    is_expired: Optional[bool] = None
    is_expiring_soon: Optional[bool] = None
    renewal_required: Optional[bool] = None
    
    # بيانات مرتبطة - تم تبسيطها لتجنب circular imports
    # company: Optional["CompanySummary"] = None
    # employee: Optional["EmployeeSummary"] = None
    # documents: Optional[List["DocumentSummary"]] = None

    class Config:
        from_attributes = True

class LicenseResponse(LicenseRead):
    """استجابة الرخصة - نفس LicenseRead"""
    pass

class LicenseSummary(BaseModel):
    """ملخص الرخصة للاستخدام في القوائم والمراجع"""
    id: int
    license_number: str
    license_type: LicenseType
    custom_type_name: Optional[str]
    title: str
    status: LicenseStatus
    expiry_date: date
    days_until_expiry: Optional[int]
    is_expired: Optional[bool]

    class Config:
        from_attributes = True

class LicenseSearchFilters(BaseModel):
    """مرشحات البحث للرخص"""
    search: Optional[str] = None  # البحث في رقم الرخصة أو العنوان
    license_type: Optional[LicenseType] = None
    status: Optional[LicenseStatus] = None
    issuing_authority: Optional[str] = None
    issuing_country: Optional[str] = None
    company_id: Optional[int] = None
    employee_id: Optional[int] = None
    issue_date_from: Optional[date] = None
    issue_date_to: Optional[date] = None
    expiry_date_from: Optional[date] = None
    expiry_date_to: Optional[date] = None
    is_expired: Optional[bool] = None
    is_expiring_soon: Optional[bool] = None  # خلال alert_before_expiry_days
    is_renewable: Optional[bool] = None
    min_cost: Optional[float] = None
    max_cost: Optional[float] = None
    page: int = 1
    page_size: int = 20
    sort_by: str = "expiry_date"
    sort_order: str = "asc"

class LicenseListResponse(BaseModel):
    """استجابة قائمة الرخص مع التصفح"""
    licenses: List[LicenseRead]
    total: int
    page: int
    page_size: int
    total_pages: int

class LicenseStats(BaseModel):
    """إحصائيات الرخص"""
    total_licenses: int
    active_licenses: int
    expired_licenses: int
    suspended_licenses: int
    cancelled_licenses: int
    pending_renewal_licenses: int
    expiring_soon_licenses: int
    license_types: List[str]
    issuing_authorities: List[str]
    total_issue_cost: Optional[float]
    total_renewal_cost: Optional[float]

class LicenseExpiryAlert(BaseModel):
    """تنبيه انتهاء الرخصة"""
    license_id: int
    license_number: str
    license_type: LicenseType
    title: str
    entity_type: str  # company أو employee
    entity_name: str
    expiry_date: date
    days_until_expiry: int
    is_expired: bool
    alert_level: str  # critical, warning, info

class LicenseExpiryReport(BaseModel):
    """تقرير الرخص المنتهية والتي ستنتهي قريباً"""
    expired_licenses: List[LicenseExpiryAlert]
    critical_alerts: List[LicenseExpiryAlert]  # خلال 7 أيام
    warning_alerts: List[LicenseExpiryAlert]   # خلال 30 يوم
    info_alerts: List[LicenseExpiryAlert]      # خلال 90 يوم

class LicenseRenewal(BaseModel):
    """تجديد الرخصة"""
    renewal_date: date = Field(..., description="تاريخ التجديد")
    new_expiry_date: date = Field(..., description="تاريخ الانتهاء الجديد")
    renewal_cost: Optional[float] = Field(None, ge=0, description="تكلفة التجديد")
    renewal_notes: Optional[str] = Field(None, max_length=500, description="ملاحظات التجديد")

    @validator('new_expiry_date')
    def validate_new_expiry_date(cls, v, values):
        if 'renewal_date' in values and v <= values['renewal_date']:
            raise ValueError('تاريخ الانتهاء الجديد يجب أن يكون بعد تاريخ التجديد')
        return v

class LicenseBulkAction(BaseModel):
    """إجراءات مجمعة على الرخص"""
    license_ids: List[int]
    action: str  # renew, suspend, activate, cancel
    action_data: Optional[Dict[str, Any]] = None
