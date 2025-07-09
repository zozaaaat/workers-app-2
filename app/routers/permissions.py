from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas_permissions import (
    Permission, PermissionCreate, UserPermission, UserPermissionCreate,
    ApprovalRequest, ApprovalRequestCreate, ApprovalRequestUpdate,
    ActivityLog, ActivityLogCreate, PermissionCheck, UserRole
)
from app.crud import permissions as crud_permissions
from app.routers.auth import get_current_user
from app.models import User


router = APIRouter(prefix="/permissions", tags=["permissions"])


# -----------------------------
# Permissions Management
# -----------------------------
@router.get("/", response_model=List[Permission])
def get_permissions(
    skip: int = 0, 
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على قائمة الأذونات (الأدمن فقط)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح لك بعرض الأذونات")
    
    return crud_permissions.get_permissions(db, skip=skip, limit=limit)


@router.post("/", response_model=Permission)
def create_permission(
    permission: PermissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """إنشاء صلاحية جديدة (الأدمن فقط)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح لك بإنشاء الأذونات")
    
    # التحقق من عدم تكرار الاسم
    if crud_permissions.get_permission_by_name(db, permission.name):
        raise HTTPException(status_code=400, detail="اسم الصلاحية موجود مسبقاً")
    
    return crud_permissions.create_permission(db, permission)


@router.get("/modules/{module}", response_model=List[Permission])
def get_permissions_by_module(
    module: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على أذونات وحدة معينة"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك")
    
    return crud_permissions.get_permissions_by_module(db, module)


# -----------------------------
# User Permissions Management
# -----------------------------
@router.get("/user/{user_id}", response_model=List[UserPermission])
def get_user_permissions(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على أذونات مستخدم معين"""
    # يمكن للمستخدم رؤية أذوناته الخاصة، أو للأدمن/المدير رؤية أذونات الآخرين
    if current_user.id != user_id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بعرض أذونات المستخدمين الآخرين")
    
    return crud_permissions.get_user_permissions(db, user_id)


@router.post("/user/{user_id}/grant")
def grant_permission_to_user(
    user_id: int,
    permission_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """منح أذونات لمستخدم (الأدمن فقط)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح لك بمنح الأذونات")
    
    crud_permissions.update_user_permissions(db, user_id, permission_ids, current_user.id)
    
    # تسجيل النشاط
    crud_permissions.create_activity_log(db, ActivityLogCreate(
        user_id=current_user.id,
        action="grant_permissions",
        entity_type="user",
        entity_id=user_id,
        description=f"منح أذونات للمستخدم {user_id}: {permission_ids}"
    ))
    
    return {"message": "تم منح الأذونات بنجاح"}


@router.post("/check")
def check_permission(
    action: str,
    entity_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """التحقق من صلاحية المستخدم لتنفيذ عملية معينة"""
    result = crud_permissions.can_user_perform_action(db, current_user.id, action, entity_type)
    
    return PermissionCheck(
        has_permission=result["allowed"],
        requires_approval=result["requires_approval"],
        message=result["message"]
    )


# -----------------------------
# Approval Requests Management
# -----------------------------
@router.post("/approval-requests/", response_model=ApprovalRequest)
def create_approval_request(
    request: ApprovalRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """إنشاء طلب موافقة جديد"""
    if current_user.role == "admin":
        raise HTTPException(status_code=400, detail="الأدمن لا يحتاج طلبات موافقة")
    
    return crud_permissions.create_approval_request(db, request, current_user.id)


@router.get("/approval-requests/", response_model=List[ApprovalRequest])
def get_approval_requests(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على طلبات الموافقة"""
    if current_user.role == "admin":
        # الأدمن يرى جميع الطلبات
        return crud_permissions.get_pending_approval_requests(db, skip, limit)
    elif current_user.role == "manager":
        # المدير يرى الطلبات المعلقة فقط
        return crud_permissions.get_pending_approval_requests(db, skip, limit)
    else:
        # الموظف يرى طلباته فقط
        return crud_permissions.get_user_approval_requests(db, current_user.id, skip, limit)


@router.put("/approval-requests/{request_id}")
def update_approval_request(
    request_id: int,
    update_data: ApprovalRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """تحديث حالة طلب الموافقة (المدير والأدمن فقط)"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بمراجعة طلبات الموافقة")
    
    request_obj = crud_permissions.get_approval_request(db, request_id)
    if not request_obj:
        raise HTTPException(status_code=404, detail="طلب الموافقة غير موجود")
    
    if request_obj.status != "pending":
        raise HTTPException(status_code=400, detail="لا يمكن تعديل طلب تمت مراجعته")
    
    updated_request = crud_permissions.update_approval_request(db, request_id, update_data, current_user.id)
    
    # تسجيل النشاط
    crud_permissions.create_activity_log(db, ActivityLogCreate(
        user_id=current_user.id,
        action="review_approval_request",
        entity_type="approval_request",
        entity_id=request_id,
        description=f"مراجعة طلب الموافقة: {update_data.status}"
    ))
    
    return {"message": "تم تحديث طلب الموافقة بنجاح", "request": updated_request}


# -----------------------------
# Activity Logs
# -----------------------------
@router.get("/activity-logs/", response_model=List[ActivityLog])
def get_activity_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على سجلات الأنشطة"""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بعرض سجلات الأنشطة")
    
    if user_id and current_user.role == "manager":
        # المدير يمكنه رؤية أنشطة مستخدم معين
        return crud_permissions.get_user_activity_logs(db, user_id, skip, limit)
    elif current_user.role == "admin":
        # الأدمن يرى جميع الأنشطة
        if user_id:
            return crud_permissions.get_user_activity_logs(db, user_id, skip, limit)
        return crud_permissions.get_activity_logs(db, skip, limit)
    else:
        return crud_permissions.get_user_activity_logs(db, current_user.id, skip, limit)


@router.post("/activity-logs/", response_model=ActivityLog)
def create_activity_log(
    log: ActivityLogCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """إنشاء سجل نشاط (للاستخدام الداخلي)"""
    # إضافة معلومات الطلب
    log.ip_address = request.client.host if request.client else None
    log.user_agent = request.headers.get("user-agent")
    
    return crud_permissions.create_activity_log(db, log)
