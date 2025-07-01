from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    # علاقة واحد لمجموعة: موظف له مستخدمين
    users = relationship("User", back_populates="employee", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # مثال: "admin", "user"
    employee_id = Column(Integer, ForeignKey("employees.id"))

    # العلاقة العكسية لموظف مرتبط بالمستخدم
    employee = relationship("Employee", back_populates="users")
