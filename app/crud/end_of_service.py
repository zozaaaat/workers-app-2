from sqlalchemy.orm import Session
from app import models, schemas
from typing import Optional, List

def get_end_of_service(db: Session, record_id: int) -> Optional[models.EndOfService]:
    return db.query(models.EndOfService).filter(models.EndOfService.id == record_id).first()

def get_end_of_services(db: Session, skip: int = 0, limit: int = 100) -> List[models.EndOfService]:
    return db.query(models.EndOfService).offset(skip).limit(limit).all()

def create_end_of_service(db: Session, eos: schemas.EndOfServiceCreate) -> models.EndOfService:
    db_eos = models.EndOfService(
        worker_id=eos.worker_id,
        calculated_amount=eos.calculated_amount,
        calculation_date=eos.calculation_date,
        notes=eos.notes,
    )
    db.add(db_eos)
    db.commit()
    db.refresh(db_eos)
    return db_eos

def update_end_of_service(db: Session, record_id: int, eos: schemas.EndOfServiceUpdate) -> Optional[models.EndOfService]:
    db_eos = get_end_of_service(db, record_id)
    if not db_eos:
        return None
    update_data = eos.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_eos, key, value)
    db.commit()
    db.refresh(db_eos)
    return db_eos

def delete_end_of_service(db: Session, record_id: int) -> bool:
    db_eos = get_end_of_service(db, record_id)
    if not db_eos:
        return False
    db.delete(db_eos)
    db.commit()
    return True
