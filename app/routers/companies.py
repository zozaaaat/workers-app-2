from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models, crud
from app.database import get_db

router = APIRouter(tags=["companies"])  # بدون prefix

@router.post("/", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    db_company = crud.get_company_by_file_number(db, company.file_number)
    if db_company:
        raise HTTPException(status_code=400, detail="Company with this file number already exists")
    return schemas.Company.from_orm(crud.create_company(db, company))

@router.get("/", response_model=List[schemas.Company])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    companies = crud.get_companies(db, skip=skip, limit=limit)
    return [schemas.Company.from_orm(c) for c in companies]

@router.get("/{company_id}", response_model=schemas.Company)
def read_company(company_id: int, db: Session = Depends(get_db)):
    company = crud.get_company(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return schemas.Company.from_orm(company)

@router.put("/{company_id}", response_model=schemas.Company)
def update_company(company_id: int, company_update: schemas.CompanyUpdate, db: Session = Depends(get_db)):
    company = crud.update_company(db, company_id, company_update)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return schemas.Company.from_orm(company)

@router.delete("/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    success = crud.delete_company(db, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"detail": "Company deleted successfully"}
