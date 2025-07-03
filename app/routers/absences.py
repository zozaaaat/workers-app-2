from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas.absence import AbsenceCreate, AbsenceInDB
from ..crud.absences import create_absence, get_absences, get_absence, delete_absence
from ..database import get_db
from typing import List

router = APIRouter()

@router.post("/", response_model=AbsenceInDB)
def create_absence_api(absence: AbsenceCreate, db: Session = Depends(get_db)):
    return create_absence(db, absence)

@router.get("/", response_model=List[AbsenceInDB])
def list_absences(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_absences(db, skip, limit)

@router.get("/{absence_id}", response_model=AbsenceInDB)
def get_absence_api(absence_id: int, db: Session = Depends(get_db)):
    db_absence = get_absence(db, absence_id)
    if not db_absence:
        raise HTTPException(status_code=404, detail="Absence not found")
    return db_absence

@router.delete("/{absence_id}")
def delete_absence_api(absence_id: int, db: Session = Depends(get_db)):
    db_absence = delete_absence(db, absence_id)
    if not db_absence:
        raise HTTPException(status_code=404, detail="Absence not found")
    return {"ok": True}
