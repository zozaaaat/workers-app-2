from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud
from app.database import get_db

router = APIRouter(tags=["workers"])

@router.post("/", response_model=schemas.Worker)
def create_worker(worker: schemas.WorkerCreate, db: Session = Depends(get_db)):
    try:
        return schemas.Worker.from_orm(crud.create_worker(db, worker))
    except Exception as e:
        if str(e) == "DUPLICATE_CIVIL_ID":
            raise HTTPException(status_code=409, detail="رقم المدني مكرر. يوجد عامل بنفس الرقم المدني.")
        raise HTTPException(status_code=500, detail="حدث خطأ غير متوقع. الرجاء المحاولة لاحقًا.")

@router.get("/", response_model=List[schemas.Worker])
def read_workers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    workers = crud.get_workers(db, skip=skip, limit=limit)
    if workers:
        print("API workers[0] dict:", workers[0].__dict__)
    return [schemas.Worker.from_orm(w) for w in workers]

@router.get("/by-license/{license_id}", response_model=List[schemas.Worker])
def read_workers_by_license(license_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    workers = crud.get_workers_by_license(db, license_id, skip, limit)
    return [schemas.Worker.from_orm(w) for w in workers]

@router.get("/{worker_id}", response_model=schemas.Worker)
def read_worker(worker_id: int, db: Session = Depends(get_db)):
    worker = crud.get_worker(db, worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    print("ORM worker:", worker.__dict__)
    print("Pydantic worker:", schemas.Worker.from_orm(worker).dict())
    return schemas.Worker.from_orm(worker)

@router.put("/{worker_id}", response_model=schemas.Worker)
def update_worker(worker_id: int, worker_update: schemas.WorkerUpdate, db: Session = Depends(get_db)):
    worker = crud.update_worker(db, worker_id, worker_update)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return schemas.Worker.from_orm(worker)

@router.delete("/{worker_id}")
def delete_worker(worker_id: int, db: Session = Depends(get_db)):
    success = crud.delete_worker(db, worker_id)
    if not success:
        raise HTTPException(status_code=404, detail="Worker not found")
    return {"detail": "Worker deleted successfully"}

@router.get("/test-out/{worker_id}", response_model=schemas.WorkerOut)
def test_worker_out(worker_id: int, db: Session = Depends(get_db)):
    worker = crud.get_worker(db, worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return schemas.WorkerOut.from_orm(worker)
