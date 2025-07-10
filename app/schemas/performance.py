# Performance Evaluation Schemas - مخططات تقييم الأداء

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class EvaluationStatusEnum(str, Enum):
    model_config = {"from_attributes": True}
    DRAFT = "مسودة"
    IN_PROGRESS = "قيد التقييم"
    COMPLETED = "مكتمل"
    APPROVED = "معتمد"

class EvaluationPeriodEnum(str, Enum):
    model_config = {"from_attributes": True}
    QUARTERLY = "ربع سنوي"
    SEMI_ANNUAL = "نصف سنوي"
    ANNUAL = "سنوي"

# معايير التقييم

class EvaluationCriteriaBase(BaseModel):
    model_config = {"from_attributes": True}
    criteria_name: str = Field(..., description="اسم المعيار")
    criteria_description: Optional[str] = Field(None, description="وصف المعيار")
    weight: float = Field(1.0, ge=0.1, le=5.0, description="وزن المعيار")
    score: float = Field(..., ge=1.0, le=5.0, description="الدرجة من 1 إلى 5")
    max_score: float = Field(5.0, description="أقصى درجة")
    comments: Optional[str] = Field(None, description="تعليقات")
    improvement_notes: Optional[str] = Field(None, description="ملاحظات التحسين")

class EvaluationCriteriaCreate(EvaluationCriteriaBase):
    model_config = {"from_attributes": True}
    pass

class EvaluationCriteriaUpdate(BaseModel):
    model_config = {"from_attributes": True}
    criteria_name: Optional[str] = None
    criteria_description: Optional[str] = None
    weight: Optional[float] = None
    score: Optional[float] = None
    comments: Optional[str] = None
    improvement_notes: Optional[str] = None

class EvaluationCriteriaResponse(EvaluationCriteriaBase):
    model_config = {"from_attributes": True}
    id: int
    evaluation_id: int
    weighted_score: float

class PerformanceGoalBase(BaseModel):
    model_config = {"from_attributes": True}
    goal_title: str = Field(..., description="عنوان الهدف")
    goal_description: Optional[str] = Field(None, description="وصف الهدف")
    target_value: Optional[str] = Field(None, description="القيمة المستهدفة")
    actual_value: Optional[str] = Field(None, description="القيمة المحققة")
    target_date: Optional[datetime] = Field(None, description="التاريخ المستهدف")
    achievement_percentage: float = Field(0.0, ge=0.0, le=100.0, description="نسبة الإنجاز")
    progress_notes: Optional[str] = Field(None, description="ملاحظات التقدم")
    challenges_faced: Optional[str] = Field(None, description="التحديات")

class PerformanceGoalCreate(PerformanceGoalBase):
    model_config = {"from_attributes": True}
    worker_id: int = Field(..., description="معرف العامل")

class PerformanceGoalUpdate(BaseModel):
    model_config = {"from_attributes": True}
    goal_title: Optional[str] = None
    goal_description: Optional[str] = None
    target_value: Optional[str] = None
    actual_value: Optional[str] = None
    target_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    achievement_percentage: Optional[float] = None
    is_achieved: Optional[bool] = None
    progress_notes: Optional[str] = None
    challenges_faced: Optional[str] = None

class PerformanceGoalResponse(PerformanceGoalBase):
    model_config = {"from_attributes": True}
    id: int
    evaluation_id: Optional[int]
    worker_id: int
    completion_date: Optional[datetime]
    is_achieved: bool

class PerformanceEvaluationBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int = Field(..., description="معرف العامل")
    evaluation_period: EvaluationPeriodEnum = Field(..., description="فترة التقييم")
    period_start: datetime = Field(..., description="بداية الفترة")
    period_end: datetime = Field(..., description="نهاية الفترة")
    evaluator_comments: Optional[str] = Field(None, description="تعليقات المقيم")
    worker_comments: Optional[str] = Field(None, description="تعليقات العامل")
    manager_comments: Optional[str] = Field(None, description="تعليقات المدير")

class PerformanceEvaluationCreate(PerformanceEvaluationBase):
    model_config = {"from_attributes": True}
    criteria: List[EvaluationCriteriaCreate] = Field([], description="معايير التقييم")
    goals: List[PerformanceGoalCreate] = Field([], description="أهداف الأداء")

class PerformanceEvaluationUpdate(BaseModel):
    model_config = {"from_attributes": True}
    evaluation_period: Optional[EvaluationPeriodEnum] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    overall_score: Optional[float] = None
    overall_rating: Optional[str] = None
    status: Optional[EvaluationStatusEnum] = None
    evaluator_comments: Optional[str] = None
    worker_comments: Optional[str] = None
    manager_comments: Optional[str] = None
    completed_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    approved_by: Optional[int] = None

class PerformanceEvaluationResponse(PerformanceEvaluationBase):
    model_config = {"from_attributes": True}
    id: int
    evaluator_id: int
    overall_score: float
    overall_rating: Optional[str]
    status: EvaluationStatusEnum
    created_at: datetime
    completed_at: Optional[datetime]
    approved_at: Optional[datetime]
    approved_by: Optional[int]
    
    criteria_scores: List[EvaluationCriteriaResponse] = []
    goals: List[PerformanceGoalResponse] = []
class DevelopmentActionBase(BaseModel):
    model_config = {"from_attributes": True}
    action_title: str = Field(..., description="عنوان الإجراء")
    action_description: Optional[str] = Field(None, description="وصف الإجراء")
    action_type: Optional[str] = Field(None, description="نوع الإجراء")
    due_date: Optional[datetime] = Field(None, description="تاريخ الاستحقاق")
    resources_needed: Optional[str] = Field(None, description="الموارد المطلوبة")
    cost_estimate: float = Field(0.0, ge=0.0, description="التكلفة المقدرة")
    notes: Optional[str] = Field(None, description="ملاحظات")

class DevelopmentActionCreate(DevelopmentActionBase):
    model_config = {"from_attributes": True}
    pass

class DevelopmentActionUpdate(BaseModel):
    model_config = {"from_attributes": True}
    action_title: Optional[str] = None
    action_description: Optional[str] = None
    action_type: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    progress_percentage: Optional[float] = None
    resources_needed: Optional[str] = None
    cost_estimate: Optional[float] = None
    notes: Optional[str] = None

class DevelopmentActionResponse(DevelopmentActionBase):
    model_config = {"from_attributes": True}
    id: int
    plan_id: int
    completed_date: Optional[datetime]
    is_completed: bool
    progress_percentage: float

class PerformancePlanBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int = Field(..., description="معرف العامل")
    plan_title: str = Field(..., description="عنوان الخطة")
    plan_description: Optional[str] = Field(None, description="وصف الخطة")
    target_completion_date: Optional[datetime] = Field(None, description="تاريخ الاستهداف")
    required_skills: Optional[str] = Field(None, description="المهارات المطلوبة")
    recommended_training: Optional[str] = Field(None, description="التدريبات المقترحة")
    success_metrics: Optional[str] = Field(None, description="مقاييس النجاح")

class PerformancePlanCreate(PerformancePlanBase):
    model_config = {"from_attributes": True}
    evaluation_id: Optional[int] = Field(None, description="معرف التقييم")
    actions: List[DevelopmentActionCreate] = Field([], description="إجراءات التطوير")

class PerformancePlanUpdate(BaseModel):
    model_config = {"from_attributes": True}
    plan_title: Optional[str] = None
    plan_description: Optional[str] = None
    target_completion_date: Optional[datetime] = None
    actual_completion_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    completion_percentage: Optional[float] = None
    required_skills: Optional[str] = None
    recommended_training: Optional[str] = None
    success_metrics: Optional[str] = None

class PerformancePlanResponse(PerformancePlanBase):
    model_config = {"from_attributes": True}
    id: int
    evaluation_id: Optional[int]
    start_date: datetime
    actual_completion_date: Optional[datetime]
    is_active: bool
    completion_percentage: float
    
    actions: List[DevelopmentActionResponse] = []
class PerformanceReportSummary(BaseModel):
    model_config = {"from_attributes": True}
    total_evaluations: int
    completed_evaluations: int
    pending_evaluations: int
    average_score: float
    top_performers: List[dict]
    improvement_needed: List[dict]
    
class WorkerPerformanceSummary(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    worker_name: str
    latest_evaluation_score: Optional[float]
    latest_evaluation_date: Optional[datetime]
    total_evaluations: int
    average_score: float
    performance_trend: str  # تحسن، ثابت، تراجع
    active_goals: int
    completed_goals: int
