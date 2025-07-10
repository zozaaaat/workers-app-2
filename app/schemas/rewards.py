"""
Pydantic Schemas لنظام المكافآت والحوافز
Rewards and Incentives Schemas
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from enum import Enum

class RewardType(str, Enum):
    model_config = {"from_attributes": True}
    PERFORMANCE = "performance"
    ATTENDANCE = "attendance"
    SAFETY = "safety"
    INNOVATION = "innovation"
    TEAMWORK = "teamwork"
    CUSTOMER_SERVICE = "customer_service"
    SALES = "sales"
    OTHER = "other"

class IncentiveType(str, Enum):
    model_config = {"from_attributes": True}
    MONETARY = "monetary"
    TIME_OFF = "time_off"
    RECOGNITION = "recognition"
    TRAINING = "training"
    BENEFITS = "benefits"
    OTHER = "other"

class ApprovalStatus(str, Enum):
    model_config = {"from_attributes": True}
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class CriteriaType(str, Enum):
    model_config = {"from_attributes": True}
    ATTENDANCE_RATE = "attendance_rate"
    PERFORMANCE_SCORE = "performance_score"
    SALES_TARGET = "sales_target"
    SAFETY_RECORD = "safety_record"
    CUSTOMER_RATING = "customer_rating"
    PROJECT_COMPLETION = "project_completion"
    OTHER = "other"

# Reward Schemas

class RewardBase(BaseModel):
    model_config = {"from_attributes": True}
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    reward_type: RewardType
    monetary_value: float = Field(0.0, ge=0)
    points_value: int = Field(0, ge=0)
    is_active: bool = True
    eligibility_requirements: Optional[str] = None
    terms_conditions: Optional[str] = None

class RewardCreate(RewardBase):
    model_config = {"from_attributes": True}
    pass

class RewardUpdate(BaseModel):
    model_config = {"from_attributes": True}
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    reward_type: Optional[RewardType] = None
    monetary_value: Optional[float] = Field(None, ge=0)
    points_value: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    eligibility_requirements: Optional[str] = None
    terms_conditions: Optional[str] = None

class Reward(RewardBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class RewardCriteriaBase(BaseModel):
    model_config = {"from_attributes": True}
    reward_id: int
    criteria_type: CriteriaType
    threshold_value: float
    comparison_operator: str = Field(..., pattern="^(>=|<=|>|<|=|!=)$")
    weight: float = Field(1.0, ge=0, le=1.0)
    description: Optional[str] = None

class RewardCriteriaCreate(RewardCriteriaBase):
    model_config = {"from_attributes": True}
    pass

class RewardCriteriaUpdate(BaseModel):
    model_config = {"from_attributes": True}
    criteria_type: Optional[CriteriaType] = None
    threshold_value: Optional[float] = None
    comparison_operator: Optional[str] = Field(None, pattern="^(>=|<=|>|<|=|!=)$")
    weight: Optional[float] = Field(None, ge=0, le=1.0)
    description: Optional[str] = None

class RewardCriteria(RewardCriteriaBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime

class WorkerRewardBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    reward_id: int
    amount: float = Field(0.0, ge=0)
    points: int = Field(0, ge=0)
    awarded_date: date
    reason: Optional[str] = None
    approval_status: ApprovalStatus = ApprovalStatus.PENDING
    approved_by: Optional[str] = None
    approved_date: Optional[date] = None
    notes: Optional[str] = None

class WorkerRewardCreate(WorkerRewardBase):
    model_config = {"from_attributes": True}
    pass

class WorkerRewardUpdate(BaseModel):
    model_config = {"from_attributes": True}
    amount: Optional[float] = Field(None, ge=0)
    points: Optional[int] = Field(None, ge=0)
    awarded_date: Optional[date] = None
    reason: Optional[str] = None
    approval_status: Optional[ApprovalStatus] = None
    approved_by: Optional[str] = None
    approved_date: Optional[date] = None
    notes: Optional[str] = None

class WorkerReward(WorkerRewardBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class IncentiveBase(BaseModel):
    model_config = {"from_attributes": True}
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    incentive_type: IncentiveType
    value: float = Field(0.0, ge=0)
    target_metric: Optional[str] = None
    target_value: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_workers: Optional[str] = None  # JSON string of worker IDs
    is_active: bool = True

class IncentiveCreate(IncentiveBase):
    model_config = {"from_attributes": True}
    pass

class IncentiveUpdate(BaseModel):
    model_config = {"from_attributes": True}
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    incentive_type: Optional[IncentiveType] = None
    value: Optional[float] = Field(None, ge=0)
    target_metric: Optional[str] = None
    target_value: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_workers: Optional[str] = None
    is_active: Optional[bool] = None

class Incentive(IncentiveBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class IncentiveProgramBase(BaseModel):
    model_config = {"from_attributes": True}
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    start_date: date
    end_date: date
    budget: float = Field(0.0, ge=0)
    target_participants: Optional[int] = None
    rules: Optional[str] = None
    is_active: bool = True

class IncentiveProgramCreate(IncentiveProgramBase):
    model_config = {"from_attributes": True}
    pass

class IncentiveProgramUpdate(BaseModel):
    model_config = {"from_attributes": True}
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = Field(None, ge=0)
    target_participants: Optional[int] = None
    rules: Optional[str] = None
    is_active: Optional[bool] = None

class IncentiveProgram(IncentiveProgramBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class PerformanceBonusBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    evaluation_period_start: date
    evaluation_period_end: date
    performance_score: float = Field(..., ge=0, le=100)
    bonus_amount: float = Field(0.0, ge=0)
    evaluation_date: date
    evaluator: Optional[str] = None
    performance_notes: Optional[str] = None
    bonus_criteria: Optional[str] = None

class PerformanceBonusCreate(PerformanceBonusBase):
    model_config = {"from_attributes": True}
    pass

class PerformanceBonusUpdate(BaseModel):
    model_config = {"from_attributes": True}
    performance_score: Optional[float] = Field(None, ge=0, le=100)
    bonus_amount: Optional[float] = Field(None, ge=0)
    evaluation_date: Optional[date] = None
    evaluator: Optional[str] = None
    performance_notes: Optional[str] = None
    bonus_criteria: Optional[str] = None

class PerformanceBonus(PerformanceBonusBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class SalesCommissionBase(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    sale_amount: float = Field(..., gt=0)
    commission_rate: float = Field(..., ge=0, le=100)
    commission_amount: float = Field(..., ge=0)
    sale_date: date
    customer_name: Optional[str] = None
    product_service: Optional[str] = None
    notes: Optional[str] = None

class SalesCommissionCreate(SalesCommissionBase):
    model_config = {"from_attributes": True}
    @validator('commission_amount', always=True)
    def calculate_commission(cls, v, values):
        if 'sale_amount' in values and 'commission_rate' in values:
            return values['sale_amount'] * (values['commission_rate'] / 100)
        return v

class SalesCommissionUpdate(BaseModel):
    model_config = {"from_attributes": True}
    sale_amount: Optional[float] = Field(None, gt=0)
    commission_rate: Optional[float] = Field(None, ge=0, le=100)
    commission_amount: Optional[float] = Field(None, ge=0)
    sale_date: Optional[date] = None
    customer_name: Optional[str] = None
    product_service: Optional[str] = None
    notes: Optional[str] = None

class SalesCommission(SalesCommissionBase):
    model_config = {"from_attributes": True}
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class RewardsSummary(BaseModel):
    model_config = {"from_attributes": True}
    """ملخص مكافآت العامل"""
    worker_id: int
    worker_name: str
    total_rewards: int
    total_amount: float
    rewards_this_month: int
    amount_this_month: float
    last_reward_date: Optional[date] = None
    last_reward_amount: float = 0.0

class TopPerformer(BaseModel):
    model_config = {"from_attributes": True}
    worker_id: int
    reward_count: int
    total_amount: float

class RewardTypeBreakdown(BaseModel):
    model_config = {"from_attributes": True}
    count: int
    total_amount: float

class RewardsStatistics(BaseModel):
    model_config = {"from_attributes": True}
    """إحصائيات المكافآت والحوافز"""
    total_active_rewards: int
    total_active_incentives: int
    pending_approvals: int
    total_paid_this_month: float
    top_performers: List[Dict[str, Any]]
    reward_types_breakdown: Dict[str, Dict[str, float]]
    average_reward_amount: float

class RewardDistribution(BaseModel):
    model_config = {"from_attributes": True}
    """توزيع المكافآت"""
    period: str
    reward_type: str
    count: int
    total_amount: float
    average_amount: float

class IncentiveProgress(BaseModel):
    model_config = {"from_attributes": True}
    """تقدم الحوافز"""
    incentive_id: int
    incentive_name: str
    target_value: float
    current_value: float
    progress_percentage: float
    participants_count: int
    is_completed: bool
