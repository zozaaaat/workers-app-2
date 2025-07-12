from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Date, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.base import Base

class EmployeeStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"
    ON_LEAVE = "on_leave"

class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"

class MaritalStatus(enum.Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    
    # معلومات شخصية
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    full_name = Column(String(100), nullable=False, index=True)
    national_id = Column(String(20), unique=True, nullable=False, index=True)
    passport_number = Column(String(20), unique=True)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20))
    mobile = Column(String(20))
    address = Column(Text)
    date_of_birth = Column(Date)
    place_of_birth = Column(String(100))
    nationality = Column(String(50))
    gender = Column(Enum(Gender))
    marital_status = Column(Enum(MaritalStatus))
    
    # معلومات وظيفية
    employee_number = Column(String(20), unique=True, index=True, nullable=False)
    position = Column(String(100), nullable=False)
    department = Column(String(100))
    section = Column(String(100))
    direct_manager = Column(String(100))
    hire_date = Column(Date, nullable=False)
    contract_start_date = Column(Date)
    contract_end_date = Column(Date)
    termination_date = Column(Date)
    probation_period_months = Column(Integer, default=3)
    
    # معلومات الراتب
    basic_salary = Column(Numeric(10, 2))
    housing_allowance = Column(Numeric(10, 2), default=0)
    transportation_allowance = Column(Numeric(10, 2), default=0)
    food_allowance = Column(Numeric(10, 2), default=0)
    other_allowances = Column(Numeric(10, 2), default=0)
    total_salary = Column(Numeric(10, 2))
    
    # معلومات التأمين والإقامة
    insurance_number = Column(String(50))
    insurance_company = Column(String(100))
    iqama_number = Column(String(20))
    iqama_expiry = Column(Date)
    work_permit_number = Column(String(20))
    work_permit_expiry = Column(Date)
    
    # جهات الاتصال في حالات الطوارئ
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(20))
    emergency_contact_relation = Column(String(50))
    emergency_contact_address = Column(Text)
    
    # معلومات إضافية
    education_level = Column(String(50))
    specialization = Column(String(100))
    years_of_experience = Column(Integer)
    languages = Column(Text)  # JSON string for multiple languages
    skills = Column(Text)     # JSON string for skills
    notes = Column(Text)
    
    # حالة الموظف
    status = Column(Enum(EmployeeStatus), default=EmployeeStatus.ACTIVE)
    is_active = Column(Boolean, default=True)
    
    # المفاتيح الخارجية
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # العلاقات
    user = relationship("User", back_populates="employee")
    company = relationship("Company", back_populates="employees")
    documents = relationship("Document", back_populates="employee")
    licenses = relationship("License", back_populates="employee")
    alerts = relationship("Alert", back_populates="employee")
    
    # الطوابع الزمنية
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Employee(full_name='{self.full_name}', employee_number='{self.employee_number}', position='{self.position}')>"

    @property
    def age(self):
        """حساب العمر"""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None

    @property
    def years_of_service(self):
        """حساب سنوات الخدمة"""
        if self.hire_date:
            from datetime import date
            today = date.today()
            return today.year - self.hire_date.year - ((today.month, today.day) < (self.hire_date.month, self.hire_date.day))
        return None

    @property
    def is_iqama_expired(self):
        """التحقق من انتهاء الإقامة"""
        if self.iqama_expiry:
            from datetime import date
            return date.today() > self.iqama_expiry
        return False

    @property
    def is_work_permit_expired(self):
        """التحقق من انتهاء رخصة العمل"""
        if self.work_permit_expiry:
            from datetime import date
            return date.today() > self.work_permit_expiry
        return False
