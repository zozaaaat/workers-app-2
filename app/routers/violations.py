from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
from app import schemas
from app.crud import violations as crud_violations
from app.database import get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=schemas.Violation)
def create_violation(violation: schemas.ViolationCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Creating violation: {violation}")
        return crud_violations.create_violation(db, violation)
    except Exception as e:
        logger.error(f"Error creating violation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.Violation])
def read_violations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        logger.info(f"Getting violations with skip={skip}, limit={limit}")
        db_violations = crud_violations.get_violations(db, skip=skip, limit=limit)
        logger.info(f"Found {len(db_violations)} violations from database")
        
        # Convert to schemas manually to ensure proper format
        result = []
        for violation in db_violations:
            violation_dict = {
                "id": violation.id,
                "worker_id": violation.worker_id,
                "description": violation.description,
                "penalty_amount": violation.penalty_amount,
                "date": violation.date
            }
            violation_schema = schemas.Violation(**violation_dict)
            result.append(violation_schema)
        
        logger.info(f"Successfully converted {len(result)} violations to schemas")
        return result
    except Exception as e:
        logger.error(f"Error getting violations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{violation_id}", response_model=schemas.Violation)
def read_violation(violation_id: int, db: Session = Depends(get_db)):
    violation = crud_violations.get_violation(db, violation_id)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation

@router.put("/{violation_id}", response_model=schemas.Violation)
def update_violation(violation_id: int, violation_update: schemas.ViolationUpdate, db: Session = Depends(get_db)):
    violation = crud_violations.update_violation(db, violation_id, violation_update)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation

@router.delete("/{violation_id}")
def delete_violation(violation_id: int, db: Session = Depends(get_db)):
    success = crud_violations.delete_violation(db, violation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Violation not found")
    return {"detail": "Violation deleted successfully"}
