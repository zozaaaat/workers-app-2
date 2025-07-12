from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[CompanyResponse])
def get_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """جلب جميع الشركات"""
    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies

@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """جلب شركة بالمعرف"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="الشركة غير موجودة")
    return company

@router.post("/", response_model=CompanyResponse)
def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db)
):
    """إنشاء شركة جديدة"""
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    db: Session = Depends(get_db)
):
    """تحديث شركة"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="الشركة غير موجودة")
    
    for field, value in company_update.dict(exclude_unset=True).items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    return company

@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف شركة"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="الشركة غير موجودة")
    
    db.delete(company)
    db.commit()
    return {"message": "تم حذف الشركة بنجاح"}
