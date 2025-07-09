from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Text, Boolean, Float
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class LicenseDocument(Base):
    __tablename__ = "license_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    license_id = Column(Integer, ForeignKey("licenses.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    filetype = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # main_license, sub_license, renewal, amendment, etc.
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
    license = relationship("License", back_populates="documents")
    
    def __repr__(self):
        return f"<LicenseDocument(license_id={self.license_id}, type={self.document_type}, expires={self.expiry_date})>"

class LicenseType(Base):
    __tablename__ = "license_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    name_ar = Column(String, nullable=False)
    description = Column(Text)
    is_main_license = Column(Boolean, default=True)  # رخصة رئيسية أم فرعية
    parent_license_type_id = Column(Integer, ForeignKey("license_types.id"), nullable=True)
    required_fields = Column(Text)  # JSON string of required fields
    notification_periods = Column(Text)  # JSON string of notification periods
    is_active = Column(Boolean, default=True)
    
    # العلاقات الهرمية
    parent_license_type = relationship("LicenseType", remote_side=[id], back_populates="sub_license_types")
    sub_license_types = relationship("LicenseType", back_populates="parent_license_type")

class DocumentArchive(Base):
    """نظام الأرشيف للمستندات المهمة مثل عقود الإيجار والصولات"""
    __tablename__ = "document_archive"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    filetype = Column(String, nullable=False)
    
    # نوع المستند
    archive_type = Column(String, nullable=False)  # rent_contract, rent_receipt, insurance, bank_guarantee, etc.
    category = Column(String, nullable=False)  # contracts, receipts, insurances, guarantees, etc.
    
    # معلومات عامة
    title = Column(String, nullable=False)
    description = Column(Text)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # معلومات العقد/الصولة
    contract_number = Column(String)
    amount = Column(Float)
    currency = Column(String, default="EGP")
    start_date = Column(Date)
    end_date = Column(Date)
    
    # معلومات الطرف الآخر
    party_name = Column(String)  # اسم المالك أو الجهة
    party_contact = Column(String)  # بيانات الاتصال
    
    # معلومات الدفع (للصولات)
    payment_date = Column(Date)
    payment_method = Column(String)  # cash, bank_transfer, check, etc.
    reference_number = Column(String)  # رقم المرجع أو الشيك
    
    # الربط بالشركة أو الترخيص
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    license_id = Column(Integer, ForeignKey("licenses.id"), nullable=True)
    
    # معلومات التذكير
    is_recurring = Column(Boolean, default=False)  # للصولات الشهرية
    next_due_date = Column(Date)  # تاريخ الاستحقاق التالي
    reminder_sent = Column(Boolean, default=False)
    
    # حالة المستند
    status = Column(String, default="active")  # active, expired, cancelled
    is_important = Column(Boolean, default=True)  # مهم للأرشيف
    
    # العلاقات
    company = relationship("Company", back_populates="archived_documents")
    license = relationship("License", back_populates="archived_documents")
    
    def __repr__(self):
        return f"<DocumentArchive(title={self.title}, type={self.archive_type}, date={self.upload_date})>"

class ArchiveCategory(Base):
    """تصنيفات الأرشيف"""
    __tablename__ = "archive_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    name_ar = Column(String, nullable=False)
    description = Column(Text)
    color = Column(String, default="#007bff")  # لون للتمييز
    icon = Column(String)  # أيقونة للعرض
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<ArchiveCategory(name={self.name}, name_ar={self.name_ar})>"

class ArchiveType(Base):
    """أنواع المستندات في الأرشيف"""
    __tablename__ = "archive_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    name_ar = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("archive_categories.id"), nullable=False)
    description = Column(Text)
    required_fields = Column(Text)  # JSON string of required fields
    is_recurring = Column(Boolean, default=False)  # هل هو متكرر (مثل الصولات الشهرية)
    reminder_periods = Column(Text)  # فترات التذكير
    is_active = Column(Boolean, default=True)
    
    # العلاقات
    category = relationship("ArchiveCategory")
    
    def __repr__(self):
        return f"<ArchiveType(name={self.name}, category={self.category.name_ar})>"
