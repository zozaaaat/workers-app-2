# Performance Evaluation Models - نماذج تقييم الأداء

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from app.database import Base
from datetime import datetime
import enum

class EvaluationStatus(enum.Enum):
    DRAFT = "مسودة"
    IN_PROGRESS = "قيد التقييم"
    COMPLETED = "مكتمل"
    APPROVED = "معتمد"

class EvaluationPeriod(enum.Enum):
    QUARTERLY = "ربع سنوي"
    SEMI_ANNUAL = "نصف سنوي"
    ANNUAL = "سنوي"

class PerformanceEvaluation(Base):
    """تقييم الأداء الرئيسي"""
    __tablename__ = "performance_evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    evaluator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # معلومات التقييم
    evaluation_period = Column(SQLEnum(EvaluationPeriod), nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # النتائج الإجمالية
    overall_score = Column(Float, default=0.0)  # من 100
    overall_rating = Column(String(50))  # ممتاز، جيد جداً، جيد، مقبول، ضعيف
    
    # الحالة والتوقيتات
    status = Column(SQLEnum(EvaluationStatus), default=EvaluationStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # ملاحظات عامة
    evaluator_comments = Column(Text)
    worker_comments = Column(Text)  # تعليقات العامل على التقييم
    manager_comments = Column(Text)  # تعليقات المدير
    
    # العلاقات
    worker = relationship("Worker", back_populates="performance_evaluations")
    evaluator = relationship("User", foreign_keys=[evaluator_id])
    approver = relationship("User", foreign_keys=[approved_by])
    criteria_scores = relationship("EvaluationCriteria", back_populates="evaluation")
    goals = relationship("PerformanceGoal", back_populates="evaluation")

class EvaluationCriteria(Base):
    """معايير التقييم والدرجات"""
    __tablename__ = "evaluation_criteria"
    
    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("performance_evaluations.id"), nullable=False)
    
    # معلومات المعيار
    criteria_name = Column(String(200), nullable=False)  # الجودة، الكمية، الالتزام بالوقت...
    criteria_description = Column(Text)
    weight = Column(Float, default=1.0)  # وزن المعيار (مهم جداً = 2، مهم = 1.5، عادي = 1)
    
    # الدرجات
    score = Column(Float, nullable=False)  # من 1 إلى 5
    max_score = Column(Float, default=5.0)
    weighted_score = Column(Float, default=0.0)  # score * weight
    
    # تفاصيل
    comments = Column(Text)
    improvement_notes = Column(Text)  # اقتراحات للتحسين
    
    # العلاقات
    evaluation = relationship("PerformanceEvaluation", back_populates="criteria_scores")

class PerformanceGoal(Base):
    """أهداف الأداء الفردية"""
    __tablename__ = "performance_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("performance_evaluations.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    
    # معلومات الهدف
    goal_title = Column(String(200), nullable=False)
    goal_description = Column(Text)
    target_value = Column(String(100))  # القيمة المستهدفة
    actual_value = Column(String(100))  # القيمة المحققة
    
    # التوقيتات
    target_date = Column(DateTime)
    completion_date = Column(DateTime, nullable=True)
    
    # النتائج
    achievement_percentage = Column(Float, default=0.0)  # نسبة الإنجاز
    is_achieved = Column(Boolean, default=False)
    
    # تفاصيل
    progress_notes = Column(Text)
    challenges_faced = Column(Text)  # التحديات التي واجهها
    
    # العلاقات
    evaluation = relationship("PerformanceEvaluation", back_populates="goals")
    worker = relationship("Worker")

class PerformancePlan(Base):
    """خطة تطوير الأداء"""
    __tablename__ = "performance_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    evaluation_id = Column(Integer, ForeignKey("performance_evaluations.id"), nullable=True)
    
    # معلومات الخطة
    plan_title = Column(String(200), nullable=False)
    plan_description = Column(Text)
    
    # التوقيتات
    start_date = Column(DateTime, default=datetime.utcnow)
    target_completion_date = Column(DateTime)
    actual_completion_date = Column(DateTime, nullable=True)
    
    # الحالة
    is_active = Column(Boolean, default=True)
    completion_percentage = Column(Float, default=0.0)
    
    # التفاصيل
    required_skills = Column(Text)  # المهارات المطلوب تطويرها
    recommended_training = Column(Text)  # التدريبات المقترحة
    success_metrics = Column(Text)  # مقاييس النجاح
    
    # العلاقات
    worker = relationship("Worker")
    evaluation = relationship("PerformanceEvaluation")
    actions = relationship("DevelopmentAction", back_populates="plan")

class DevelopmentAction(Base):
    """إجراءات التطوير المحددة"""
    __tablename__ = "development_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("performance_plans.id"), nullable=False)
    
    # معلومات الإجراء
    action_title = Column(String(200), nullable=False)
    action_description = Column(Text)
    action_type = Column(String(100))  # تدريب، كورس، ورشة عمل، إلخ
    
    # التوقيتات
    due_date = Column(DateTime)
    completed_date = Column(DateTime, nullable=True)
    
    # الحالة
    is_completed = Column(Boolean, default=False)
    progress_percentage = Column(Float, default=0.0)
    
    # التفاصيل
    resources_needed = Column(Text)  # الموارد المطلوبة
    cost_estimate = Column(Float, default=0.0)  # التكلفة المقدرة
    notes = Column(Text)
    
    # العلاقات
    plan = relationship("PerformancePlan", back_populates="actions")

# إضافة العلاقة للعامل
def add_performance_relations():
    from app.models import Worker
    Worker.performance_evaluations = relationship("PerformanceEvaluation", back_populates="worker")
    Worker.performance_goals = relationship("PerformanceGoal", back_populates="worker")
    Worker.performance_plans = relationship("PerformancePlan", back_populates="worker")
