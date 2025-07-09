from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class CompanyDocument(Base):
    __tablename__ = "company_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    filetype = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # commercial_license, import_license, advertisement_license, etc.
    description = Column(Text)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # معلومات مستخرجة من الملف
    extracted_text = Column(Text)
    license_number = Column(String)
    issue_date = Column(Date)
    expiry_date = Column(Date)
    issuing_authority = Column(String)
    license_status = Column(String)
    
    # معلومات الإشعارات
    notification_sent = Column(Boolean, default=False)
    notification_6_months = Column(Boolean, default=False)
    notification_3_months = Column(Boolean, default=False)
    notification_1_month = Column(Boolean, default=False)
    notification_1_week = Column(Boolean, default=False)
    
    # العلاقات
    company = relationship("Company", back_populates="documents")
    
    def __repr__(self):
        return f"<CompanyDocument(company_id={self.company_id}, type={self.document_type}, expires={self.expiry_date})>"

class DocumentType(Base):
    __tablename__ = "document_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    name_ar = Column(String, nullable=False)
    description = Column(Text)
    required_fields = Column(Text)  # JSON string of required fields
    notification_periods = Column(Text)  # JSON string of notification periods
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<DocumentType(name={self.name}, name_ar={self.name_ar})>"
