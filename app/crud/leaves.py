from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional

def get_leave(db: Session, leave_id: int) -> Optional[models.Leave]:
    return db.query(models.Leave).filter(models.Leave.id == leave_id).first()

def get_leaves_by_worker(db: Session, worker_id: int, skip: int = 0, limit: int = 100) -> List[models.Leave]:
    return db.query(models.Leave).filter(models.Leave.worker_id == worker_id).offset(skip).limit(limit).all()

def create_leave(db: Session, leave: schemas.LeaveCreate) -> models.Leave:
    db_leave = models.Leave(
        worker_id=leave.worker_id,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        notes=leave.notes,
    )
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

def update_leave(db: Session, leave_id: int, leave: schemas.LeaveUpdate) -> Optional[models.Leave]:
    db_leave = get_leave(db, leave_id)
    if not db_leave:
        return None
    update_data = leave.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_leave, key, value)
    db.commit()
    db.refresh(db_leave)
    return db_leave

def delete_leave(db: Session, leave_id: int) -> bool:
    db_leave = get_leave(db, leave_id)
    if not db_leave:
        return False
    db.delete(db_leave)
    db.commit()
    return True
