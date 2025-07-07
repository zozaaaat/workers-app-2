from pydantic import BaseModel
from typing import Optional
from datetime import date

class CompanyBase(BaseModel):
    file_number: str
    file_status: Optional[str]
    creation_date: Optional[date]
    commercial_registration_number: Optional[str]
    file_name: Optional[str]
    file_classification: Optional[str]
    administration: Optional[str]
    file_type: Optional[str]
    legal_entity: Optional[str]
    ownership_category: Optional[str]
    total_workers: Optional[int] = 0
    total_licenses: Optional[int] = 0

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    file_status: Optional[str] = None
    creation_date: Optional[date] = None
    commercial_registration_number: Optional[str] = None
    file_name: Optional[str] = None
    file_classification: Optional[str] = None
    administration: Optional[str] = None
    file_type: Optional[str] = None
    legal_entity: Optional[str] = None
    ownership_category: Optional[str] = None
    total_workers: Optional[int] = None
    total_licenses: Optional[int] = None

class Company(CompanyBase):
    id: int
    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }
    class Config:
        orm_mode = True
