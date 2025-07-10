from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas
from app.crud import deductions as crud_deductions
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Deduction)
def create_deduction(deduction: schemas.DeductionCreate, db: Session = Depends(get_db)):
    return crud_deductions.create_deduction(db, deduction)

@router.get("/", response_model=List[schemas.Deduction])
def read_deductions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_deductions.get_deductions(db, skip=skip, limit=limit)

@router.get("/{deduction_id}", response_model=schemas.Deduction)
def read_deduction(deduction_id: int, db: Session = Depends(get_db)):
    deduction = crud_deductions.get_deduction(db, deduction_id)
    if not deduction:
        raise HTTPException(status_code=404, detail="Deduction not found")
    return deduction

@router.put("/{deduction_id}", response_model=schemas.Deduction)
def update_deduction(deduction_id: int, deduction_update: schemas.DeductionUpdate, db: Session = Depends(get_db)):
    deduction = crud_deductions.update_deduction(db, deduction_id, deduction_update)
    if not deduction:
        raise HTTPException(status_code=404, detail="Deduction not found")
    return deduction

@router.delete("/{deduction_id}")
def delete_deduction(deduction_id: int, db: Session = Depends(get_db)):
    success = crud_deductions.delete_deduction(db, deduction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Deduction not found")
    return {"detail": "Deduction deleted successfully"}
