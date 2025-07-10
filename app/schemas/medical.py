"""
Pydantic Schemas لإدارة الملفات الطبية
Medical Files Management Schemas
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class BloodType(str, Enum):
    model_config = {"from_attributes": True}
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"

class RecordType(str, Enum):
    model_config = {"from_attributes": True}
    CHECKUP = "checkup"
    INJURY = "injury"
    ILLNESS = "illness"
    VACCINATION = "vaccination"
    SURGERY = "surgery"

class DocumentType(str, Enum):
    model_config = {"from_attributes": True}
    REPORT = "report"
    XRAY = "xray"
    LAB_RESULT = "lab_result"
    CERTIFICATE = "certificate"
    PRESCRIPTION = "prescription"

class IncidentType(str, Enum):
    model_config = {"from_attributes": True}
    INJURY = "injury"
    NEAR_MISS = "near_miss"
    ILLNESS = "illness"
    ACCIDENT = "accident"

class Severity(str, Enum):
    model_config = {"from_attributes": True}
    MINOR = "minor"
    MODERATE = "moderate"
    MAJOR = "major"
    FATAL = "fatal"

class CheckupType(str, Enum):
    model_config = {"from_attributes": True}
    ANNUAL = "annual"
    PRE_EMPLOYMENT = "pre_employment"
    RETURN_TO_WORK = "return_to_work"
    PERIODIC = "periodic"

# Medical File Schemas

class MedicalFileBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    file_number: str = Field(..., max_length=50)
    blood_type: Optional[BloodType] = None
    height: Optional[float] = Field(None, gt=0, description="الطول بالسنتيمتر")
    weight: Optional[float] = Field(None, gt=0, description="الوزن بالكيلوغرام")
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    emergency_contact_relation: Optional[str] = Field(None, max_length=50)
    chronic_diseases: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    medical_insurance_number: Optional[str] = Field(None, max_length=100)
    medical_insurance_provider: Optional[str] = Field(None, max_length=200)
    last_checkup_date: Optional[date] = None
    next_checkup_due: Optional[date] = None
    fitness_for_work: bool = True
    notes: Optional[str] = None

class MedicalFileCreate(MedicalFileBase):
    model_config = {"from_attributes": True}
    pass

class MedicalFileUpdate(BaseModel):
    model_config = {"from_attributes": True}
    blood_type: Optional[BloodType] = None
    height: Optional[float] = Field(None, gt=0)
    weight: Optional[float] = Field(None, gt=0)
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    emergency_contact_relation: Optional[str] = Field(None, max_length=50)
    chronic_diseases: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    medical_insurance_number: Optional[str] = Field(None, max_length=100)
    medical_insurance_provider: Optional[str] = Field(None, max_length=200)
    last_checkup_date: Optional[date] = None
    next_checkup_due: Optional[date] = None
    fitness_for_work: Optional[bool] = None
    notes: Optional[str] = None

class MedicalFile(MedicalFileBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class MedicalRecordBase(BaseModel):
    model_config = {"from_attributes": True}
    medical_file_id: int
    record_type: RecordType
    record_date: date
    doctor_name: Optional[str] = Field(None, max_length=100)
    hospital_clinic: Optional[str] = Field(None, max_length=200)
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    prescribed_medications: Optional[str] = None
    follow_up_required: bool = False
    follow_up_date: Optional[date] = None
    work_restriction: bool = False
    restriction_details: Optional[str] = None
    restriction_start_date: Optional[date] = None
    restriction_end_date: Optional[date] = None
    cost: float = 0.0
    insurance_covered: bool = False
    notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    model_config = {"from_attributes": True}
    pass

class MedicalRecordUpdate(BaseModel):
    model_config = {"from_attributes": True}
    record_type: Optional[RecordType] = None
    record_date: Optional[date] = None
    doctor_name: Optional[str] = Field(None, max_length=100)
    hospital_clinic: Optional[str] = Field(None, max_length=200)
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    prescribed_medications: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[date] = None
    work_restriction: Optional[bool] = None
    restriction_details: Optional[str] = None
    restriction_start_date: Optional[date] = None
    restriction_end_date: Optional[date] = None
    cost: Optional[float] = None
    insurance_covered: Optional[bool] = None
    notes: Optional[str] = None

class MedicalRecord(MedicalRecordBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class MedicalDocumentBase(BaseModel):
    model_config = {"from_attributes": True}
    medical_file_id: int
    document_type: DocumentType
    title: str = Field(..., max_length=200)
    file_path: str = Field(..., max_length=500)
    file_size: Optional[int] = None
    uploaded_date: date
    expiry_date: Optional[date] = None
    is_confidential: bool = True
    description: Optional[str] = None

class MedicalDocumentCreate(MedicalDocumentBase):
    model_config = {"from_attributes": True}
    pass

class MedicalDocumentUpdate(BaseModel):
    model_config = {"from_attributes": True}
    document_type: Optional[DocumentType] = None
    title: Optional[str] = Field(None, max_length=200)
    expiry_date: Optional[date] = None
    is_confidential: Optional[bool] = None
    description: Optional[str] = None

class MedicalDocument(MedicalDocumentBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime

class HealthAndSafetyIncidentBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    incident_date: datetime
    incident_type: IncidentType
    severity: Severity
    location: str = Field(..., max_length=200)
    description: str
    immediate_action_taken: Optional[str] = None
    medical_attention_required: bool = False
    medical_facility: Optional[str] = Field(None, max_length=200)
    time_off_work: int = 0
    investigation_required: bool = False
    investigation_completed: bool = False
    investigation_findings: Optional[str] = None
    preventive_measures: Optional[str] = None
    reported_by: Optional[str] = Field(None, max_length=100)
    status: str = "open"

class HealthAndSafetyIncidentCreate(HealthAndSafetyIncidentBase):
    model_config = {"from_attributes": True}
    pass

class HealthAndSafetyIncidentUpdate(BaseModel):
    model_config = {"from_attributes": True}
    incident_type: Optional[IncidentType] = None
    severity: Optional[Severity] = None
    location: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    immediate_action_taken: Optional[str] = None
    medical_attention_required: Optional[bool] = None
    medical_facility: Optional[str] = Field(None, max_length=200)
    time_off_work: Optional[int] = None
    investigation_required: Optional[bool] = None
    investigation_completed: Optional[bool] = None
    investigation_findings: Optional[str] = None
    preventive_measures: Optional[str] = None
    status: Optional[str] = None

class HealthAndSafetyIncident(HealthAndSafetyIncidentBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class MedicalCheckupScheduleBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    checkup_type: CheckupType
    scheduled_date: date
    completed: bool = False
    completed_date: Optional[date] = None
    doctor_name: Optional[str] = Field(None, max_length=100)
    facility: Optional[str] = Field(None, max_length=200)
    cost: float = 0.0
    results_summary: Optional[str] = None
    fit_for_work: Optional[bool] = None
    restrictions: Optional[str] = None
    next_checkup_due: Optional[date] = None
    reminder_sent: bool = False
    notes: Optional[str] = None

class MedicalCheckupScheduleCreate(MedicalCheckupScheduleBase):
    model_config = {"from_attributes": True}
    pass

class MedicalCheckupScheduleUpdate(BaseModel):
    model_config = {"from_attributes": True}
    scheduled_date: Optional[date] = None
    completed: Optional[bool] = None
    completed_date: Optional[date] = None
    doctor_name: Optional[str] = Field(None, max_length=100)
    facility: Optional[str] = Field(None, max_length=200)
    cost: Optional[float] = None
    results_summary: Optional[str] = None
    fit_for_work: Optional[bool] = None
    restrictions: Optional[str] = None
    next_checkup_due: Optional[date] = None
    reminder_sent: Optional[bool] = None
    notes: Optional[str] = None

class MedicalCheckupSchedule(MedicalCheckupScheduleBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class MedicalFileSummary(BaseModel):
    model_config = {"from_attributes": True}
    """ملخص الملف الطبي للعامل"""
    worker_id: int
    worker_name: str
    file_number: str
    blood_type: Optional[str] = None
    fitness_for_work: bool
    last_checkup_date: Optional[date] = None
    next_checkup_due: Optional[date] = None
    total_records: int = 0
    recent_incidents: int = 0
    pending_follow_ups: int = 0

class HealthStatistics(BaseModel):
    model_config = {"from_attributes": True}
    """إحصائيات الصحة والسلامة"""
    total_workers_with_medical_files: int
    fit_for_work_count: int
    workers_with_restrictions: int
    overdue_checkups: int
    recent_incidents: int
    total_incidents_this_month: int
    incident_types_breakdown: dict
    severity_breakdown: dict
    average_time_off_per_incident: float
