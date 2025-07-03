from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud
from app.schemas import license_schema
from app.database import get_db

router = APIRouter(prefix="/licenses", tags=["licenses"])

@router.post("/", response_model=schemas.License)
def create_license(license: schemas.LicenseCreate, db: Session = Depends(get_db)):
    return crud.create_license(db, license)

@router.get("/", response_model=List[schemas.License])
def read_licenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_licenses(db, skip=skip, limit=limit)

@router.get("/{license_id}", response_model=schemas.License)
def read_license(license_id: int, db: Session = Depends(get_db)):
    license = crud.get_license(db, license_id)
    if not license:
        raise HTTPException(status_code=404, detail="License not found")
    return license

@router.put("/{license_id}", response_model=schemas.License)
def update_license(license_id: int, license_update: schemas.LicenseUpdate, db: Session = Depends(get_db)):
    license = crud.update_license(db, license_id, license_update)
    if not license:
        raise HTTPException(status_code=404, detail="License not found")
    return license

@router.delete("/{license_id}")
async def delete_license_endpoint(license_id: int, db: Session = Depends(get_db)):
    success = crud.delete_license(db, license_id)
    if not success:
        raise HTTPException(status_code=404, detail="License not found")
    return {"detail": "License deleted successfully"}

# --------------------------
# Main/Sub license routes
# --------------------------

@router.get("/main/{company_id}", response_model=List[license_schema.License])
def get_main_licenses(company_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_main_licenses(db, company_id, skip, limit)

@router.post("/main", response_model=license_schema.License)
def create_main_license(license_in: license_schema.LicenseCreate, db: Session = Depends(get_db)):
    license_in.parent_id = None  # ensure main
    return crud.create_license(db, license_in)

@router.get("/sub/{main_id}", response_model=List[license_schema.License])
def get_sub_licenses(main_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_sub_licenses(db, main_id, skip, limit)

@router.post("/sub", response_model=license_schema.License)
def create_sub_license(license_in: license_schema.LicenseCreate, db: Session = Depends(get_db)):
    if not license_in.parent_id:
        raise HTTPException(status_code=400, detail="parent_id required for sub license")
    return crud.create_license(db, license_in)

