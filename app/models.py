from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float
from sqlalchemy.orm import relationship
from .database import Base
from .models_absence import Absence
from app.models_worker_document import WorkerDocument

# -----------------------------
# شركة (Company)
# -----------------------------
class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    file_number = Column(String, unique=True, index=True, nullable=False)
    file_status = Column(String)
    creation_date = Column(Date)
    commercial_registration_number = Column(String)
    file_name = Column(String)
    file_classification = Column(String)
    administration = Column(String)  # المحافظة التابع لها الملف
    file_type = Column(String)
    legal_entity = Column(String)
    ownership_category = Column(String)
    total_workers = Column(Integer, default=0)
    total_licenses = Column(Integer, default=0)
    email = Column(String, unique=True, index=True, nullable=True)  # بريد الشركة
    phone = Column(String, nullable=True)  # رقم هاتف الشركة

    licenses = relationship("License", back_populates="company")
    workers = relationship("Worker", back_populates="company")

    def __repr__(self):
        return f"<Company(name={self.file_name}, file_number={self.file_number})>"


# -----------------------------
# ترخيص (License)
# -----------------------------
class License(Base):
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    civil_id = Column(String)
    issuing_authority = Column(String)
    license_type = Column(String)  # رئيسي / فرعي
    status = Column(String)
    issue_date = Column(Date)
    expiry_date = Column(Date)
    labor_count = Column(Integer)
    license_number = Column(String)
    address = Column(String)
    parent_id = Column(Integer, ForeignKey("licenses.id"), nullable=True)
    parent = relationship("License", remote_side=[id], back_populates="children")
    children = relationship("License", back_populates="parent", cascade="all, delete")

    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="licenses")
    workers = relationship("Worker", back_populates="license")

    def __repr__(self):
        return f"<License(name={self.name}, number={self.license_number})>"


# -----------------------------
# عامل (Worker)
# -----------------------------
class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    civil_id = Column(String, unique=True, index=True)
    name = Column(String)
    nationality = Column(String)
    worker_type = Column(String)  # وافد / مواطن
    job_title = Column(String)
    hire_date = Column(Date)
    work_permit_start = Column(Date)
    work_permit_end = Column(Date)
    salary = Column(Float)
    custom_id = Column(String, unique=True, index=True, nullable=True)  # معرف ذكي للعرض فقط
    phone = Column(String, nullable=True)  # رقم هاتف العامل

    license_id = Column(Integer, ForeignKey("licenses.id"), nullable=True)

    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="workers")
    license = relationship("License", back_populates="workers")

    leaves = relationship("Leave", back_populates="worker")
    deductions = relationship("Deduction", back_populates="worker")
    violations = relationship("Violation", back_populates="worker")
    end_of_service_record = relationship("EndOfService", back_populates="worker", uselist=False)
    absences = relationship("Absence", back_populates="worker")
    documents = relationship("WorkerDocument", back_populates="worker")

    def __repr__(self):
        return f"<Worker(name={self.name}, civil_id={self.civil_id})>"


# -----------------------------
# إجازة (Leave)
# -----------------------------
class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    leave_type = Column(String)  # سنوية - مرضية - بدون راتب ... إلخ
    start_date = Column(Date)
    end_date = Column(Date)
    notes = Column(String)

    worker = relationship("Worker", back_populates="leaves")

    def __repr__(self):
        return f"<Leave(worker_id={self.worker_id}, type={self.leave_type})>"


# -----------------------------
# خصم (Deduction)
# -----------------------------
class Deduction(Base):
    __tablename__ = "deductions"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    amount = Column(Float)
    reason = Column(String)
    date = Column(Date)

    worker = relationship("Worker", back_populates="deductions")
    absence = relationship("Absence", back_populates="deduction", uselist=False)

    def __repr__(self):
        return f"<Deduction(worker_id={self.worker_id}, amount={self.amount})>"


# -----------------------------
# مخالفة (Violation)
# -----------------------------
class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    description = Column(String)
    penalty_amount = Column(Float)
    date = Column(Date)

    worker = relationship("Worker", back_populates="violations")

    def __repr__(self):
        return f"<Violation(worker_id={self.worker_id}, amount={self.penalty_amount})>"


# -----------------------------
# نهاية الخدمة (EndOfService)
# -----------------------------
class EndOfService(Base):
    __tablename__ = "end_of_service"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    calculated_amount = Column(Float)
    calculation_date = Column(Date)
    notes = Column(String)

    worker = relationship("Worker", back_populates="end_of_service_record")

    def __repr__(self):
        return f"<EndOfService(worker_id={self.worker_id}, amount={self.calculated_amount})>"


# -----------------------------
# مستخدم (User)
# -----------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee", nullable=False)  # Added role column
    is_active = Column(Integer, default=1)

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"

# -----------------------------
# غياب (Absence)
# -----------------------------
# تم نقل تعريف Absence إلى models_absence.py لتفادي التكرار
# class Absence(Base):
#     __tablename__ = "absences"

#     id = Column(Integer, primary_key=True, index=True)
#     worker_id = Column(Integer, ForeignKey("workers.id"))
#     start_date = Column(Date)
#     end_date = Column(Date)
#     reason = Column(String)

#     worker = relationship("Worker", back_populates="absences")
#     deduction = relationship("Deduction", back_populates="absence", uselist=False)

#     def __repr__(self):
#         return f"<Absence(worker_id={self.worker_id}, start_date={self.start_date}, end_date={self.end_date})>"
