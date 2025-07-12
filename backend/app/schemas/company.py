from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    business_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    license_number: Optional[str] = None
    tax_number: Optional[str] = None
    is_active: bool = True

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    business_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    license_number: Optional[str] = None
    tax_number: Optional[str] = None
    is_active: Optional[bool] = None

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
