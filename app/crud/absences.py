from sqlalchemy.orm import Session, joinedload
from ..models_absence import Absence
from ..schemas.absence import AbsenceCreate, AbsenceUpdate
from .deductions import create_deduction
from datetime import date

def create_absence(db: Session, absence: AbsenceCreate):
    db_absence = Absence(**absence.dict())
    db.add(db_absence)
    db.commit()
    db.refresh(db_absence)
    # إذا كان الغياب بدون عذر، أضف خصم تلقائي
    if not db_absence.is_excused:
        deduction_data = {
            "worker_id": db_absence.worker_id,
            "amount": 1,  # قيمة الخصم ليوم واحد (يمكن تعديلها من الإعدادات)
            "reason": "غياب بدون عذر ليوم {}".format(db_absence.date),
            "date": db_absence.date
        }
        deduction = create_deduction(db, deduction_data)
        db_absence.deduction_id = deduction.id
        db.commit()
        db.refresh(db_absence)
    return db_absence

def get_absences(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Absence).options(
        joinedload(Absence.worker),
        joinedload(Absence.deduction)
    ).offset(skip).limit(limit).all()

def get_absence(db: Session, absence_id: int):
    return db.query(Absence).filter(Absence.id == absence_id).first()

def delete_absence(db: Session, absence_id: int):
    db_absence = get_absence(db, absence_id)
    if db_absence:
        db.delete(db_absence)
        db.commit()
    return db_absence
