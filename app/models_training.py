"""
نماذج قاعدة البيانات لإدارة الدورات التدريبية
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

class TrainingTypeEnum(enum.Enum):
    TECHNICAL = "technical"
    SOFT_SKILLS = "soft_skills"
    SAFETY = "safety"
    MANAGEMENT = "management"
    CERTIFICATION = "certification"
    ORIENTATION = "orientation"

class TrainingStatusEnum(enum.Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"

# Many-to-many association table for worker enrollments
training_enrollments = Table(
    'training_enrollments',
    Base.metadata,
    Column('id', Integer, primary_key=True),
    Column('training_id', Integer, ForeignKey('training_courses.id'), nullable=False),
    Column('worker_id', Integer, ForeignKey('workers.id'), nullable=False),
    Column('enrollment_date', DateTime, default=datetime.utcnow),
    Column('completion_status', String(20), default='enrolled'),
    Column('completion_date', DateTime, nullable=True),
    Column('grade', DECIMAL(5, 2), nullable=True),
    Column('certificate_issued', Boolean, default=False),
    Column('notes', Text, nullable=True)
)

class TrainingCourse(Base):
    """دورة تدريبية"""
    __tablename__ = "training_courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    training_type = Column(Enum(TrainingTypeEnum), nullable=False)
    status = Column(Enum(TrainingStatusEnum), default=TrainingStatusEnum.PLANNED)
    
    # تفاصيل الدورة
    duration_hours = Column(Integer, nullable=False)  # مدة الدورة بالساعات
    max_participants = Column(Integer, default=20)
    cost_per_participant = Column(DECIMAL(10, 2), nullable=True)
    total_budget = Column(DECIMAL(10, 2), nullable=True)
    
    # التواريخ
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime, nullable=True)
    
    # الموقع والمدرب
    location = Column(String(200), nullable=True)
    instructor_name = Column(String(100), nullable=True)
    instructor_company = Column(String(100), nullable=True)
    instructor_contact = Column(String(100), nullable=True)
    
    # المتطلبات والشهادة
    prerequisites = Column(Text, nullable=True)
    certification_provided = Column(Boolean, default=False)
    certificate_template = Column(String(255), nullable=True)
    
    # معلومات إضافية
    materials_required = Column(Text, nullable=True)
    learning_objectives = Column(Text, nullable=True)
    evaluation_method = Column(String(100), nullable=True)
    
    # تتبع الإنشاء والتحديث
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # العلاقات
    creator = relationship("User", foreign_keys=[created_by])
    enrollments = relationship("Worker", secondary=training_enrollments, back_populates="training_courses")
    sessions = relationship("TrainingSession", back_populates="course", cascade="all, delete-orphan")
    evaluations = relationship("TrainingEvaluation", back_populates="course", cascade="all, delete-orphan")

class TrainingSession(Base):
    """جلسة تدريبية"""
    __tablename__ = "training_sessions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey('training_courses.id'), nullable=False)
    session_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # التوقيت
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    
    # الحضور
    attendance_required = Column(Boolean, default=True)
    location = Column(String(200), nullable=True)
    
    # المحتوى
    materials = Column(Text, nullable=True)
    homework_assigned = Column(Text, nullable=True)
    
    # تتبع الحالة
    completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    course = relationship("TrainingCourse", back_populates="sessions")
    attendance_records = relationship("SessionAttendance", back_populates="session", cascade="all, delete-orphan")

class SessionAttendance(Base):
    """سجل حضور الجلسات"""
    __tablename__ = "session_attendance"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('training_sessions.id'), nullable=False)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    
    # حالة الحضور
    attended = Column(Boolean, default=False)
    arrival_time = Column(DateTime, nullable=True)
    departure_time = Column(DateTime, nullable=True)
    late_minutes = Column(Integer, default=0)
    
    # ملاحظات
    excuse_reason = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    
    recorded_at = Column(DateTime, default=datetime.utcnow)
    recorded_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # العلاقات
    session = relationship("TrainingSession", back_populates="attendance_records")
    worker = relationship("Worker")
    recorder = relationship("User")

class TrainingEvaluation(Base):
    """تقييم الدورة التدريبية"""
    __tablename__ = "training_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey('training_courses.id'), nullable=False)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    
    # التقييمات
    content_rating = Column(Integer, nullable=True)  # 1-5
    instructor_rating = Column(Integer, nullable=True)  # 1-5
    organization_rating = Column(Integer, nullable=True)  # 1-5
    overall_rating = Column(Integer, nullable=True)  # 1-5
    
    # الأسئلة المفتوحة
    liked_most = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    would_recommend = Column(Boolean, nullable=True)
    
    # النتائج
    pre_test_score = Column(DECIMAL(5, 2), nullable=True)
    post_test_score = Column(DECIMAL(5, 2), nullable=True)
    improvement_percentage = Column(DECIMAL(5, 2), nullable=True)
    
    # معلومات إضافية
    skills_gained = Column(Text, nullable=True)
    application_plan = Column(Text, nullable=True)
    additional_training_needed = Column(Text, nullable=True)
    
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    # العلاقات
    course = relationship("TrainingCourse", back_populates="evaluations")
    worker = relationship("Worker")

class TrainingCertificate(Base):
    """شهادات التدريب"""
    __tablename__ = "training_certificates"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey('training_courses.id'), nullable=False)
    worker_id = Column(Integer, ForeignKey('workers.id'), nullable=False)
    
    # تفاصيل الشهادة
    certificate_number = Column(String(50), unique=True, nullable=False)
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)
    
    # النتائج
    final_grade = Column(DECIMAL(5, 2), nullable=True)
    status = Column(String(20), default='valid')  # valid, expired, revoked
    
    # الملفات
    certificate_file_path = Column(String(255), nullable=True)
    verification_code = Column(String(100), nullable=True)
    
    # معلومات إضافية
    competencies_achieved = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    issued_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # العلاقات
    course = relationship("TrainingCourse")
    worker = relationship("Worker")
    issuer = relationship("User")

class TrainingRequirement(Base):
    """متطلبات التدريب للوظائف"""
    __tablename__ = "training_requirements"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(100), nullable=False)
    training_type = Column(Enum(TrainingTypeEnum), nullable=False)
    
    # المتطلبات
    is_mandatory = Column(Boolean, default=False)
    renewal_period_months = Column(Integer, nullable=True)  # مدة التجديد بالأشهر
    minimum_hours = Column(Integer, nullable=True)
    
    # التفاصيل
    description = Column(Text, nullable=True)
    compliance_deadline = Column(Date, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
class TrainingBudget(Base):
    """ميزانية التدريب"""
    __tablename__ = "training_budgets"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    department = Column(String(100), nullable=True)
    
    # الميزانية
    allocated_budget = Column(DECIMAL(12, 2), nullable=False)
    spent_budget = Column(DECIMAL(12, 2), default=0)
    remaining_budget = Column(DECIMAL(12, 2), nullable=False)
    
    # التتبع
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text, nullable=True)
