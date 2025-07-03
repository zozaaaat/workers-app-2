from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Leave)
def create_leave(leave: schemas.LeaveCreate, db: Session = Depends(get_db)):
    return crud.create_leave(db, leave)

@router.get("/", response_model=List[schemas.Leave])
def read_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_leaves(db, skip=skip, limit=limit)

@router.get("/{leave_id}", response_model=schemas.Leave)
def read_leave(leave_id: int, db: Session = Depends(get_db)):
    leave = crud.get_leave(db, leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    return leave

@router.put("/{leave_id}", response_model=schemas.Leave)
def update_leave(leave_id: int, leave_update: schemas.LeaveUpdate, db: Session = Depends(get_db)):
    leave = crud.update_leave(db, leave_id, leave_update)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    return leave

@router.delete("/{leave_id}")
def delete_leave(leave_id: int, db: Session = Depends(get_db)):
    success = crud.delete_leave(db, leave_id)
    if not success:
        raise HTTPException(status_code=404, detail="Leave not found")
    return {"detail": "Leave deleted successfully"}
