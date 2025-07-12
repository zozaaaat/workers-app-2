from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

# جدول العلاقة بين المستخدمين والصلاحيات
user_permissions = Table(
    'user_permissions',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    phone = Column(String(20))
    avatar = Column(String(255))  # رابط الصورة الشخصية
    
    # معلومات الحالة
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    status = Column(String(20), default='active')  # active, inactive, suspended
    last_login = Column(DateTime(timezone=True))
    
    # المفاتيح الخارجية
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    # ملاحظات
    notes = Column(Text)
    
    # العلاقات
    role = relationship("Role", back_populates="users")
    company = relationship("Company", back_populates="users")
    permissions = relationship("Permission", secondary=user_permissions, back_populates="users")
    employee = relationship("Employee", back_populates="user", uselist=False)
    
    # الطوابع الزمنية
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}', role='{self.role.name if self.role else None}')>"

    @property
    def is_admin(self):
        """التحقق من كون المستخدم مدير"""
        return self.is_superuser or (self.role and self.role.name in ['admin', 'super_admin'])

    @property
    def permission_keys(self):
        """الحصول على مفاتيح الصلاحيات للمستخدم"""
        user_permissions = [p.key for p in self.permissions]
        role_permissions = [p.key for p in self.role.permissions] if self.role else []
        return list(set(user_permissions + role_permissions))

    def has_permission(self, permission_key: str) -> bool:
        """التحقق من وجود صلاحية معينة"""
        if self.is_superuser:
            return True
        return permission_key in self.permission_keys
