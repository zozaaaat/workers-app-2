from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional

def get_license(db: Session, license_id: int) -> Optional[models.License]:
    return db.query(models.License).filter(models.License.id == license_id).first()

def get_licenses_by_company(db: Session, company_id: int, skip: int = 0, limit: int = 100) -> List[models.License]:
    return db.query(models.License).filter(models.License.company_id == company_id).offset(skip).limit(limit).all()

def create_license(db: Session, license: schemas.LicenseCreate) -> models.License:
    db_license = models.License(
        name=license.name,
        civil_id=license.civil_id,
        issuing_authority=license.issuing_authority,
        license_type=license.license_type,
        status=license.status,
        issue_date=license.issue_date,
        expiry_date=license.expiry_date,
        labor_count=license.labor_count,
        license_number=license.license_number,
        address=license.address,
        parent_id=license.parent_id,
        company_id=license.company_id,
    )
    db.add(db_license)
    db.commit()
    db.refresh(db_license)
    return db_license

def update_license(db: Session, license_id: int, license: schemas.LicenseUpdate) -> Optional[models.License]:
    db_license = get_license(db, license_id)
    if not db_license:
        return None
    update_data = license.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_license, key, value)
    db.commit()
    db.refresh(db_license)
    return db_license

def delete_license(db: Session, license_id: int) -> bool:
    db_license = get_license(db, license_id)
    if not db_license:
        return False
    db.delete(db_license)
    db.commit()
    return True

# ---------------------
# New hierarchical helpers
# ---------------------

def get_main_licenses(db: Session, company_id: int, skip: int = 0, limit: int = 100):
    """Return licenses with parent_id is None for a given company."""
    return (
        db.query(models.License)
        .filter(models.License.company_id == company_id, models.License.parent_id == None)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_sub_licenses(db: Session, main_id: int, skip: int = 0, limit: int = 100):
    """Return child licenses of a main license."""
    return (
        db.query(models.License)
        .filter(models.License.parent_id == main_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_licenses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.License).offset(skip).limit(limit).all()

