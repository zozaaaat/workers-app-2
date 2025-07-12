from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    address = Column(Text)
    registration_number = Column(String, unique=True)
    tax_number = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    employees = relationship("Employee", back_populates="company")
    licenses = relationship("License", back_populates="company")
    documents = relationship("Document", back_populates="company")
    users = relationship("User", back_populates="company")  # إضافة العلاقة المفقودة
    tasks = relationship("Task", back_populates="company")  # إضافة علاقة المهام
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Company(name='{self.name}', registration_number='{self.registration_number}')>"
