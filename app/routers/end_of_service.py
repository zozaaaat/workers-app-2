from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas
from app.crud import end_of_service as crud
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.EndOfService)
def create_eos(eos: schemas.EndOfServiceCreate, db: Session = Depends(get_db)):
    return crud.create_end_of_service(db, eos)

@router.get("/", response_model=List[schemas.EndOfService])
def read_eos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_end_of_services(db, skip=skip, limit=limit)

@router.get("/{eos_id}", response_model=schemas.EndOfService)
def read_eos_by_id(eos_id: int, db: Session = Depends(get_db)):
    eos = crud.get_end_of_service(db, eos_id)
    if not eos:
        raise HTTPException(status_code=404, detail="End of service record not found")
    return eos

@router.put("/{eos_id}", response_model=schemas.EndOfService)
def update_eos(eos_id: int, eos_update: schemas.EndOfServiceUpdate, db: Session = Depends(get_db)):
    eos = crud.update_end_of_service(db, eos_id, eos_update)
    if not eos:
        raise HTTPException(status_code=404, detail="End of service record not found")
    return eos

@router.delete("/{eos_id}")
def delete_eos(eos_id: int, db: Session = Depends(get_db)):
    success = crud.delete_end_of_service(db, eos_id)
    if not success:
        raise HTTPException(status_code=404, detail="End of service record not found")
    return {"detail": "End of service record deleted successfully"}
