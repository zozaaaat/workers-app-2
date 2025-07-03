from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud
from app.database import get_db

router = APIRouter(prefix="/workers", tags=["workers"])

@router.post("/", response_model=schemas.Worker)
def create_worker(worker: schemas.WorkerCreate, db: Session = Depends(get_db)):
    return crud.create_worker(db, worker)

@router.get("/", response_model=List[schemas.Worker])
def read_workers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_workers(db, skip=skip, limit=limit)

@router.get("/by-license/{license_id}", response_model=List[schemas.Worker])
def read_workers_by_license(license_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_workers_by_license(db, license_id, skip, limit)

@router.get("/{worker_id}", response_model=schemas.Worker)
def read_worker(worker_id: int, db: Session = Depends(get_db)):
    worker = crud.get_worker(db, worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker

@router.put("/{worker_id}", response_model=schemas.Worker)
def update_worker(worker_id: int, worker_update: schemas.WorkerUpdate, db: Session = Depends(get_db)):
    worker = crud.update_worker(db, worker_id, worker_update)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker

@router.delete("/{worker_id}")
def delete_worker(worker_id: int, db: Session = Depends(get_db)):
    success = crud.delete_worker(db, worker_id)
    if not success:
        raise HTTPException(status_code=404, detail="Worker not found")
    return {"detail": "Worker deleted successfully"}
