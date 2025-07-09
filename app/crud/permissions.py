from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models_permissions import Permission, UserPermission, ApprovalRequest, ActivityLog
from app.models import User
from app.schemas_permissions import (
    PermissionCreate, UserPermissionCreate, ApprovalRequestCreate, 
    ApprovalRequestUpdate, ActivityLogCreate, ApprovalStatus, ActionType
)


# -----------------------------
# Permissions CRUD
# -----------------------------
def get_permission(db: Session, permission_id: int):
    return db.query(Permission).filter(Permission.id == permission_id).first()


def get_permission_by_name(db: Session, name: str):
    return db.query(Permission).filter(Permission.name == name).first()


def get_permissions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Permission).offset(skip).limit(limit).all()


def get_permissions_by_module(db: Session, module: str):
    return db.query(Permission).filter(Permission.module == module).all()


def create_permission(db: Session, permission: PermissionCreate):
    db_permission = Permission(**permission.dict())
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return db_permission


# -----------------------------
# User Permissions CRUD
# -----------------------------
def get_user_permissions(db: Session, user_id: int):
    return db.query(UserPermission).filter(
        and_(UserPermission.user_id == user_id, UserPermission.granted == True)
    ).all()


def check_user_permission(db: Session, user_id: int, permission_name: str) -> bool:
    """التحقق من وجود صلاحية معينة للمستخدم"""
    permission = get_permission_by_name(db, permission_name)
    if not permission:
        return False
    
    user_permission = db.query(UserPermission).filter(
        and_(
            UserPermission.user_id == user_id,
            UserPermission.permission_id == permission.id,
            UserPermission.granted == True
        )
    ).first()
    
    return user_permission is not None


def grant_permission_to_user(db: Session, user_id: int, permission_id: int, granted_by: int):
    """منح صلاحية للمستخدم"""
    # التحقق من وجود الصلاحية مسبقاً
    existing = db.query(UserPermission).filter(
        and_(UserPermission.user_id == user_id, UserPermission.permission_id == permission_id)
    ).first()
    
    if existing:
        existing.granted = True
        existing.granted_by = granted_by
        existing.granted_at = datetime.utcnow()
    else:
        user_permission = UserPermission(
            user_id=user_id,
            permission_id=permission_id,
            granted=True,
            granted_by=granted_by
        )
        db.add(user_permission)
    
    db.commit()
    return existing or user_permission


def revoke_permission_from_user(db: Session, user_id: int, permission_id: int):
    """إلغاء صلاحية من المستخدم"""
    user_permission = db.query(UserPermission).filter(
        and_(UserPermission.user_id == user_id, UserPermission.permission_id == permission_id)
    ).first()
    
    if user_permission:
        user_permission.granted = False
        db.commit()
    
    return user_permission


def update_user_permissions(db: Session, user_id: int, permission_ids: List[int], granted_by: int):
    """تحديث جميع صلاحيات المستخدم"""
    # إلغاء جميع الصلاحيات الحالية
    db.query(UserPermission).filter(UserPermission.user_id == user_id).update({"granted": False})
    
    # منح الصلاحيات الجديدة
    for permission_id in permission_ids:
        grant_permission_to_user(db, user_id, permission_id, granted_by)
    
    db.commit()


# -----------------------------
# Approval Requests CRUD
# -----------------------------
def create_approval_request(db: Session, request: ApprovalRequestCreate, user_id: int):
    """إنشاء طلب موافقة جديد"""
    db_request = ApprovalRequest(
        user_id=user_id,
        action_type=request.action_type,
        entity_type=request.entity_type,
        entity_id=request.entity_id,
        old_data=request.old_data,
        new_data=request.new_data,
        description=request.description,
        status=ApprovalStatus.PENDING
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


def get_approval_request(db: Session, request_id: int):
    return db.query(ApprovalRequest).filter(ApprovalRequest.id == request_id).first()


def get_pending_approval_requests(db: Session, skip: int = 0, limit: int = 100):
    """الحصول على طلبات الموافقة المعلقة"""
    return db.query(ApprovalRequest).filter(
        ApprovalRequest.status == ApprovalStatus.PENDING
    ).order_by(ApprovalRequest.created_at.desc()).offset(skip).limit(limit).all()


def get_user_approval_requests(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """الحصول على طلبات الموافقة الخاصة بمستخدم معين"""
    return db.query(ApprovalRequest).filter(
        ApprovalRequest.user_id == user_id
    ).order_by(ApprovalRequest.created_at.desc()).offset(skip).limit(limit).all()


def update_approval_request(db: Session, request_id: int, update_data: ApprovalRequestUpdate, reviewer_id: int):
    """تحديث حالة طلب الموافقة"""
    db_request = get_approval_request(db, request_id)
    if not db_request:
        return None
    
    db_request.status = update_data.status
    db_request.review_notes = update_data.review_notes
    db_request.reviewed_by = reviewer_id
    db_request.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_request)
    return db_request


# -----------------------------
# Activity Log CRUD
# -----------------------------
def create_activity_log(db: Session, log: ActivityLogCreate):
    """إنشاء سجل نشاط جديد"""
    db_log = ActivityLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_activity_logs(db: Session, skip: int = 0, limit: int = 100):
    """الحصول على سجلات الأنشطة"""
    return db.query(ActivityLog).order_by(
        ActivityLog.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_user_activity_logs(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """الحصول على سجلات أنشطة مستخدم معين"""
    return db.query(ActivityLog).filter(
        ActivityLog.user_id == user_id
    ).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()


# -----------------------------
# Permission Checking Functions
# -----------------------------
def requires_approval(user_role: str, action: str, entity_type: str) -> bool:
    """تحديد ما إذا كانت العملية تحتاج موافقة"""
    if user_role == "admin":
        return False  # الأدمن لا يحتاج موافقات
    
    if user_role == "manager":
        # المدير يحتاج موافقة فقط للعمليات الحساسة
        sensitive_operations = ["delete_company", "delete_license", "transfer_main_license"]
        return f"{action}_{entity_type}" in sensitive_operations
    
    if user_role == "employee":
        return True  # الموظف العادي يحتاج موافقة لكل شيء
    
    return True


def can_user_perform_action(db: Session, user_id: int, action: str, entity_type: str) -> Dict[str, Any]:
    """التحقق من قدرة المستخدم على تنفيذ عملية معينة"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        return {
            "allowed": False,
            "requires_approval": False,
            "message": "المستخدم غير موجود أو غير فعال"
        }
    
    # الأدمن يستطيع كل شيء
    if user.role == "admin":
        return {
            "allowed": True,
            "requires_approval": False,
            "message": "مسموح - صلاحيات الأدمن"
        }
    
    # التحقق من الصلاحية المحددة
    permission_name = f"{action}_{entity_type}"
    has_permission = check_user_permission(db, user_id, permission_name)
    
    if not has_permission:
        return {
            "allowed": False,
            "requires_approval": False,
            "message": f"ليس لديك صلاحية {permission_name}"
        }
    
    # التحقق من ضرورة الموافقة
    needs_approval = requires_approval(user.role, action, entity_type)
    
    return {
        "allowed": True,
        "requires_approval": needs_approval,
        "message": "موافقة المدير مطلوبة" if needs_approval else "مسموح"
    }
