from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class ArchiveCategory(str, Enum):
    model_config = {"from_attributes": True}
    contracts = "contracts"
    receipts = "receipts"
    insurances = "insurances"
    guarantees = "guarantees"
    legal_documents = "legal_documents"
    financial_documents = "financial_documents"
    other = "other"

class ArchiveType(str, Enum):
    model_config = {"from_attributes": True}
    rent_contract = "rent_contract"
    rent_receipt = "rent_receipt"
    insurance_policy = "insurance_policy"
    bank_guarantee = "bank_guarantee"
    electricity_bill = "electricity_bill"
    water_bill = "water_bill"
    maintenance_contract = "maintenance_contract"
    service_contract = "service_contract"
    other = "other"

class DocumentStatus(str, Enum):
    model_config = {"from_attributes": True}
    active = "active"
    expired = "expired"
    cancelled = "cancelled"
    renewed = "renewed"

class PaymentMethod(str, Enum):
    model_config = {"from_attributes": True}
    cash = "cash"
    bank_transfer = "bank_transfer"
    check = "check"
    credit_card = "credit_card"
    other = "other"

# License Document Schemas

class LicenseDocumentBase(BaseModel):
    model_config = {"from_attributes": True}
    document_type: str = Field(..., description="نوع المستند")
    description: Optional[str] = Field(None, description="وصف المستند")
    license_number: Optional[str] = Field(None, description="رقم الترخيص")
    issue_date: Optional[date] = Field(None, description="تاريخ الإصدار")
    expiry_date: Optional[date] = Field(None, description="تاريخ الانتهاء")
    issuing_authority: Optional[str] = Field(None, description="الجهة المصدرة")
    license_status: Optional[str] = Field(None, description="حالة الترخيص")

class LicenseDocumentCreate(LicenseDocumentBase):
    model_config = {"from_attributes": True}
    license_id: int = Field(..., description="معرف الترخيص")
    original_filename: str = Field(..., description="اسم الملف الأصلي")

class LicenseDocumentUpdate(BaseModel):
    model_config = {"from_attributes": True}
    document_type: Optional[str] = None
    description: Optional[str] = None
    license_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    issuing_authority: Optional[str] = None
    license_status: Optional[str] = None

class LicenseDocumentResponse(LicenseDocumentBase):
    model_config = {"from_attributes": True}
    id: int
    license_id: int
    filename: str
    original_filename: str
    filepath: str
    filetype: str
    upload_date: datetime
    extracted_text: Optional[str] = None
    
    # معلومات الإشعارات
    notification_sent: bool = False
    notification_6_months: bool = False
    notification_3_months: bool = False
    notification_1_month: bool = False
    notification_1_week: bool = False

class DocumentArchiveBase(BaseModel):
    model_config = {"from_attributes": True}
    archive_type: ArchiveType = Field(..., description="نوع المستند")
    category: ArchiveCategory = Field(..., description="فئة المستند")
    title: str = Field(..., description="عنوان المستند")
    description: Optional[str] = Field(None, description="وصف المستند")
    contract_number: Optional[str] = Field(None, description="رقم العقد")
    amount: Optional[float] = Field(None, description="المبلغ")
    currency: str = Field("EGP", description="العملة")
    start_date: Optional[date] = Field(None, description="تاريخ البداية")
    end_date: Optional[date] = Field(None, description="تاريخ النهاية")
    party_name: Optional[str] = Field(None, description="اسم الطرف الآخر")
    party_contact: Optional[str] = Field(None, description="بيانات الاتصال")
    payment_date: Optional[date] = Field(None, description="تاريخ الدفع")
    payment_method: Optional[PaymentMethod] = Field(None, description="طريقة الدفع")
    reference_number: Optional[str] = Field(None, description="رقم المرجع")
    company_id: Optional[int] = Field(None, description="معرف الشركة")
    license_id: Optional[int] = Field(None, description="معرف الترخيص")
    is_recurring: bool = Field(False, description="متكرر")
    next_due_date: Optional[date] = Field(None, description="تاريخ الاستحقاق التالي")
    status: DocumentStatus = Field(DocumentStatus.active, description="حالة المستند")
    is_important: bool = Field(True, description="مهم للأرشيف")

class DocumentArchiveCreate(DocumentArchiveBase):
    model_config = {"from_attributes": True}
    original_filename: str = Field(..., description="اسم الملف الأصلي")

class DocumentArchiveUpdate(BaseModel):
    model_config = {"from_attributes": True}
    archive_type: Optional[ArchiveType] = None
    category: Optional[ArchiveCategory] = None
    title: Optional[str] = None
    description: Optional[str] = None
    contract_number: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    party_name: Optional[str] = None
    party_contact: Optional[str] = None
    payment_date: Optional[date] = None
    payment_method: Optional[PaymentMethod] = None
    reference_number: Optional[str] = None
    company_id: Optional[int] = None
    license_id: Optional[int] = None
    is_recurring: Optional[bool] = None
    next_due_date: Optional[date] = None
    status: Optional[DocumentStatus] = None
    is_important: Optional[bool] = None

class DocumentArchiveResponse(DocumentArchiveBase):
    model_config = {"from_attributes": True}
    id: int
    filename: str
    original_filename: str
    filepath: str
    filetype: str
    upload_date: datetime
    reminder_sent: bool = False

class LicenseTypeBase(BaseModel):
    model_config = {"from_attributes": True}
    name: str = Field(..., description="اسم نوع الترخيص")
    name_ar: str = Field(..., description="اسم نوع الترخيص بالعربية")
    description: Optional[str] = Field(None, description="وصف نوع الترخيص")
    is_main_license: bool = Field(True, description="رخصة رئيسية")
    parent_license_type_id: Optional[int] = Field(None, description="معرف النوع الأب")
    required_fields: Optional[str] = Field(None, description="الحقول المطلوبة")
    notification_periods: Optional[str] = Field(None, description="فترات الإشعار")
    is_active: bool = Field(True, description="نشط")

class LicenseTypeCreate(LicenseTypeBase):
    model_config = {"from_attributes": True}
    pass

class LicenseTypeUpdate(BaseModel):
    model_config = {"from_attributes": True}
    name: Optional[str] = None
    name_ar: Optional[str] = None
    description: Optional[str] = None
    is_main_license: Optional[bool] = None
    parent_license_type_id: Optional[int] = None
    required_fields: Optional[str] = None
    notification_periods: Optional[str] = None
    is_active: Optional[bool] = None

class LicenseTypeResponse(LicenseTypeBase):
    model_config = {"from_attributes": True}
    id: int
    sub_license_types: List['LicenseTypeResponse'] = []
class ArchiveCategoryBase(BaseModel):
    model_config = {"from_attributes": True}
    name: str = Field(..., description="اسم الفئة")
    name_ar: str = Field(..., description="اسم الفئة بالعربية")
    description: Optional[str] = Field(None, description="وصف الفئة")
    color: str = Field("#007bff", description="لون الفئة")
    icon: Optional[str] = Field(None, description="أيقونة الفئة")
    is_active: bool = Field(True, description="نشط")

class ArchiveCategoryCreate(ArchiveCategoryBase):
    model_config = {"from_attributes": True}
    pass

class ArchiveCategoryResponse(ArchiveCategoryBase):
    model_config = {"from_attributes": True}
    id: int

class ArchiveTypeBase(BaseModel):
    model_config = {"from_attributes": True}
    name: str = Field(..., description="اسم النوع")
    name_ar: str = Field(..., description="اسم النوع بالعربية")
    category_id: int = Field(..., description="معرف الفئة")
    description: Optional[str] = Field(None, description="وصف النوع")
    required_fields: Optional[str] = Field(None, description="الحقول المطلوبة")
    is_recurring: bool = Field(False, description="متكرر")
    reminder_periods: Optional[str] = Field(None, description="فترات التذكير")
    is_active: bool = Field(True, description="نشط")

class ArchiveTypeCreate(ArchiveTypeBase):
    model_config = {"from_attributes": True}
    pass

class ArchiveTypeResponse(ArchiveTypeBase):
    model_config = {"from_attributes": True}
    id: int
    category: ArchiveCategoryResponse

class DocumentStatistics(BaseModel):
    model_config = {"from_attributes": True}
    total_documents: int
    by_category: List[Dict[str, Any]]
    recurring_due: int
    expiring_contracts: int

class SearchResult(BaseModel):
    model_config = {"from_attributes": True}
    license_documents: List[LicenseDocumentResponse] = []
    archived_documents: List[DocumentArchiveResponse] = []
    total_count: int = 0

class FileUploadResponse(BaseModel):
    model_config = {"from_attributes": True}
    success: bool
    message: str
    document_id: Optional[int] = None
    filename: str

class DocumentNotification(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    type: str  # "license_expiry", "contract_expiry", "recurring_due"
    title: str
    message: str
    due_date: date
    document_id: int
    company_id: Optional[int] = None
    license_id: Optional[int] = None
    priority: str = "medium"  # "low", "medium", "high"
