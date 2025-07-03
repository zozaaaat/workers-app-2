from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional
from datetime import date

def get_company(db: Session, company_id: int) -> Optional[models.Company]:
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def get_company_by_file_number(db: Session, file_number: str) -> Optional[models.Company]:
    return db.query(models.Company).filter(models.Company.file_number == file_number).first()

def get_companies(db: Session, skip: int = 0, limit: int = 100) -> List[models.Company]:
    return db.query(models.Company).offset(skip).limit(limit).all()

def create_company(db: Session, company: schemas.CompanyCreate) -> models.Company:
    db_company = models.Company(
        file_number=company.file_number,
        file_status=company.file_status,
        creation_date=company.creation_date,
        commercial_registration_number=company.commercial_registration_number,
        file_name=company.file_name,
        file_classification=company.file_classification,
        administration=company.administration,
        file_type=company.file_type,
        legal_entity=company.legal_entity,
        ownership_category=company.ownership_category,
        total_workers=company.total_workers or 0,
        total_licenses=company.total_licenses or 0,
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def update_company(db: Session, company_id: int, company: schemas.CompanyUpdate) -> Optional[models.Company]:
    db_company = get_company(db, company_id)
    if not db_company:
        return None
    update_data = company.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_company, key, value)
    db.commit()
    db.refresh(db_company)
    return db_company

def delete_company(db: Session, company_id: int) -> bool:
    db_company = get_company(db, company_id)
    if not db_company:
        return False
    db.delete(db_company)
    db.commit()
    return True
