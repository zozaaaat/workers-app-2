from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

# جدول العلاقة بين الأدوار والصلاحيات
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    display_name = Column(String(100), nullable=False)  # الاسم المعروض
    description = Column(Text)
    
    # خصائص الدور
    is_system = Column(Boolean, default=False)  # دور نظام لا يمكن حذفه
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)  # أولوية الدور (الأعلى رقم = أولوية أكبر)
    
    # العلاقات
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")
    
    # الطوابع الزمنية
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Role(name='{self.name}', display_name='{self.display_name}')>"

    @property
    def permission_keys(self):
        """الحصول على مفاتيح الصلاحيات للدور"""
        return [p.key for p in self.permissions]

    def has_permission(self, permission_key: str) -> bool:
        """التحقق من وجود صلاحية معينة في الدور"""
        return permission_key in self.permission_keys

# الأدوار الافتراضية للنظام
DEFAULT_ROLES = [
    {
        'name': 'super_admin',
        'display_name': 'مدير النظام الرئيسي',
        'description': 'صلاحيات كاملة على النظام',
        'is_system': True,
        'priority': 1000
    },
    {
        'name': 'admin',
        'display_name': 'مدير النظام',
        'description': 'صلاحيات إدارية واسعة',
        'is_system': True,
        'priority': 900
    },
    {
        'name': 'hr_manager',
        'display_name': 'مدير الموارد البشرية',
        'description': 'إدارة الموظفين والموارد البشرية',
        'is_system': True,
        'priority': 800
    },
    {
        'name': 'hr_specialist',
        'display_name': 'اختصاصي موارد بشرية',
        'description': 'العمليات الأساسية للموارد البشرية',
        'is_system': True,
        'priority': 700
    },
    {
        'name': 'manager',
        'display_name': 'مدير',
        'description': 'مدير قسم أو فريق',
        'is_system': True,
        'priority': 600
    },
    {
        'name': 'supervisor',
        'display_name': 'مشرف',
        'description': 'مشرف على الموظفين',
        'is_system': True,
        'priority': 500
    },
    {
        'name': 'employee',
        'display_name': 'موظف',
        'description': 'موظف عادي',
        'is_system': True,
        'priority': 400
    },
    {
        'name': 'viewer',
        'display_name': 'مشاهد',
        'description': 'صلاحيات مشاهدة فقط',
        'is_system': True,
        'priority': 100
    }
]
