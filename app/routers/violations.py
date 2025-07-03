from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Violation)
def create_violation(violation: schemas.ViolationCreate, db: Session = Depends(get_db)):
    return crud.create_violation(db, violation)

@router.get("/", response_model=List[schemas.Violation])
def read_violations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_violations(db, skip=skip, limit=limit)

@router.get("/{violation_id}", response_model=schemas.Violation)
def read_violation(violation_id: int, db: Session = Depends(get_db)):
    violation = crud.get_violation(db, violation_id)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation

@router.put("/{violation_id}", response_model=schemas.Violation)
def update_violation(violation_id: int, violation_update: schemas.ViolationUpdate, db: Session = Depends(get_db)):
    violation = crud.update_violation(db, violation_id, violation_update)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation

@router.delete("/{violation_id}")
def delete_violation(violation_id: int, db: Session = Depends(get_db)):
    success = crud.delete_violation(db, violation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Violation not found")
    return {"detail": "Violation deleted successfully"}
