# استيراد جميع النماذج
from .user import User, user_permissions
from .role import Role, role_permissions, DEFAULT_ROLES
from .permission import Permission, DEFAULT_PERMISSIONS
from .company import Company
from .license import License, LicenseType, LicenseStatus
from .employee import Employee, EmployeeStatus, Gender, MaritalStatus
from .document import Document, DocumentType, EntityType, DocumentStatus
from .alert import Alert

# تصدير جميع النماذج والجداول المساعدة
__all__ = [
    # النماذج الأساسية
    "User",
    "Role", 
    "Permission",
    "Company",
    "License",
    "Employee",
    "Document",
    "Alert",
    
    # الجداول المساعدة
    "user_permissions",
    "role_permissions",
    
    # الـ Enums
    "LicenseType",
    "LicenseStatus", 
    "EmployeeStatus",
    "Gender",
    "MaritalStatus",
    "DocumentType",
    "EntityType",
    "DocumentStatus",
    
    # البيانات الافتراضية
    "DEFAULT_ROLES",
    "DEFAULT_PERMISSIONS"
]
