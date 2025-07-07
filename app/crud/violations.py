from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional

def get_violation(db: Session, violation_id: int) -> Optional[models.Violation]:
    return db.query(models.Violation).filter(models.Violation.id == violation_id).first()

def get_violations_by_worker(db: Session, worker_id: int, skip: int = 0, limit: int = 100) -> List[models.Violation]:
    return db.query(models.Violation).filter(models.Violation.worker_id == worker_id).offset(skip).limit(limit).all()

def get_violations(db: Session, skip: int = 0, limit: int = 100) -> List[models.Violation]:
    return db.query(models.Violation).offset(skip).limit(limit).all()

def create_violation(db: Session, violation: schemas.ViolationCreate) -> models.Violation:
    db_violation = models.Violation(
        worker_id=violation.worker_id,
        description=violation.description,
        penalty_amount=violation.penalty_amount,
        date=violation.date,
    )
    db.add(db_violation)
    db.commit()
    db.refresh(db_violation)
    return db_violation

def update_violation(db: Session, violation_id: int, violation: schemas.ViolationUpdate) -> Optional[models.Violation]:
    db_violation = get_violation(db, violation_id)
    if not db_violation:
        return None
    update_data = violation.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_violation, key, value)
    db.commit()
    db.refresh(db_violation)
    return db_violation

def delete_violation(db: Session, violation_id: int) -> bool:
    db_violation = get_violation(db, violation_id)
    if not db_violation:
        return False
    db.delete(db_violation)
    db.commit()
    return True
