from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)  # المفتاح الفريد للصلاحية
    name = Column(String(100), nullable=False)  # الاسم المعروض
    description = Column(Text)
    category = Column(String(50))  # فئة الصلاحية (employees, licenses, etc.)
    module = Column(String(50))    # الوحدة التي تنتمي إليها
    
    # خصائص الصلاحية
    is_system = Column(Boolean, default=False)  # صلاحية نظام لا يمكن حذفها
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)  # أولوية الصلاحية
    
    # العلاقات
    roles = relationship("Role", secondary="role_permissions", back_populates="permissions")
    users = relationship("User", secondary="user_permissions", back_populates="permissions")
    
    # الطوابع الزمنية
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Permission(key='{self.key}', name='{self.name}', category='{self.category}')>"

# الصلاحيات الافتراضية للنظام
DEFAULT_PERMISSIONS = [
    # إدارة الموظفين
    {'key': 'employees.view', 'name': 'عرض الموظفين', 'category': 'employees', 'module': 'hr'},
    {'key': 'employees.create', 'name': 'إضافة موظف', 'category': 'employees', 'module': 'hr'},
    {'key': 'employees.edit', 'name': 'تعديل موظف', 'category': 'employees', 'module': 'hr'},
    {'key': 'employees.delete', 'name': 'حذف موظف', 'category': 'employees', 'module': 'hr'},
    {'key': 'employees.archive', 'name': 'أرشفة موظف', 'category': 'employees', 'module': 'hr'},
    
    # إدارة التراخيص
    {'key': 'licenses.view', 'name': 'عرض التراخيص', 'category': 'licenses', 'module': 'hr'},
    {'key': 'licenses.create', 'name': 'إضافة ترخيص', 'category': 'licenses', 'module': 'hr'},
    {'key': 'licenses.edit', 'name': 'تعديل ترخيص', 'category': 'licenses', 'module': 'hr'},
    {'key': 'licenses.delete', 'name': 'حذف ترخيص', 'category': 'licenses', 'module': 'hr'},
    {'key': 'licenses.archive', 'name': 'أرشفة ترخيص', 'category': 'licenses', 'module': 'hr'},
    
    # إدارة الإجازات
    {'key': 'leaves.view', 'name': 'عرض الإجازات', 'category': 'leaves', 'module': 'hr'},
    {'key': 'leaves.create', 'name': 'إضافة إجازة', 'category': 'leaves', 'module': 'hr'},
    {'key': 'leaves.edit', 'name': 'تعديل إجازة', 'category': 'leaves', 'module': 'hr'},
    {'key': 'leaves.delete', 'name': 'حذف إجازة', 'category': 'leaves', 'module': 'hr'},
    {'key': 'leaves.approve', 'name': 'الموافقة على الإجازات', 'category': 'leaves', 'module': 'hr'},
    {'key': 'leaves.reject', 'name': 'رفض الإجازات', 'category': 'leaves', 'module': 'hr'},
    
    # إدارة الاستقطاعات
    {'key': 'deductions.view', 'name': 'عرض الاستقطاعات', 'category': 'deductions', 'module': 'hr'},
    {'key': 'deductions.create', 'name': 'إضافة استقطاع', 'category': 'deductions', 'module': 'hr'},
    {'key': 'deductions.edit', 'name': 'تعديل استقطاع', 'category': 'deductions', 'module': 'hr'},
    {'key': 'deductions.delete', 'name': 'حذف استقطاع', 'category': 'deductions', 'module': 'hr'},
    
    # إدارة الوثائق
    {'key': 'documents.view', 'name': 'عرض الوثائق', 'category': 'documents', 'module': 'documents'},
    {'key': 'documents.upload', 'name': 'رفع وثيقة', 'category': 'documents', 'module': 'documents'},
    {'key': 'documents.download', 'name': 'تحميل وثيقة', 'category': 'documents', 'module': 'documents'},
    {'key': 'documents.delete', 'name': 'حذف وثيقة', 'category': 'documents', 'module': 'documents'},
    
    # إدارة التقارير
    {'key': 'reports.view', 'name': 'عرض التقارير', 'category': 'reports', 'module': 'reports'},
    {'key': 'reports.export', 'name': 'تصدير التقارير', 'category': 'reports', 'module': 'reports'},
    {'key': 'reports.advanced', 'name': 'التقارير المتقدمة', 'category': 'reports', 'module': 'reports'},
    
    # إدارة المستخدمين
    {'key': 'users.view', 'name': 'عرض المستخدمين', 'category': 'users', 'module': 'admin'},
    {'key': 'users.create', 'name': 'إضافة مستخدم', 'category': 'users', 'module': 'admin'},
    {'key': 'users.edit', 'name': 'تعديل مستخدم', 'category': 'users', 'module': 'admin'},
    {'key': 'users.delete', 'name': 'حذف مستخدم', 'category': 'users', 'module': 'admin'},
    {'key': 'users.permissions', 'name': 'إدارة صلاحيات المستخدمين', 'category': 'users', 'module': 'admin'},
    
    # إدارة النظام
    {'key': 'system.admin', 'name': 'إدارة النظام', 'category': 'system', 'module': 'admin'},
    {'key': 'system.settings', 'name': 'إعدادات النظام', 'category': 'system', 'module': 'admin'},
    {'key': 'system.backup', 'name': 'النسخ الاحتياطي', 'category': 'system', 'module': 'admin'},
    
    # إدارة الشركة
    {'key': 'company.view', 'name': 'عرض معلومات الشركة', 'category': 'company', 'module': 'admin'},
    {'key': 'company.edit', 'name': 'تعديل معلومات الشركة', 'category': 'company', 'module': 'admin'},
    {'key': 'company.documents', 'name': 'إدارة وثائق الشركة', 'category': 'company', 'module': 'documents'},
    
    # إدارة الإشعارات
    {'key': 'notifications.view', 'name': 'عرض الإشعارات', 'category': 'notifications', 'module': 'notifications'},
    {'key': 'notifications.create', 'name': 'إنشاء إشعار', 'category': 'notifications', 'module': 'notifications'},
    {'key': 'notifications.delete', 'name': 'حذف إشعار', 'category': 'notifications', 'module': 'notifications'},
]
