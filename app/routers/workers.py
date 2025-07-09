from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app import models
from app.schemas import worker as worker_schemas
from app.crud import workers as crud_workers
from app.database import get_db
from app.utils.permissions import (
    create_worker_permission, update_worker_permission, delete_worker_permission,
    log_user_activity, get_current_user
)
from app.crud import permissions as crud_permissions
from app.schemas_permissions import ApprovalRequestCreate, ActionType

router = APIRouter(prefix="/workers", tags=["workers"])

@router.get("/public/count")
def get_workers_count(db: Session = Depends(get_db)):
    """الحصول على عدد العمال (عام)"""
    try:
        total_workers = db.query(models.Worker).count()
        # بدلاً من is_active، نستخدم المعايير الأخرى
        active_workers = db.query(models.Worker).filter(models.Worker.work_permit_end > datetime.now()).count()
        
        return {
            "total_workers": total_workers,
            "active_workers": active_workers,
            "status": "public"
        }
    except Exception as e:
        return {"error": str(e), "total_workers": 0, "active_workers": 0}

@router.get("/public", response_model=List[worker_schemas.Worker])
def get_workers_public(db: Session = Depends(get_db)):
    """الحصول على جميع العمال (عام)"""
    try:
        workers = crud_workers.get_workers(db)
        return [worker_schemas.Worker.from_orm(worker) for worker in workers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في جلب العمال: {str(e)}")

@router.post("/", response_model=worker_schemas.Worker)
# @log_user_activity("create_worker", "worker")  # Temporarily disabled
def create_worker(
    worker: worker_schemas.WorkerCreate, 
    current_user: models.User = Depends(get_current_user),
    # permission_check = Depends(create_worker_permission),  # Temporarily disabled
    db: Session = Depends(get_db)
):
    """إنشاء عامل جديد"""
    
    # Simple role check instead of complex permission system
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بإنشاء عمال جدد")
    
    try:
        worker_obj = crud_workers.create_worker(db, worker)
        return worker_schemas.Worker.from_orm(worker_obj)
    except Exception as e:
        if str(e) == "DUPLICATE_CIVIL_ID":
            raise HTTPException(status_code=409, detail="رقم المدني مكرر. يوجد عامل بنفس الرقم المدني.")
        raise HTTPException(status_code=500, detail="حدث خطأ غير متوقع. الرجاء المحاولة لاحقًا.")

@router.get("/", response_model=List[worker_schemas.Worker])
def read_workers(
    skip: int = 0, 
    limit: int = 100, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على قائمة العمال"""
    
    # Simple role check instead of complex permission system
    if current_user.role not in ["admin", "manager", "employee"]:
        raise HTTPException(status_code=403, detail="ليس لديك صلاحية لعرض العمال")
    
    workers = crud_workers.get_workers(db, skip=skip, limit=limit)
    return [worker_schemas.Worker.from_orm(w) for w in workers]

@router.get("/by-license/{license_id}", response_model=List[worker_schemas.Worker])
def read_workers_by_license(
    license_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على العمال حسب الترخيص"""
    
    # التحقق من صلاحية عرض العمال
    has_permission = crud_permissions.check_user_permission(db, current_user.id, "view_worker")
    if not has_permission and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="ليس لديك صلاحية لعرض العمال")
    
    workers = crud_workers.get_workers_by_license(db, license_id, skip, limit)
    return [worker_schemas.Worker.from_orm(w) for w in workers]

@router.get("/{worker_id}", response_model=worker_schemas.Worker)
def read_worker(
    worker_id: int, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على بيانات عامل معين"""
    
    # التحقق من صلاحية عرض العمال
    has_permission = crud_permissions.check_user_permission(db, current_user.id, "view_worker")
    if not has_permission and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="ليس لديك صلاحية لعرض بيانات العمال")
    
    worker = crud_workers.get_worker(db, worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="العامل غير موجود")
    
    return worker_schemas.Worker.from_orm(worker)

@router.put("/{worker_id}", response_model=worker_schemas.Worker)
@log_user_activity("update_worker", "worker")
def update_worker(
    worker_id: int, 
    worker_update: worker_schemas.WorkerUpdate, 
    current_user: models.User = Depends(get_current_user),
    permission_check = Depends(update_worker_permission),
    db: Session = Depends(get_db)
):
    """تحديث بيانات عامل"""
    
    # إذا كانت العملية تحتاج موافقة
    if permission_check.get("status") == "pending_approval":
        return {
            "message": "تم إرسال طلب تعديل بيانات العامل للمدير للموافقة",
            "approval_request_id": permission_check.get("request_id"),
            "status": "pending_approval"
        }
    
    worker = crud_workers.update_worker(db, worker_id, worker_update)
    if not worker:
        raise HTTPException(status_code=404, detail="العامل غير موجود")
    
    return worker_schemas.Worker.from_orm(worker)

@router.delete("/{worker_id}")
@log_user_activity("delete_worker", "worker")
def delete_worker(
    worker_id: int, 
    current_user: models.User = Depends(get_current_user),
    permission_check = Depends(delete_worker_permission),
    db: Session = Depends(get_db)
):
    """حذف عامل"""
    
    # إذا كانت العملية تحتاج موافقة
    if permission_check.get("status") == "pending_approval":
        return {
            "message": "تم إرسال طلب حذف العامل للمدير للموافقة",
            "approval_request_id": permission_check.get("request_id"),
            "status": "pending_approval"
        }
    
    success = crud_workers.delete_worker(db, worker_id)
    if not success:
        raise HTTPException(status_code=404, detail="العامل غير موجود")
    
    return {"detail": "تم حذف العامل بنجاح"}

@router.post("/{worker_id}/transfer")
@log_user_activity("transfer_worker", "worker")
def transfer_worker(
    worker_id: int,
    new_license_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """نقل عامل إلى ترخيص آخر"""
    
    # التحقق من صلاحية نقل العامل
    has_permission = crud_permissions.check_user_permission(db, current_user.id, "transfer_worker")
    if not has_permission and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="ليس لديك صلاحية لنقل العمال")
    
    # التحقق من ضرورة الموافقة
    permission_check = crud_permissions.can_user_perform_action(db, current_user.id, "transfer", "worker")
    
    if permission_check["requires_approval"]:
        # إنشاء طلب موافقة
        approval_request = ApprovalRequestCreate(
            action_type=ActionType.UPDATE,
            entity_type="worker",
            entity_id=worker_id,
            new_data={"new_license_id": new_license_id},
            description=f"نقل العامل {worker_id} إلى الترخيص {new_license_id}"
        )
        
        created_request = crud_permissions.create_approval_request(db, approval_request, current_user.id)
        
        return {
            "message": "تم إرسال طلب نقل العامل للمدير للموافقة",
            "approval_request_id": created_request.id,
            "status": "pending_approval"
        }
    
    # تنفيذ النقل مباشرة
    worker = crud_workers.get_worker(db, worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="العامل غير موجود")
    
    worker.license_id = new_license_id
    db.commit()
    db.refresh(worker)
    
    return {"detail": "تم نقل العامل بنجاح", "worker": worker_schemas.Worker.from_orm(worker)}

@router.get("/test-out/{worker_id}", response_model=worker_schemas.WorkerOut)
def test_worker_out(worker_id: int, db: Session = Depends(get_db)):
    """اختبار خرج العامل - للاختبار فقط"""
    worker = crud_workers.get_worker(db, worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker_schemas.WorkerOut.from_orm(worker)

@router.get("/simple", response_model=List[dict])
def get_workers_simple(db: Session = Depends(get_db)):
    """اختبار نقطة نهاية بسيطة للعمال بدون مصادقة"""
    try:
        workers = crud_workers.get_workers(db, skip=0, limit=5)
        return [{"id": w.id, "name": w.name, "civil_id": w.civil_id} for w in workers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
