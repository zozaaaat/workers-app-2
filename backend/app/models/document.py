from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, BigInteger, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.base import Base

class DocumentType(enum.Enum):
    # أنواع المستندات الشخصية
    ID_CARD = "id_card"                      # بطاقة الهوية
    PASSPORT = "passport"                    # جواز السفر
    RESIDENCY = "residency"                  # الإقامة
    PERSONAL_PHOTO = "personal_photo"        # الصورة الشخصية
    WORK_PERMIT = "work_permit"              # رخصة العمل
    
    # أنواع المستندات المالية
    RENT_RECEIPT = "rent_receipt"            # إيصال الإيجار
    SALARY_CERTIFICATE = "salary_certificate" # شهادة راتب
    BANK_STATEMENT = "bank_statement"        # كشف حساب بنكي
    
    # أنواع المستندات الطبية والتعليمية
    MEDICAL_CERTIFICATE = "medical_certificate" # شهادة طبية
    EDUCATIONAL_CERTIFICATE = "educational_certificate" # شهادة تعليمية
    
    # أنواع مستندات العمل
    CONTRACT = "contract"                    # عقد
    EMPLOYMENT_CONTRACT = "employment_contract" # عقد عمل
    TERMINATION_LETTER = "termination_letter"   # خطاب إنهاء خدمة
    
    # مستندات الشركة
    COMPANY_LICENSE = "company_license"      # رخصة الشركة
    COMPANY_REGISTRATION = "company_registration" # سجل تجاري
    TAX_CERTIFICATE = "tax_certificate"     # شهادة ضريبية
    INSURANCE_POLICY = "insurance_policy"   # وثيقة تأمين
    
    # أخرى
    OTHER = "other"                         # أخرى

class EntityType(enum.Enum):
    EMPLOYEE = "employee"
    COMPANY = "company"
    LICENSE = "license"
    USER = "user"

class DocumentStatus(enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    
    # معلومات أساسية
    name = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    url = Column(String(500))  # رابط الوصول للملف
    
    # معلومات الملف
    file_size = Column(BigInteger)  # حجم الملف بالبايت
    mime_type = Column(String(100))
    file_extension = Column(String(10))
    
    # نوع المستند
    file_type = Column(String(100), nullable=False)  # النوع المحدد من القائمة
    custom_type = Column(String(100))  # النوع المخصص إذا تم اختيار "أخرى"
    document_type = Column(Enum(DocumentType))  # النوع من enum
    
    # معلومات الكيان المرتبط
    entity_type = Column(Enum(EntityType), nullable=False)  # نوع الكيان
    entity_id = Column(Integer, nullable=False)  # معرف الكيان
    
    # معلومات إضافية
    description = Column(Text)
    notes = Column(Text)
    tags = Column(Text)  # JSON string للعلامات
    
    # معلومات الحالة
    status = Column(Enum(DocumentStatus), default=DocumentStatus.ACTIVE)
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)
    is_confidential = Column(Boolean, default=False)
    
    # معلومات التحقق
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id"))
    verified_at = Column(DateTime(timezone=True))
    
    # معلومات انتهاء الصلاحية
    expiry_date = Column(DateTime(timezone=True))
    reminder_days = Column(Integer, default=30)
    
    # المفاتيح الخارجية (اختيارية حسب entity_type)
    company_id = Column(Integer, ForeignKey("companies.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    license_id = Column(Integer, ForeignKey("licenses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # العلاقات
    company = relationship("Company", back_populates="documents", foreign_keys=[company_id])
    employee = relationship("Employee", back_populates="documents", foreign_keys=[employee_id])
    license = relationship("License", back_populates="documents", foreign_keys=[license_id])
    user = relationship("User", foreign_keys=[user_id])
    uploader = relationship("User", foreign_keys=[uploaded_by])
    verifier = relationship("User", foreign_keys=[verified_by])
    
    # الطوابع الزمنية
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Document(name='{self.name}', file_type='{self.file_type}', entity_type='{self.entity_type}', entity_id={self.entity_id})>"

    @property
    def formatted_file_size(self):
        """تنسيق حجم الملف للعرض"""
        if not self.file_size:
            return "غير محدد"
        
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    @property
    def is_image(self):
        """التحقق من كون الملف صورة"""
        if self.mime_type:
            return self.mime_type.startswith('image/')
        if self.file_extension:
            return self.file_extension.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        return False

    @property
    def is_pdf(self):
        """التحقق من كون الملف PDF"""
        if self.mime_type:
            return self.mime_type == 'application/pdf'
        if self.file_extension:
            return self.file_extension.lower() == '.pdf'
        return False

    @property
    def is_expired(self):
        """التحقق من انتهاء صلاحية المستند"""
        if self.expiry_date:
            from datetime import datetime
            return datetime.now() > self.expiry_date
        return False

    @property
    def days_until_expiry(self):
        """عدد الأيام المتبقية حتى انتهاء الصلاحية"""
        if self.expiry_date:
            from datetime import datetime
            delta = self.expiry_date - datetime.now()
            return delta.days
        return None

    def get_display_type(self):
        """الحصول على نوع المستند للعرض"""
        if self.custom_type:
            return self.custom_type
        elif self.document_type:
            # يمكن إضافة ترجمة هنا
            type_translations = {
                DocumentType.ID_CARD: "بطاقة الهوية",
                DocumentType.PASSPORT: "جواز السفر",
                DocumentType.RESIDENCY: "الإقامة",
                DocumentType.PERSONAL_PHOTO: "الصورة الشخصية",
                DocumentType.WORK_PERMIT: "رخصة العمل",
                DocumentType.RENT_RECEIPT: "إيصال الإيجار",
                DocumentType.SALARY_CERTIFICATE: "شهادة راتب",
                DocumentType.BANK_STATEMENT: "كشف حساب بنكي",
                DocumentType.MEDICAL_CERTIFICATE: "شهادة طبية",
                DocumentType.EDUCATIONAL_CERTIFICATE: "شهادة تعليمية",
                DocumentType.CONTRACT: "عقد",
                DocumentType.OTHER: "أخرى"
            }
            return type_translations.get(self.document_type, self.document_type.value)
        else:
            return self.file_type
