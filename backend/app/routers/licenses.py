from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.license import License
from app.schemas.license import LicenseCreate, LicenseUpdate, LicenseResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[LicenseResponse])
def get_licenses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب جميع الرخص"""
    licenses = db.query(License).offset(skip).limit(limit).all()
    return licenses

@router.get("/{license_id}", response_model=LicenseResponse)
def get_license(
    license_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب رخصة بالمعرف"""
    license = db.query(License).filter(License.id == license_id).first()
    if not license:
        raise HTTPException(status_code=404, detail="الرخصة غير موجودة")
    return license

@router.post("/", response_model=LicenseResponse)
def create_license(
    license: LicenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """إنشاء رخصة جديدة"""
    db_license = License(**license.dict())
    db.add(db_license)
    db.commit()
    db.refresh(db_license)
    return db_license

@router.put("/{license_id}", response_model=LicenseResponse)
def update_license(
    license_id: int,
    license_update: LicenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """تحديث رخصة"""
    license = db.query(License).filter(License.id == license_id).first()
    if not license:
        raise HTTPException(status_code=404, detail="الرخصة غير موجودة")
    
    for field, value in license_update.dict(exclude_unset=True).items():
        setattr(license, field, value)
    
    db.commit()
    db.refresh(license)
    return license

@router.delete("/{license_id}")
def delete_license(
    license_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف رخصة"""
    license = db.query(License).filter(License.id == license_id).first()
    if not license:
        raise HTTPException(status_code=404, detail="الرخصة غير موجودة")
    
    db.delete(license)
    db.commit()
    return {"message": "تم حذف الرخصة بنجاح"}

@router.get("/employee/{employee_id}", response_model=List[LicenseResponse])
def get_licenses_by_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب رخص موظف معين"""
    licenses = db.query(License).filter(License.employee_id == employee_id).all()
    return licenses
