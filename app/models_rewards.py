"""
نماذج قاعدة البيانات لنظام المكافآت والحوافز
"""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, 
    ForeignKey, DECIMAL, Enum, Date, Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from app.database import Base
import enum
from datetime import datetime

class RewardTypeEnum(enum.Enum):
    PERFORMANCE_BONUS = "performance_bonus"
    ATTENDANCE_BONUS = "attendance_bonus"
    SAFETY_AWARD = "safety_award"
    INNOVATION_AWARD = "innovation_award"
    TEAM_ACHIEVEMENT = "team_achievement"
    LOYALTY_BONUS = "loyalty_bonus"
    SKILL_BONUS = "skill_bonus"
    PROJECT_COMPLETION = "project_completion"

class RewardStatusEnum(enum.Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    REJECTED = "rejected"
    PAID = "paid"
    CANCELLED = "cancelled"

class IncentiveTypeEnum(enum.Enum):
    MONETARY = "monetary"
    NON_MONETARY = "non_monetary"
    PROMOTION = "promotion"
    TRAINING = "training"
    RECOGNITION = "recognition"
    TIME_OFF = "time_off"

class Reward(Base):
    """نظام المكافآت"""
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    reward_type = Column(Enum(RewardTypeEnum), nullable=False)
    status = Column(Enum(RewardStatusEnum), default=RewardStatusEnum.PROPOSED)
    
    # تفاصيل المكافأة
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(DECIMAL(10, 2), nullable=True)
    currency = Column(String(3), default="SAR")
    
    # التواريخ
    earned_date = Column(Date, nullable=False)  # تاريخ استحقاق المكافأة
    approved_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    
    # معايير الاستحقاق
    criteria_met = Column(Text, nullable=True)  # المعايير المستوفاة
    performance_score = Column(DECIMAL(5, 2), nullable=True)  # نقاط الأداء
    attendance_percentage = Column(DECIMAL(5, 2), nullable=True)  # نسبة الحضور
    
    # الموافقات
    nominated_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    approved_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # معلومات إضافية
    fiscal_year = Column(Integer, nullable=False)
    quarter = Column(Integer, nullable=True)  # ربع السنة
    department = Column(String(100), nullable=True)
    project_id = Column(Integer, nullable=True)  # مرتبط بمشروع معين
    
    # الملفات المرفقة
    supporting_documents = Column(Text, nullable=True)  # مسارات الملفات
    
    # تتبع النظام
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    worker = relationship("Worker")
    nominator = relationship("User", foreign_keys=[nominated_by])
    approver = relationship("User", foreign_keys=[approved_by])
    criteria = relationship("RewardCriteria", back_populates="reward", cascade="all, delete-orphan")
    worker_rewards = relationship("WorkerReward", back_populates="reward")
    performance_bonuses = relationship("PerformanceBonus", back_populates="reward")

class IncentiveProgram(Base):
    """برامج الحوافز"""
    __tablename__ = "incentive_programs"

    id = Column(Integer, primary_key=True, index=True)
    program_name = Column(String(200), nullable=False)
    program_type = Column(Enum(IncentiveTypeEnum), nullable=False)
    description = Column(Text, nullable=True)
    
    # فترة البرنامج
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # الأهداف والمعايير
    target_criteria = Column(Text, nullable=False)  # معايير الاستهداف
    minimum_score = Column(DECIMAL(5, 2), nullable=True)
    maximum_participants = Column(Integer, nullable=True)
    
    # قيم الحوافز
    monetary_value = Column(DECIMAL(10, 2), nullable=True)
    non_monetary_benefits = Column(Text, nullable=True)
    
    # القواعد
    eligibility_criteria = Column(Text, nullable=True)  # شروط الأهلية
    evaluation_method = Column(String(100), nullable=True)
    frequency = Column(String(50), nullable=True)  # تكرار التقييم
    
    # الميزانية
    total_budget = Column(DECIMAL(12, 2), nullable=True)
    spent_budget = Column(DECIMAL(12, 2), default=0)
    
    # معلومات إضافية
    department_specific = Column(String(100), nullable=True)
    job_level_specific = Column(String(100), nullable=True)
    team_based = Column(Boolean, default=False)
    
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    creator = relationship("User")
    participants = relationship("IncentiveParticipation", back_populates="program")
    incentives = relationship("Incentive", back_populates="program")

class IncentiveParticipation(Base):
    """مشاركة العمال في برامج الحوافز"""
    __tablename__ = "incentive_participations"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey('incentive_programs.id'), nullable=False)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    
    # حالة المشاركة
    enrollment_date = Column(Date, nullable=False)
    status = Column(String(20), default="active")  # active, completed, withdrawn
    
    # النتائج
    current_score = Column(DECIMAL(5, 2), default=0)
    target_achieved = Column(Boolean, default=False)
    achievement_date = Column(Date, nullable=True)
    final_score = Column(DECIMAL(5, 2), nullable=True)
    
    # المكافآت المستحقة
    earned_reward_amount = Column(DECIMAL(10, 2), nullable=True)
    reward_paid = Column(Boolean, default=False)
    payment_date = Column(Date, nullable=True)
    
    # ملاحظات
    notes = Column(Text, nullable=True)
    manager_comments = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    program = relationship("IncentiveProgram", back_populates="participants")
    worker = relationship("Worker")

class PerformanceMetric(Base):
    """مقاييس الأداء للحوافز"""
    __tablename__ = "performance_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # نوع المقياس
    metric_type = Column(String(50), nullable=False)  # quantity, quality, time, efficiency
    measurement_unit = Column(String(50), nullable=True)  # وحدة القياس
    
    # المعايير
    target_value = Column(DECIMAL(10, 2), nullable=True)
    minimum_threshold = Column(DECIMAL(10, 2), nullable=True)
    maximum_threshold = Column(DECIMAL(10, 2), nullable=True)
    
    # الوزن في التقييم
    weight_percentage = Column(DECIMAL(5, 2), default=100)  # الوزن النسبي
    
    # التطبيق
    applicable_departments = Column(Text, nullable=True)
    applicable_job_levels = Column(Text, nullable=True)
    
    # التكرار
    evaluation_frequency = Column(String(50), nullable=True)  # daily, weekly, monthly, quarterly
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkerPerformanceScore(Base):
    """نقاط أداء العمال"""
    __tablename__ = "worker_performance_scores"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    metric_id = Column(Integer, ForeignKey('performance_metrics.id'), nullable=False)
    
    # القياس
    measurement_date = Column(Date, nullable=False)
    actual_value = Column(DECIMAL(10, 2), nullable=False)
    score_percentage = Column(DECIMAL(5, 2), nullable=False)  # النسبة المئوية للإنجاز
    
    # التقييم
    evaluation_period = Column(String(50), nullable=True)  # الفترة المقيمة
    evaluator_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # الملاحظات
    notes = Column(Text, nullable=True)
    improvement_suggestions = Column(Text, nullable=True)
    
    # تتبع النظام
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    # العلاقات
    worker = relationship("Worker")
    metric = relationship("PerformanceMetric")
    evaluator = relationship("User")

class RewardHistory(Base):
    """تاريخ المكافآت والحوافز"""
    __tablename__ = "reward_history"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    
    # نوع السجل
    record_type = Column(String(50), nullable=False)  # reward, incentive, bonus
    reference_id = Column(Integer, nullable=True)  # مرجع للسجل الأصلي
    
    # التفاصيل
    title = Column(String(200), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=True)
    description = Column(Text, nullable=True)
    
    # التواريخ
    earned_date = Column(Date, nullable=False)
    recorded_date = Column(Date, nullable=False)
    
    # السنة المالية
    fiscal_year = Column(Integer, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # العلاقات
    worker = relationship("Worker")

class RewardBudget(Base):
    """ميزانية المكافآت"""
    __tablename__ = "reward_budgets"

    id = Column(Integer, primary_key=True, index=True)
    fiscal_year = Column(Integer, nullable=False)
    department = Column(String(100), nullable=True)
    
    # الميزانية
    allocated_budget = Column(DECIMAL(12, 2), nullable=False)
    spent_rewards = Column(DECIMAL(12, 2), default=0)
    spent_incentives = Column(DECIMAL(12, 2), default=0)
    reserved_amount = Column(DECIMAL(12, 2), default=0)
    
    # المتاح
    available_budget = Column(DECIMAL(12, 2), nullable=False)
    
    # التتبع
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # العلاقات
    updater = relationship("User")

class RewardPolicy(Base):
    """سياسات المكافآت"""
    __tablename__ = "reward_policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_name = Column(String(200), nullable=False)
    reward_type = Column(Enum(RewardTypeEnum), nullable=False)
    
    # المعايير
    criteria_description = Column(Text, nullable=False)
    minimum_requirements = Column(Text, nullable=True)
    
    # قيم المكافآت
    base_amount = Column(DECIMAL(10, 2), nullable=True)
    minimum_amount = Column(DECIMAL(10, 2), nullable=True)
    maximum_amount = Column(DECIMAL(10, 2), nullable=True)
    
    # حساب المكافأة
    calculation_method = Column(String(100), nullable=True)
    percentage_based = Column(Boolean, default=False)
    performance_multiplier = Column(DECIMAL(5, 2), default=1.0)
    
    # القيود
    frequency_limit = Column(String(50), nullable=True)  # once_per_year, quarterly, monthly
    max_recipients_per_period = Column(Integer, nullable=True)
    department_restrictions = Column(Text, nullable=True)
    
    # الموافقات المطلوبة
    requires_manager_approval = Column(Boolean, default=True)
    requires_hr_approval = Column(Boolean, default=False)
    requires_finance_approval = Column(Boolean, default=False)
    
    # الفعالية
    is_active = Column(Boolean, default=True)
    effective_from = Column(Date, nullable=False)
    effective_until = Column(Date, nullable=True)
    
    # التتبع
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    creator = relationship("User")

class WorkerReward(Base):
    """علاقة بين العمال والمكافآت"""
    __tablename__ = "worker_rewards"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    reward_id = Column(Integer, ForeignKey('rewards.id'), nullable=False)
    
    # حالة المكافأة
    status = Column(String(20), default="pending")  # pending, approved, rejected
    
    # ملاحظات
    notes = Column(Text, nullable=True)
    
    # تتبع النظام
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    reward = relationship("Reward", back_populates="worker_rewards")
    worker = relationship("Worker", back_populates="worker_rewards")

class PerformanceBonus(Base):
    """علاقة بين العمال والمكافآت الأداء"""
    __tablename__ = "performance_bonuses"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    reward_id = Column(Integer, ForeignKey('rewards.id'), nullable=False)
    
    # حالة المكافأة
    status = Column(String(20), default="pending")  # pending, approved, rejected
    
    # ملاحظات
    notes = Column(Text, nullable=True)
    
    # تتبع النظام
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    reward = relationship("Reward", back_populates="performance_bonuses")
    worker = relationship("Worker", back_populates="performance_bonuses")

class SalesCommission(Base):
    """عمولة المبيعات"""
    __tablename__ = "sales_commissions"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="SAR")
    
    # التواريخ
    earned_date = Column(Date, nullable=False)  # تاريخ استحقاق العمولة
    paid_date = Column(DateTime, nullable=True)
    
    # حالة العمولة
    status = Column(String(20), default="pending")  # pending, paid, cancelled
    
    # ملاحظات
    notes = Column(Text, nullable=True)
    
    # تتبع النظام
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    worker = relationship("Worker", back_populates="sales_commissions")

class RewardCriteria(Base):
    """معايير المكافآت"""
    __tablename__ = "reward_criteria"

    id = Column(Integer, primary_key=True, index=True)
    reward_id = Column(Integer, ForeignKey('rewards.id'), nullable=False)
    criteria_description = Column(Text, nullable=False)
    is_mandatory = Column(Boolean, default=True)
    sequence = Column(Integer, nullable=True)  # لترتيب المعايير
    
    # تتبع النظام
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    reward = relationship("Reward", back_populates="criteria")

class Incentive(Base):
    """الحوافز الفردية"""
    __tablename__ = "incentives"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    program_id = Column(Integer, ForeignKey('incentive_programs.id'), nullable=True)
    
    # تفاصيل الحافز
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    incentive_type = Column(Enum(IncentiveTypeEnum), nullable=False)
    
    # القيمة
    monetary_value = Column(DECIMAL(10, 2), nullable=True)
    currency = Column(String(3), default="SAR")
    non_monetary_description = Column(Text, nullable=True)
    
    # التواريخ
    granted_date = Column(Date, nullable=False)
    effective_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    
    # الحالة
    status = Column(String(20), default="active")  # active, redeemed, expired, cancelled
    
    # الموافقات
    granted_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    approved_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # ملاحظات
    notes = Column(Text, nullable=True)
    
    # تتبع النظام
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    worker = relationship("Worker", back_populates="incentives")
    program = relationship("IncentiveProgram", back_populates="incentives")
    granter = relationship("User", foreign_keys=[granted_by])
    approver = relationship("User", foreign_keys=[approved_by])
