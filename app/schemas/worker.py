from pydantic import BaseModel
from typing import Optional
from datetime import date

class WorkerBase(BaseModel):
    civil_id: str
    name: Optional[str]
    nationality: Optional[str]
    worker_type: Optional[str]
    job_title: Optional[str]
    hire_date: Optional[date]
    work_permit_start: Optional[date]
    work_permit_end: Optional[date]
    salary: Optional[float]
    custom_id: Optional[str] = None

    class Config:
        orm_mode = True

class WorkerCreate(WorkerBase):
    civil_id: str
    name: str
    nationality: str
    worker_type: str
    job_title: str
    hire_date: date
    work_permit_start: date
    work_permit_end: date
    salary: float
    company_id: int
    license_id: Optional[int] = None

class WorkerUpdate(BaseModel):
    civil_id: Optional[str] = None
    name: Optional[str] = None
    nationality: Optional[str] = None
    worker_type: Optional[str] = None
    job_title: Optional[str] = None
    hire_date: Optional[date] = None
    work_permit_start: Optional[date] = None
    work_permit_end: Optional[date] = None
    salary: Optional[float] = None
    company_id: Optional[int] = None
    license_id: Optional[int] = None

    class Config:
        orm_mode = True

class Worker(WorkerBase):
    id: int
    company_id: int
    license_id: Optional[int] = None
    custom_id: Optional[str] = None  # تأكيد ظهور الحقل في Worker النهائي

    class Config:
        orm_mode = True

class WorkerOut(BaseModel):
    id: int
    civil_id: str
    name: Optional[str]
    custom_id: Optional[str]

    class Config:
        orm_mode = True
