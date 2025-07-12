from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Date, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.base import Base

class LicenseType(enum.Enum):
    TRADE = "trade"                    # رخصة تجارية
    INDUSTRIAL = "industrial"          # رخصة صناعية
    PROFESSIONAL = "professional"      # رخصة مهنية
    MUNICIPAL = "municipal"            # رخصة بلدية
    HEALTH = "health"                  # رخصة صحية
    FIRE_SAFETY = "fire_safety"       # رخصة السلامة
    ENVIRONMENTAL = "environmental"    # رخصة بيئية
    IMPORT_EXPORT = "import_export"    # رخصة استيراد وتصدير
    TRANSPORT = "transport"            # رخصة نقل
    CONSTRUCTION = "construction"      # رخصة إنشاءات
    FOOD_HANDLING = "food_handling"    # رخصة تداول أغذية
    OTHER = "other"                    # أخرى

class LicenseStatus(enum.Enum):
    ACTIVE = "active"              # نشطة
    EXPIRED = "expired"            # منتهية الصلاحية
    SUSPENDED = "suspended"        # معلقة
    CANCELLED = "cancelled"        # ملغاة
    UNDER_RENEWAL = "under_renewal" # تحت التجديد
    PENDING = "pending"            # في الانتظار

class License(Base):
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    
    # معلومات أساسية
    name = Column(String(200), nullable=False)  # اسم الرخصة
    license_number = Column(String(100), unique=True, nullable=False, index=True)
    license_type = Column(Enum(LicenseType), nullable=False)
    status = Column(Enum(LicenseStatus), default=LicenseStatus.ACTIVE)
    
    # معلومات التواريخ
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    renewal_date = Column(Date)
    last_renewal_date = Column(Date)
    next_renewal_due = Column(Date)
    
    # معلومات الجهة المصدرة
    issuing_authority = Column(String(200))
    issuing_authority_code = Column(String(50))
    issuing_location = Column(String(100))
    
    # معلومات مالية
    issue_cost = Column(Numeric(10, 2))
    renewal_cost = Column(Numeric(10, 2))
    penalty_amount = Column(Numeric(10, 2), default=0)
    
    # معلومات إضافية
    description = Column(Text)
    terms_and_conditions = Column(Text)
    renewal_requirements = Column(Text)
    notes = Column(Text)
    
    # معلومات تقنية
    category = Column(String(100))  # فئة الرخصة
    subcategory = Column(String(100))  # فئة فرعية
    classification = Column(String(100))  # تصنيف
    scope_of_work = Column(Text)  # نطاق العمل
    
    # تنبيهات
    renewal_alert_days = Column(Integer, default=30)  # عدد الأيام للتنبيه قبل انتهاء الصلاحية
    is_renewable = Column(Boolean, default=True)
    is_transferable = Column(Boolean, default=False)
    requires_inspection = Column(Boolean, default=False)
    
    # حالة الرخصة
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    
    # المفاتيح الخارجية
    company_id = Column(Integer, ForeignKey("companies.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    parent_license_id = Column(Integer, ForeignKey("licenses.id"))  # رخصة أصلية إذا كانت هذه تجديد
    
    # العلاقات
    company = relationship("Company", back_populates="licenses")
    employee = relationship("Employee", back_populates="licenses")
    documents = relationship("Document", back_populates="license")
    parent_license = relationship("License", remote_side=[id])
    child_licenses = relationship("License", overlaps="parent_license")
    alerts = relationship("Alert", back_populates="license")
    
    # الطوابع الزمنية
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<License(name='{self.name}', number='{self.license_number}', type='{self.license_type}', status='{self.status}')>"

    @property
    def is_expired(self):
        """التحقق من انتهاء صلاحية الرخصة"""
        if self.expiry_date:
            from datetime import date
            return date.today() > self.expiry_date
        return False

    @property
    def days_until_expiry(self):
        """عدد الأيام المتبقية حتى انتهاء الصلاحية"""
        if self.expiry_date:
            from datetime import date
            delta = self.expiry_date - date.today()
            return delta.days
        return None

    @property
    def is_renewal_due(self):
        """التحقق من وجوب التجديد"""
        if self.renewal_alert_days and self.days_until_expiry is not None:
            return self.days_until_expiry <= self.renewal_alert_days
        return False

    @property
    def renewal_urgency(self):
        """مستوى إلحاح التجديد"""
        days = self.days_until_expiry
        if days is None:
            return "unknown"
        elif days < 0:
            return "expired"
        elif days <= 7:
            return "critical"
        elif days <= 30:
            return "urgent"
        elif days <= 90:
            return "warning"
        else:
            return "normal"
