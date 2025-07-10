
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app import models
from app.schemas import worker as worker_schemas
from app.crud import workers as crud_workers
from app.database import get_db

router = APIRouter(prefix="/workers", tags=["workers"])

# Endpoints عامة (بدون مصادقة)
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
                "job_title": worker.job_title or "غير محدد",
                "company_id": worker.company_id,
                "license_id": worker.license_id
            })
        return result
    except Exception as e:
        return {"error": str(e)}

@router.get("/public/count")
def get_workers_count_public(db: Session = Depends(get_db)):
    """عدد العمال - عام"""
    try:
        total = db.query(models.Worker).count()
        return {"total_workers": total, "status": "public"}
    except Exception:
        return {"total_workers": 0, "status": "error"}

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

# باقي endpoints (مع المصادقة)
# ... (يمكن الاحتفاظ بباقي الكود كما هو)
