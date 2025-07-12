from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    # وثائق شخصية
    NATIONAL_ID = "national_id"
    PASSPORT = "passport"
    BIRTH_CERTIFICATE = "birth_certificate"
    MARRIAGE_CERTIFICATE = "marriage_certificate"
    EDUCATION_CERTIFICATE = "education_certificate"
    EXPERIENCE_CERTIFICATE = "experience_certificate"
    
    # وثائق عمل
    EMPLOYMENT_CONTRACT = "employment_contract"
    JOB_OFFER = "job_offer"
    RESIGNATION_LETTER = "resignation_letter"
    PERFORMANCE_REVIEW = "performance_review"
    SALARY_CERTIFICATE = "salary_certificate"
    
    # وثائق قانونية
    IQAMA = "iqama"
    WORK_PERMIT = "work_permit"
    VISA = "visa"
    LICENSE = "license"
    PERMIT = "permit"
    
    # وثائق مالية
    BANK_STATEMENT = "bank_statement"
    SALARY_SLIP = "salary_slip"
    TAX_DOCUMENT = "tax_document"
    INVOICE = "invoice"
    RECEIPT = "receipt"
    
    # وثائق طبية
    MEDICAL_REPORT = "medical_report"
    HEALTH_CERTIFICATE = "health_certificate"
    VACCINATION_RECORD = "vaccination_record"
    
    # وثائق شركة
    COMPANY_REGISTRATION = "company_registration"
    COMMERCIAL_REGISTER = "commercial_register"
    TAX_CERTIFICATE = "tax_certificate"
    BUSINESS_LICENSE = "business_license"
    
    # أخرى
    OTHER = "other"

class EntityType(str, Enum):
    USER = "user"
    EMPLOYEE = "employee"
    COMPANY = "company"
    LICENSE = "license"
    LEAVE = "leave"
    DEDUCTION = "deduction"
    PERFORMANCE = "performance"
    TRAINING = "training"
    REWARD = "reward"
    ABSENCE = "absence"
    MEDICAL = "medical"

class DocumentStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    REJECTED = "rejected"

class DocumentBase(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255, description="اسم الملف")
    file_type: DocumentType = Field(..., description="نوع الوثيقة")
    custom_type_name: Optional[str] = Field(None, max_length=100, description="اسم مخصص لنوع الوثيقة")
    entity_type: EntityType = Field(..., description="نوع الكيان المرتبط")
    entity_id: int = Field(..., description="معرف الكيان المرتبط")
    
    title: Optional[str] = Field(None, max_length=200, description="عنوان الوثيقة")
    description: Optional[str] = Field(None, max_length=500, description="وصف الوثيقة")
    
    # معلومات الملف
    file_size: Optional[int] = Field(None, description="حجم الملف بالبايت")
    mime_type: Optional[str] = Field(None, max_length=100, description="نوع MIME للملف")
    file_extension: Optional[str] = Field(None, max_length=10, description="امتداد الملف")
    
    # الحالة والتحقق
    status: DocumentStatus = Field(DocumentStatus.ACTIVE, description="حالة الوثيقة")
    is_verified: bool = Field(False, description="مُتحقق منها")
    verification_notes: Optional[str] = Field(None, max_length=500, description="ملاحظات التحقق")
    
    # ملاحظات
    notes: Optional[str] = Field(None, max_length=1000, description="ملاحظات")
    tags: Optional[str] = Field(None, max_length=200, description="علامات (مفصولة بفواصل)")

    @validator('filename')
    def validate_filename(cls, v):
        # إزالة المسافات من البداية والنهاية
        v = v.strip()
        if not v:
            raise ValueError('اسم الملف مطلوب')
        
        # التحقق من الأحرف غير المسموحة
        invalid_chars = ['<', '>', ':', '"', '|', '?', '*']
        for char in invalid_chars:
            if char in v:
                raise ValueError(f'اسم الملف يحتوي على حرف غير مسموح: {char}')
        
        return v

    @validator('file_size')
    def validate_file_size(cls, v):
        if v is not None and v < 0:
            raise ValueError('حجم الملف لا يمكن أن يكون سالب')
        # حد أقصى 100 ميجابايت
        max_size = 100 * 1024 * 1024  # 100 MB
        if v is not None and v > max_size:
            raise ValueError(f'حجم الملف يتجاوز الحد المسموح ({max_size} بايت)')
        return v

class DocumentUpload(DocumentBase):
    """مخطط خاص برفع الوثائق - متوافق مع FileUpload component"""
    url: Optional[str] = Field(None, max_length=500, description="رابط الملف")
    uploaded_by: Optional[int] = Field(None, description="معرف المستخدم الذي رفع الملف")

class DocumentCreate(DocumentBase):
    url: str = Field(..., max_length=500, description="رابط الملف")
    uploaded_by: int = Field(..., description="معرف المستخدم الذي رفع الملف")

class DocumentUpdate(BaseModel):
    filename: Optional[str] = Field(None, min_length=1, max_length=255)
    file_type: Optional[DocumentType] = None
    custom_type_name: Optional[str] = Field(None, max_length=100)
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[DocumentStatus] = None
    is_verified: Optional[bool] = None
    verification_notes: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    tags: Optional[str] = Field(None, max_length=200)

class DocumentRead(DocumentBase):
    id: int
    url: str
    uploaded_by: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    # بيانات مرتبطة - تم تبسيطها لتجنب circular imports
    # uploader: Optional["UserSummary"] = None
    # verifier: Optional["UserSummary"] = None
    
    # حقول محسوبة
    file_size_formatted: Optional[str] = None
    is_image: Optional[bool] = None
    is_pdf: Optional[bool] = None
    download_url: Optional[str] = None
    preview_url: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentResponse(DocumentRead):
    """استجابة الوثيقة - نفس DocumentRead"""
    pass

class DocumentSummary(BaseModel):
    """ملخص الوثيقة للاستخدام في القوائم والمراجع"""
    id: int
    filename: str
    file_type: DocumentType
    custom_type_name: Optional[str]
    title: Optional[str]
    status: DocumentStatus
    is_verified: bool
    file_size: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentSearchFilters(BaseModel):
    """مرشحات البحث للوثائق"""
    search: Optional[str] = None  # البحث في اسم الملف أو العنوان
    file_type: Optional[DocumentType] = None
    entity_type: Optional[EntityType] = None
    entity_id: Optional[int] = None
    status: Optional[DocumentStatus] = None
    is_verified: Optional[bool] = None
    uploaded_by: Optional[int] = None
    mime_type: Optional[str] = None
    file_extension: Optional[str] = None
    tags: Optional[str] = None
    uploaded_from: Optional[datetime] = None
    uploaded_to: Optional[datetime] = None
    min_file_size: Optional[int] = None
    max_file_size: Optional[int] = None
    page: int = 1
    page_size: int = 20
    sort_by: str = "created_at"
    sort_order: str = "desc"

class DocumentListResponse(BaseModel):
    """استجابة قائمة الوثائق مع التصفح"""
    documents: List[DocumentRead]
    total: int
    page: int
    page_size: int
    total_pages: int

class DocumentStats(BaseModel):
    """إحصائيات الوثائق"""
    total_documents: int
    active_documents: int
    archived_documents: int
    deleted_documents: int
    verified_documents: int
    pending_verification: int
    rejected_documents: int
    total_file_size: int
    file_types: List[str]
    entity_types: List[str]
    most_used_types: List[Dict[str, Any]]

class DocumentVerification(BaseModel):
    """تحقق من الوثيقة"""
    is_verified: bool = Field(..., description="حالة التحقق")
    verification_notes: Optional[str] = Field(None, max_length=500, description="ملاحظات التحقق")

class DocumentBulkAction(BaseModel):
    """إجراءات مجمعة على الوثائق"""
    document_ids: List[int]
    action: str  # verify, reject, archive, delete, restore
    action_data: Optional[Dict[str, Any]] = None

class DocumentEntityGroup(BaseModel):
    """وثائق مجمعة حسب الكيان"""
    entity_type: EntityType
    entity_id: int
    entity_name: Optional[str]
    documents: List[DocumentSummary]
    total_documents: int
    verified_documents: int
    pending_documents: int

class DocumentTypeGroup(BaseModel):
    """وثائق مجمعة حسب النوع"""
    file_type: DocumentType
    type_name: str
    documents: List[DocumentSummary]
    count: int

class DocumentPreview(BaseModel):
    """معاينة الوثيقة"""
    id: int
    filename: str
    file_type: DocumentType
    mime_type: Optional[str]
    file_size: Optional[int]
    preview_url: Optional[str]
    download_url: Optional[str]
    can_preview: bool
    is_image: bool
    is_pdf: bool

class DocumentUploadProgress(BaseModel):
    """تقدم رفع الملف"""
    filename: str
    total_size: int
    uploaded_size: int
    progress_percentage: float
    status: str  # uploading, processing, completed, failed
    error_message: Optional[str] = None
