from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class CompanyDocumentBase(BaseModel):
    company_id: int
    filename: str
    original_filename: str
    filepath: str
    filetype: str
    document_type: str
    description: Optional[str] = None
    
    # معلومات مستخرجة
    extracted_text: Optional[str] = None
    license_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    issuing_authority: Optional[str] = None
    license_status: Optional[str] = None

class CompanyDocumentCreate(CompanyDocumentBase):
    pass

class CompanyDocumentUpdate(BaseModel):
    filename: Optional[str] = None
    description: Optional[str] = None
    document_type: Optional[str] = None
    extracted_text: Optional[str] = None
    license_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    issuing_authority: Optional[str] = None
    license_status: Optional[str] = None
    notification_sent: Optional[bool] = None
    notification_6_months: Optional[bool] = None
    notification_3_months: Optional[bool] = None
    notification_1_month: Optional[bool] = None
    notification_1_week: Optional[bool] = None

class CompanyDocument(CompanyDocumentBase):
    id: int
    upload_date: datetime
    notification_sent: bool
    notification_6_months: bool
    notification_3_months: bool
    notification_1_month: bool
    notification_1_week: bool
    
    class Config:
        from_attributes = True
        orm_mode = True

class DocumentTypeBase(BaseModel):
    name: str
    name_ar: str
    description: Optional[str] = None
    required_fields: Optional[str] = None
    notification_periods: Optional[str] = None
    is_active: bool = True

class DocumentTypeCreate(DocumentTypeBase):
    pass

class DocumentType(DocumentTypeBase):
    id: int
    
    class Config:
        from_attributes = True

class ExpiryAlert(BaseModel):
    document_id: int
    company_id: int
    company_name: str
    document_type: str
    license_number: Optional[str]
    expiry_date: date
    days_remaining: int
    alert_type: str  # "6_months", "3_months", "1_month", "1_week", "expired"
