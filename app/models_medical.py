"""
نماذج البيانات لإدارة الملفات الطبية
Medical Files Management Models
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class MedicalFile(Base):
    """ملف طبي للعامل"""
    __tablename__ = "medical_files"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    file_number = Column(String(50), unique=True, nullable=False)
    blood_type = Column(String(10))
    height = Column(Float)  # بالسنتيمتر
    weight = Column(Float)  # بالكيلوغرام
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(20))
    emergency_contact_relation = Column(String(50))
    chronic_diseases = Column(Text)  # الأمراض المزمنة
    allergies = Column(Text)  # الحساسية
    medications = Column(Text)  # الأدوية الحالية
    medical_insurance_number = Column(String(100))
    medical_insurance_provider = Column(String(200))
    last_checkup_date = Column(Date)
    next_checkup_due = Column(Date)
    fitness_for_work = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # العلاقات
    worker = relationship("Worker", back_populates="medical_file")
    medical_records = relationship("MedicalRecord", back_populates="medical_file", cascade="all, delete-orphan")
    medical_documents = relationship("MedicalDocument", back_populates="medical_file", cascade="all, delete-orphan")

class MedicalRecord(Base):
    """سجل طبي (زيارة طبية، فحص، إلخ)"""
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    medical_file_id = Column(Integer, ForeignKey("medical_files.id"), nullable=False)
    record_type = Column(String(50), nullable=False)  # checkup, injury, illness, vaccination
    record_date = Column(Date, nullable=False)
    doctor_name = Column(String(100))
    hospital_clinic = Column(String(200))
    diagnosis = Column(Text)
    treatment = Column(Text)
    prescribed_medications = Column(Text)
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(Date)
    work_restriction = Column(Boolean, default=False)
    restriction_details = Column(Text)
    restriction_start_date = Column(Date)
    restriction_end_date = Column(Date)
    cost = Column(Float, default=0.0)
    insurance_covered = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # العلاقات
    medical_file = relationship("MedicalFile", back_populates="medical_records")

class MedicalDocument(Base):
    """الوثائق الطبية المرفقة"""
    __tablename__ = "medical_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    medical_file_id = Column(Integer, ForeignKey("medical_files.id"), nullable=False)
    document_type = Column(String(50), nullable=False)  # report, xray, lab_result, certificate
    title = Column(String(200), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    uploaded_date = Column(Date, nullable=False)
    expiry_date = Column(Date)  # تاريخ انتهاء الصلاحية للشهادات
    is_confidential = Column(Boolean, default=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # العلاقات
    medical_file = relationship("MedicalFile", back_populates="medical_documents")

class HealthAndSafetyIncident(Base):
    """حوادث الصحة والسلامة المهنية"""
    __tablename__ = "health_safety_incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    incident_date = Column(DateTime(timezone=True), nullable=False)
    incident_type = Column(String(50), nullable=False)  # injury, near_miss, illness, accident
    severity = Column(String(20), nullable=False)  # minor, moderate, major, fatal
    location = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    immediate_action_taken = Column(Text)
    medical_attention_required = Column(Boolean, default=False)
    medical_facility = Column(String(200))
    time_off_work = Column(Integer, default=0)  # أيام الإجازة المرضية
    investigation_required = Column(Boolean, default=False)
    investigation_completed = Column(Boolean, default=False)
    investigation_findings = Column(Text)
    preventive_measures = Column(Text)
    reported_by = Column(String(100))
    status = Column(String(20), default="open")  # open, under_investigation, closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # العلاقات
    worker = relationship("Worker", back_populates="safety_incidents")

class MedicalCheckupSchedule(Base):
    """جدولة الفحوصات الطبية الدورية"""
    __tablename__ = "medical_checkup_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    checkup_type = Column(String(50), nullable=False)  # annual, pre_employment, return_to_work
    scheduled_date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    completed_date = Column(Date)
    doctor_name = Column(String(100))
    facility = Column(String(200))
    cost = Column(Float, default=0.0)
    results_summary = Column(Text)
    fit_for_work = Column(Boolean)
    restrictions = Column(Text)
    next_checkup_due = Column(Date)
    reminder_sent = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # العلاقات
    worker = relationship("Worker", back_populates="medical_checkups")
