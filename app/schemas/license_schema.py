from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class LicenseBase(BaseModel):
    model_config = {"from_attributes": True}

    name: str
    license_type: str
    status: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    labor_count: Optional[int] = 0
    license_number: Optional[str] = None
    address: Optional[str] = None
    company_id: int
    parent_id: Optional[int] = None

class LicenseCreate(LicenseBase):
    pass

class LicenseUpdate(LicenseBase):
    name: Optional[str] = None

class License(LicenseBase):
    id: int
    children: List["License"] = []