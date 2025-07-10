"""
Pydantic schemas لإدارة الدورات التدريبية
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

class TrainingTypeEnum(str, Enum):
    model_config = {"from_attributes": True}
    TECHNICAL = "technical"
    SOFT_SKILLS = "soft_skills"
    SAFETY = "safety"
    MANAGEMENT = "management"
    CERTIFICATION = "certification"
    ORIENTATION = "orientation"

class TrainingStatusEnum(str, Enum):
    model_config = {"from_attributes": True}
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"

# Training Course Schemas

class TrainingCourseBase(BaseModel):
    model_config = {"from_attributes": True}
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    training_type: TrainingTypeEnum
    duration_hours: int = Field(..., ge=1)
    max_participants: int = Field(default=20, ge=1)
    cost_per_participant: Optional[Decimal] = Field(None, ge=0)
    total_budget: Optional[Decimal] = Field(None, ge=0)
    start_date: datetime
    end_date: datetime
    registration_deadline: Optional[datetime] = None
    location: Optional[str] = None
    instructor_name: Optional[str] = None
    instructor_company: Optional[str] = None
    instructor_contact: Optional[str] = None
    prerequisites: Optional[str] = None
    certification_provided: bool = False
    materials_required: Optional[str] = None
    learning_objectives: Optional[str] = None
    evaluation_method: Optional[str] = None

    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية')
        return v

    @validator('registration_deadline')
    def registration_deadline_before_start(cls, v, values):
        if v and 'start_date' in values and v >= values['start_date']:
            raise ValueError('موعد انتهاء التسجيل يجب أن يكون قبل بداية الدورة')
        return v

class TrainingCourseCreate(TrainingCourseBase):
    model_config = {"from_attributes": True}
    pass

class TrainingCourseUpdate(BaseModel):
    model_config = {"from_attributes": True}
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    training_type: Optional[TrainingTypeEnum] = None
    status: Optional[TrainingStatusEnum] = None
    duration_hours: Optional[int] = Field(None, ge=1)
    max_participants: Optional[int] = Field(None, ge=1)
    cost_per_participant: Optional[Decimal] = Field(None, ge=0)
    total_budget: Optional[Decimal] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    location: Optional[str] = None
    instructor_name: Optional[str] = None
    instructor_company: Optional[str] = None
    instructor_contact: Optional[str] = None
    prerequisites: Optional[str] = None
    certification_provided: Optional[bool] = None
    materials_required: Optional[str] = None
    learning_objectives: Optional[str] = None
    evaluation_method: Optional[str] = None

class TrainingCourse(TrainingCourseBase):
    model_config = {"from_attributes": True}
    id: int
    status: TrainingStatusEnum
    certificate_template: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    
    # Statistics
    enrolled_count: Optional[int] = 0
    completed_count: Optional[int] = 0
    average_rating: Optional[float] = None

class TrainingSessionBase(BaseModel):
    model_config = {"from_attributes": True}
    session_number: int = Field(..., ge=1)
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., ge=1)
    attendance_required: bool = True
    location: Optional[str] = None
    materials: Optional[str] = None
    homework_assigned: Optional[str] = None

    @validator('end_time')
    def end_time_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('وقت الانتهاء يجب أن يكون بعد وقت البداية')
        return v

class TrainingSessionCreate(TrainingSessionBase):
    model_config = {"from_attributes": True}
    course_id: int

class TrainingSessionUpdate(BaseModel):
    model_config = {"from_attributes": True}
    session_number: Optional[int] = Field(None, ge=1)
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    attendance_required: Optional[bool] = None
    location: Optional[str] = None
    materials: Optional[str] = None
    homework_assigned: Optional[str] = None
    completed: Optional[bool] = None
    notes: Optional[str] = None

class TrainingSession(TrainingSessionBase):
    model_config = {"from_attributes": True}
    id: int
    course_id: int
    completed: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Statistics
    attendance_count: Optional[int] = 0
    attendance_percentage: Optional[float] = None

class TrainingEnrollmentBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    enrollment_date: Optional[datetime] = None
    notes: Optional[str] = None

class TrainingEnrollmentCreate(TrainingEnrollmentBase):
    model_config = {"from_attributes": True}
    course_id: int

class TrainingEnrollmentUpdate(BaseModel):
    model_config = {"from_attributes": True}
    completion_status: Optional[str] = None
    completion_date: Optional[datetime] = None
    grade: Optional[Decimal] = Field(None, ge=0, le=100)
    certificate_issued: Optional[bool] = None
    notes: Optional[str] = None

class TrainingEnrollment(TrainingEnrollmentBase):
    model_config = {"from_attributes": True}
    id: int
    course_id: int
    completion_status: str
    completion_date: Optional[datetime] = None
    grade: Optional[Decimal] = None
    certificate_issued: bool
    
    # Worker info
    worker_name: Optional[str] = None
    worker_employee_id: Optional[str] = None

class SessionAttendanceBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    attended: bool = False
    arrival_time: Optional[datetime] = None
    departure_time: Optional[datetime] = None
    late_minutes: int = 0
    excuse_reason: Optional[str] = None
    notes: Optional[str] = None

class SessionAttendanceCreate(SessionAttendanceBase):
    model_config = {"from_attributes": True}
    session_id: int

class SessionAttendanceUpdate(BaseModel):
    model_config = {"from_attributes": True}
    attended: Optional[bool] = None
    arrival_time: Optional[datetime] = None
    departure_time: Optional[datetime] = None
    late_minutes: Optional[int] = Field(None, ge=0)
    excuse_reason: Optional[str] = None
    notes: Optional[str] = None

class SessionAttendance(SessionAttendanceBase):
    model_config = {"from_attributes": True}
    id: int
    session_id: int
    recorded_at: datetime
    recorded_by: Optional[int] = None
    
    # Worker info
    worker_name: Optional[str] = None
    worker_employee_id: Optional[str] = None

class TrainingEvaluationBase(BaseModel):
    model_config = {"from_attributes": True}
    content_rating: Optional[int] = Field(None, ge=1, le=5)
    instructor_rating: Optional[int] = Field(None, ge=1, le=5)
    organization_rating: Optional[int] = Field(None, ge=1, le=5)
    overall_rating: Optional[int] = Field(None, ge=1, le=5)
    liked_most: Optional[str] = None
    suggestions: Optional[str] = None
    would_recommend: Optional[bool] = None
    pre_test_score: Optional[Decimal] = Field(None, ge=0, le=100)
    post_test_score: Optional[Decimal] = Field(None, ge=0, le=100)
    skills_gained: Optional[str] = None
    application_plan: Optional[str] = None
    additional_training_needed: Optional[str] = None

class TrainingEvaluationCreate(TrainingEvaluationBase):
    model_config = {"from_attributes": True}
    course_id: int
    worker_id: int

class TrainingEvaluationUpdate(TrainingEvaluationBase):
    model_config = {"from_attributes": True}
    pass

class TrainingEvaluation(TrainingEvaluationBase):
    model_config = {"from_attributes": True}
    id: int
    course_id: int
    worker_id: int
    improvement_percentage: Optional[Decimal] = None
    submitted_at: datetime
    
    # Worker info
    worker_name: Optional[str] = None
    worker_employee_id: Optional[str] = None

class TrainingCertificateBase(BaseModel):
    model_config = {"from_attributes": True}
    certificate_number: str = Field(..., min_length=1, max_length=50)
    issue_date: date
    expiry_date: Optional[date] = None
    final_grade: Optional[Decimal] = Field(None, ge=0, le=100)
    status: str = "valid"
    competencies_achieved: Optional[str] = None
    notes: Optional[str] = None

class TrainingCertificateCreate(TrainingCertificateBase):
    model_config = {"from_attributes": True}
    course_id: int
    worker_id: int

class TrainingCertificateUpdate(BaseModel):
    model_config = {"from_attributes": True}
    certificate_number: Optional[str] = Field(None, min_length=1, max_length=50)
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    final_grade: Optional[Decimal] = Field(None, ge=0, le=100)
    status: Optional[str] = None
    competencies_achieved: Optional[str] = None
    notes: Optional[str] = None

class TrainingCertificate(TrainingCertificateBase):
    model_config = {"from_attributes": True}
    id: int
    course_id: int
    worker_id: int
    certificate_file_path: Optional[str] = None
    verification_code: Optional[str] = None
    issued_by: Optional[int] = None
    created_at: datetime
    
    # Related info
    course_title: Optional[str] = None
    worker_name: Optional[str] = None
    worker_employee_id: Optional[str] = None

class TrainingRequirementBase(BaseModel):
    model_config = {"from_attributes": True}
    job_title: str = Field(..., min_length=1, max_length=100)
    training_type: TrainingTypeEnum
    is_mandatory: bool = False
    renewal_period_months: Optional[int] = Field(None, ge=1)
    minimum_hours: Optional[int] = Field(None, ge=1)
    description: Optional[str] = None
    compliance_deadline: Optional[date] = None

class TrainingRequirementCreate(TrainingRequirementBase):
    model_config = {"from_attributes": True}
    pass

class TrainingRequirementUpdate(BaseModel):
    model_config = {"from_attributes": True}
    job_title: Optional[str] = Field(None, min_length=1, max_length=100)
    training_type: Optional[TrainingTypeEnum] = None
    is_mandatory: Optional[bool] = None
    renewal_period_months: Optional[int] = Field(None, ge=1)
    minimum_hours: Optional[int] = Field(None, ge=1)
    description: Optional[str] = None
    compliance_deadline: Optional[date] = None

class TrainingRequirement(TrainingRequirementBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime

class TrainingBudgetBase(BaseModel):
    model_config = {"from_attributes": True}
    year: int = Field(..., ge=2020, le=2050)
    department: Optional[str] = None
    allocated_budget: Decimal = Field(..., ge=0)
    notes: Optional[str] = None

class TrainingBudgetCreate(TrainingBudgetBase):
    model_config = {"from_attributes": True}
    pass

class TrainingBudgetUpdate(BaseModel):
    model_config = {"from_attributes": True}
    year: Optional[int] = Field(None, ge=2020, le=2050)
    department: Optional[str] = None
    allocated_budget: Optional[Decimal] = Field(None, ge=0)
    spent_budget: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None

class TrainingBudget(TrainingBudgetBase):
    model_config = {"from_attributes": True}
    id: int
    spent_budget: Decimal
    remaining_budget: Decimal
    last_updated: datetime
    
    # Statistics
    utilization_percentage: Optional[float] = None

class TrainingStatistics(BaseModel):
    model_config = {"from_attributes": True}
    total_courses: int
    active_courses: int
    completed_courses: int
    total_participants: int
    completion_rate: float
    average_rating: float
    total_budget_allocated: Decimal
    total_budget_spent: Decimal
    budget_utilization: float

class TrainingDashboard(BaseModel):
    model_config = {"from_attributes": True}
    statistics: TrainingStatistics
    upcoming_courses: List[TrainingCourse]
    recent_completions: List[TrainingCertificate]
    budget_summary: List[TrainingBudget]
    compliance_alerts: List[Dict[str, Any]]

class TrainingReport(BaseModel):
    model_config = {"from_attributes": True}
    report_type: str
    generated_at: datetime
    parameters: Dict[str, Any]
    data: Dict[str, Any]
