from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
from app import schemas
from app.crud import deductions as crud_deductions
from app.database import get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=schemas.Deduction)
def create_deduction(deduction: schemas.DeductionCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Creating deduction: {deduction}")
        return crud_deductions.create_deduction(db, deduction)
    except Exception as e:
        logger.error(f"Error creating deduction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.Deduction])
def read_deductions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        logger.info(f"Getting deductions with skip={skip}, limit={limit}")
        db_deductions = crud_deductions.get_deductions(db, skip=skip, limit=limit)
        logger.info(f"Found {len(db_deductions)} deductions from database")
        
        # Convert to schemas manually to ensure proper format
        result = []
        for deduction in db_deductions:
            deduction_dict = {
                "id": deduction.id,
                "worker_id": deduction.worker_id,
                "amount": deduction.amount,
                "reason": deduction.reason,
                "date": deduction.date
            }
            deduction_schema = schemas.Deduction(**deduction_dict)
            result.append(deduction_schema)
        
        logger.info(f"Successfully converted {len(result)} deductions to schemas")
        return result
    except Exception as e:
        logger.error(f"Error getting deductions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
