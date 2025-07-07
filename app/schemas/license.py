from pydantic import BaseModel
from typing import Optional
from datetime import date

class LicenseBase(BaseModel):
    name: Optional[str]
    civil_id: Optional[str]
    issuing_authority: Optional[str]
    license_type: Optional[str]
    status: Optional[str]
    issue_date: Optional[date]
    expiry_date: Optional[date]
    labor_count: Optional[int]
    license_number: Optional[str]
    address: Optional[str]
    company_id: Optional[int]
    parent_id: Optional[int] = None  # <--- أضف هذا السطر

class LicenseCreate(LicenseBase):
    name: str
    civil_id: str
    issuing_authority: str
    license_type: str
    status: str
    issue_date: date
    expiry_date: date
    labor_count: int
    license_number: str
    address: str
    company_id: int
    parent_id: Optional[int] = None  # <--- أضف هذا السطر

class LicenseUpdate(BaseModel):
    name: Optional[str] = None
    civil_id: Optional[str] = None
    issuing_authority: Optional[str] = None
    license_type: Optional[str] = None
    status: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    labor_count: Optional[int] = None
    license_number: Optional[str] = None
    address: Optional[str] = None
    company_id: Optional[int] = None
    parent_id: Optional[int] = None

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }
    class Config:
        orm_mode = True

class License(LicenseBase):
    id: int
    company_id: int
    parent_id: Optional[int] = None

    model_config = {
        "from_attributes": True
    }
    class Config:
        orm_mode = True
