from enum import Enum
from typing import List, Dict, Any
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.permission import Permission, Role

class PermissionType(str, Enum):
    """أنواع الصلاحيات في النظام"""
    # صلاحيات الشركات
    CREATE_COMPANY = "create_company"
    READ_COMPANY = "read_company"
    UPDATE_COMPANY = "update_company"
    DELETE_COMPANY = "delete_company"
    
    # صلاحيات العمال
    CREATE_EMPLOYEE = "create_employee"
    READ_EMPLOYEE = "read_employee"
    UPDATE_EMPLOYEE = "update_employee"
    DELETE_EMPLOYEE = "delete_employee"
    
    # صلاحيات الرخص
    CREATE_LICENSE = "create_license"
    READ_LICENSE = "read_license"
    UPDATE_LICENSE = "update_license"
    DELETE_LICENSE = "delete_license"
    
    # صلاحيات الوثائق
    UPLOAD_DOCUMENT = "upload_document"
    READ_DOCUMENT = "read_document"
    DELETE_DOCUMENT = "delete_document"
    
    # صلاحيات إدارية
    MANAGE_USERS = "manage_users"
    MANAGE_PERMISSIONS = "manage_permissions"
    VIEW_REPORTS = "view_reports"
    SYSTEM_ADMIN = "system_admin"

class RoleType(str, Enum):
    """أنواع الأدوار في النظام"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    VIEWER = "viewer"

# تعريف الصلاحيات لكل دور
ROLE_PERMISSIONS: Dict[RoleType, List[PermissionType]] = {
    RoleType.SUPER_ADMIN: [perm for perm in PermissionType],
    RoleType.ADMIN: [
        PermissionType.CREATE_COMPANY,
        PermissionType.READ_COMPANY,
        PermissionType.UPDATE_COMPANY,
        PermissionType.CREATE_EMPLOYEE,
        PermissionType.READ_EMPLOYEE,
        PermissionType.UPDATE_EMPLOYEE,
        PermissionType.CREATE_LICENSE,
        PermissionType.READ_LICENSE,
        PermissionType.UPDATE_LICENSE,
        PermissionType.UPLOAD_DOCUMENT,
        PermissionType.READ_DOCUMENT,
        PermissionType.VIEW_REPORTS,
    ],
    RoleType.MANAGER: [
        PermissionType.READ_COMPANY,
        PermissionType.CREATE_EMPLOYEE,
        PermissionType.READ_EMPLOYEE,
        PermissionType.UPDATE_EMPLOYEE,
        PermissionType.READ_LICENSE,
        PermissionType.UPLOAD_DOCUMENT,
        PermissionType.READ_DOCUMENT,
    ],
    RoleType.USER: [
        PermissionType.READ_COMPANY,
        PermissionType.READ_EMPLOYEE,
        PermissionType.READ_LICENSE,
        PermissionType.READ_DOCUMENT,
    ],
    RoleType.VIEWER: [
        PermissionType.READ_COMPANY,
        PermissionType.READ_EMPLOYEE,
        PermissionType.READ_LICENSE,
        PermissionType.READ_DOCUMENT,
    ],
}

def check_permission(
    user: User,
    required_permission: PermissionType,
    db: Session
) -> bool:
    """التحقق من وجود صلاحية معينة للمستخدم"""
    if not user or not user.is_active:
        return False
    
    # إذا كان المستخدم سوبر أدمن
    if user.role and user.role.name == RoleType.SUPER_ADMIN:
        return True
    
    # التحقق من صلاحيات الدور
    if user.role:
        role_permissions = ROLE_PERMISSIONS.get(RoleType(user.role.name), [])
        if required_permission in role_permissions:
            return True
    
    # التحقق من الصلاحيات المباشرة للمستخدم
    user_permissions = [perm.name for perm in user.permissions] if user.permissions else []
    return required_permission.value in user_permissions

def require_permission(permission: PermissionType):
    """ديكوريتر للتحقق من الصلاحيات"""
    def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        if not check_permission(current_user, permission, db):
            raise HTTPException(
                status_code=403,
                detail=f"ليس لديك صلاحية لـ {permission.value}"
            )
        return current_user
    return permission_checker

def require_role(role: RoleType):
    """ديكوريتر للتحقق من الدور"""
    def role_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        if not current_user or not current_user.is_active:
            raise HTTPException(status_code=401, detail="غير مصرح")
        
        if not current_user.role or current_user.role.name != role:
            raise HTTPException(
                status_code=403,
                detail=f"هذه العملية تتطلب دور {role.value}"
            )
        return current_user
    return role_checker

# سيتم تعريف get_current_user في ملف auth
def get_current_user():
    """سيتم تعريفها في auth/auth_handler.py"""
    pass
