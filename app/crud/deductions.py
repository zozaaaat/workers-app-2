from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional

def get_deduction(db: Session, deduction_id: int) -> Optional[models.Deduction]:
    return db.query(models.Deduction).filter(models.Deduction.id == deduction_id).first()

def get_deductions_by_worker(db: Session, worker_id: int, skip: int = 0, limit: int = 100) -> List[models.Deduction]:
    return db.query(models.Deduction).filter(models.Deduction.worker_id == worker_id).offset(skip).limit(limit).all()

def create_deduction(db: Session, deduction: schemas.DeductionCreate) -> models.Deduction:
    db_deduction = models.Deduction(
        worker_id=deduction.worker_id,
        amount=deduction.amount,
        reason=deduction.reason,
        date=deduction.date,
    )
    db.add(db_deduction)
    db.commit()
    db.refresh(db_deduction)
    return db_deduction

def update_deduction(db: Session, deduction_id: int, deduction: schemas.DeductionUpdate) -> Optional[models.Deduction]:
    db_deduction = get_deduction(db, deduction_id)
    if not db_deduction:
        return None
    update_data = deduction.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_deduction, key, value)
    db.commit()
    db.refresh(db_deduction)
    return db_deduction

def delete_deduction(db: Session, deduction_id: int) -> bool:
    db_deduction = get_deduction(db, deduction_id)
    if not db_deduction:
        return False
    db.delete(db_deduction)
    db.commit()
    return True
