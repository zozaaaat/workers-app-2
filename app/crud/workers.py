from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import models, schemas
from typing import List, Optional

def get_worker(db: Session, worker_id: int) -> Optional[models.Worker]:
    return db.query(models.Worker).filter(models.Worker.id == worker_id).first()

def get_workers(db: Session, skip: int = 0, limit: int = 100) -> List[models.Worker]:
    return db.query(models.Worker).offset(skip).limit(limit).all()

def get_workers_by_company(db: Session, company_id: int, skip: int = 0, limit: int = 100) -> List[models.Worker]:
    return db.query(models.Worker).filter(models.Worker.company_id == company_id).offset(skip).limit(limit).all()

def get_workers_by_license(db: Session, license_id: int, skip: int = 0, limit: int = 100) -> List[models.Worker]:
    return db.query(models.Worker).filter(models.Worker.license_id == license_id).offset(skip).limit(limit).all()

def create_worker(db: Session, worker: schemas.WorkerCreate) -> models.Worker:
    # توليد custom_id تلقائيًا بناءً على الشركة
    last_worker = db.query(models.Worker).filter(models.Worker.company_id == worker.company_id).order_by(models.Worker.id.desc()).first()
    if last_worker and last_worker.custom_id and '-' in last_worker.custom_id:
        try:
            last_seq = int(last_worker.custom_id.split('-')[-1])
        except Exception:
            last_seq = 0
    else:
        last_seq = 0
    new_seq = last_seq + 1
    custom_id = f"C{worker.company_id}-{new_seq}"

    db_worker = models.Worker(
        civil_id=worker.civil_id,
        name=worker.name,
        nationality=worker.nationality,
        worker_type=worker.worker_type,
        job_title=worker.job_title,
        hire_date=worker.hire_date,
        work_permit_start=worker.work_permit_start,
        work_permit_end=worker.work_permit_end,
        salary=worker.salary,
        license_id=worker.license_id,
        company_id=worker.company_id,
        custom_id=custom_id
    )
    db.add(db_worker)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise Exception("DUPLICATE_CIVIL_ID")
    db.refresh(db_worker)
    return db_worker

def update_worker(db: Session, worker_id: int, worker: schemas.WorkerUpdate) -> Optional[models.Worker]:
    db_worker = get_worker(db, worker_id)
    if not db_worker:
        return None
    update_data = worker.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_worker, key, value)
    db.commit()
    db.refresh(db_worker)
    return db_worker

def delete_worker(db: Session, worker_id: int) -> bool:
    db_worker = get_worker(db, worker_id)
    if not db_worker:
        return False
    db.delete(db_worker)
    db.commit()
    return True

def smart_update_worker_from_text(db: Session, worker_id: int, text: str):
    db_worker = get_worker(db, worker_id)
    if not db_worker:
        return None
    # مثال: استخراج الرقم المدني والاسم من النص وتحديثهم
    import re
    civil_id_match = re.search(r'(?:رقم مدني|الرقم المدني|Civil ID)\s*[:\-]?\s*(\d{8,})', text)
    name_match = re.search(r'(?:اسم العامل|الاسم|Name)\s*[:\-]?\s*([\u0600-\u06FFa-zA-Z\s]+)', text)
    if civil_id_match:
        db_worker.civil_id = civil_id_match.group(1)
    if name_match:
        db_worker.name = name_match.group(1).strip()
    # يمكن إضافة استخراج وتحديث حقول أخرى بنفس الطريقة
    db.commit()
    db.refresh(db_worker)
    return db_worker
