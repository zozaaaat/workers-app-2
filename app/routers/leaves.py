from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
from app import schemas
from app.crud import leaves as crud_leaves
from app.database import get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=schemas.Leave)
def create_leave(leave: schemas.LeaveCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Creating leave: {leave}")
        return crud_leaves.create_leave(db, leave)
    except Exception as e:
        logger.error(f"Error creating leave: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.Leave])
def read_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        logger.info(f"Getting leaves with skip={skip}, limit={limit}")
        db_leaves = crud_leaves.get_leaves(db, skip=skip, limit=limit)
        logger.info(f"Found {len(db_leaves)} leaves from database")
        
        # Convert to schemas manually to ensure proper format
        result = []
        for leave in db_leaves:
            leave_dict = {
                "id": leave.id,
                "worker_id": leave.worker_id,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "notes": leave.notes
            }
            leave_schema = schemas.Leave(**leave_dict)
            result.append(leave_schema)
        
        logger.info(f"Successfully converted {len(result)} leaves to schemas")
        return result
    except Exception as e:
        logger.error(f"Error getting leaves: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{leave_id}", response_model=schemas.Leave)
def read_leave(leave_id: int, db: Session = Depends(get_db)):
    leave = crud_leaves.get_leave(db, leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    return leave

@router.put("/{leave_id}", response_model=schemas.Leave)
def update_leave(leave_id: int, leave_update: schemas.LeaveUpdate, db: Session = Depends(get_db)):
    leave = crud_leaves.update_leave(db, leave_id, leave_update)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    return leave

@router.delete("/{leave_id}")
def delete_leave(leave_id: int, db: Session = Depends(get_db)):
    success = crud_leaves.delete_leave(db, leave_id)
    if not success:
        raise HTTPException(status_code=404, detail="Leave not found")
    return {"detail": "Leave deleted successfully"}
