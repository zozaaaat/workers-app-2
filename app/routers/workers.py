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

# Endpoints عامة (بدون مصادقة) - يجب أن تكون أولاً
@router.get("/public/count")
def get_workers_count_public(db: Session = Depends(get_db)):
    """عدد العمال - عام"""
    try:
        total = db.query(models.Worker).count()
        active_workers = db.query(models.Worker).filter(models.Worker.work_permit_end > datetime.now()).count()
        return {
            "total_workers": total,
            "active_workers": active_workers,
            "status": "public"
        }
    except Exception:
        return {"total_workers": 0, "active_workers": 0, "status": "error"}

@router.get("/public")
def get_all_workers_public(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """جميع العمال - عام"""
    try:
        workers = crud_workers.get_workers(db, skip=skip, limit=limit)
        result = []
        for worker in workers:
            result.append({
                "id": worker.id,
                "civil_id": worker.civil_id,
                "name": worker.name,
                "nationality": worker.nationality or "غير محدد",
                "worker_type": worker.worker_type or "غير محدد",
                "job_title": worker.job_title or "غير محدد",
                "hire_date": str(worker.hire_date) if worker.hire_date else None,
                "work_permit_start": str(worker.work_permit_start) if worker.work_permit_start else None,
                "work_permit_end": str(worker.work_permit_end) if worker.work_permit_end else None,
                "salary": worker.salary,
                "custom_id": worker.custom_id,
                "company_id": worker.company_id,
                "license_id": worker.license_id
            })
        return result
    except Exception as e:
        return {"error": str(e)}

@router.get("/api/worker/{worker_id}")
def get_worker_by_id_public(worker_id: int, db: Session = Depends(get_db)):
    """عامل واحد - عام"""
    try:
        worker = crud_workers.get_worker(db, worker_id)
        if not worker:
            return {"error": "Worker not found"}
        
        return {
            "id": worker.id,
            "civil_id": worker.civil_id,
            "name": worker.name,
            "nationality": worker.nationality or "غير محدد",
            "job_title": worker.job_title or "غير محدد",
            "hire_date": str(worker.hire_date) if worker.hire_date else None,
            "company_id": worker.company_id,
            "license_id": worker.license_id,
            "phone": worker.phone,
            "custom_id": worker.custom_id
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/quick-fix/{worker_id}")
def get_worker_quick_fix(worker_id: int, db: Session = Depends(get_db)):
    """إصلاح سريع - بيانات عامل واحد"""
    try:
        worker = crud_workers.get_worker(db, worker_id)
        if not worker:
            return {"error": "Worker not found", "success": False}
        
        return {
            "success": True,
            "id": worker.id,
            "civil_id": worker.civil_id,
            "name": worker.name,
            "nationality": worker.nationality or "غير محدد",
            "job_title": worker.job_title or "غير محدد",
            "hire_date": str(worker.hire_date) if worker.hire_date else None,
            "company_id": worker.company_id,
            "license_id": worker.license_id,
            "phone": worker.phone,
            "custom_id": worker.custom_id
        }
    except Exception as e:
        return {"error": str(e), "success": False}

@router.get("/public/worker/{worker_id}")
def get_public_worker_simple(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على بيانات عامل (عام وبسيط)"""
    try:
        worker = crud_workers.get_worker(db, worker_id)
        if not worker:
            return {"error": "Worker not found"}
        
        return {
            "id": worker.id,
            "civil_id": worker.civil_id,
            "name": worker.name,
            "nationality": worker.nationality or "غير محدد",
            "job_title": worker.job_title or "غير محدد",
            "hire_date": str(worker.hire_date) if worker.hire_date else None,
            "company_id": worker.company_id,
            "license_id": worker.license_id
        }
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}

@router.get("/test/{worker_id}")
def test_worker(worker_id: int):
    """اختبار بسيط للـ endpoint"""
    return {"message": f"Worker ID: {worker_id}", "status": "test_success"}

# Endpoints مع المصادقة
@router.get("/", response_model=List[worker_schemas.Worker])
def read_workers(skip: int = 0, limit: int = 10, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """الحصول على قائمة العمال (مع المصادقة)"""
    workers = crud_workers.get_workers(db, skip=skip, limit=limit)
    log_user_activity(db, current_user.id, "view_workers", "عرض قائمة العمال")
    return workers

@router.get("/{worker_id}", response_model=worker_schemas.Worker)
def read_worker(worker_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """الحصول على بيانات عامل واحد (مع المصادقة)"""
    worker = crud_workers.get_worker(db, worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="العامل غير موجود")
    
    log_user_activity(db, current_user.id, "view_worker", f"عرض بيانات العامل {worker.name}")
    return worker
