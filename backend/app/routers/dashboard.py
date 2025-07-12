from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.employee import Employee
from app.models.company import Company
from app.models.license import License
from app.models.document import Document
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب إحصائيات لوحة المعلومات"""
    
    # إحصائيات عامة
    total_companies = db.query(Company).count()
    total_employees = db.query(Employee).count()
    total_licenses = db.query(License).count()
    total_documents = db.query(Document).count()
    
    # إحصائيات الشركات النشطة
    active_companies = db.query(Company).filter(Company.is_active == True).count()
    
    # إحصائيات الموظفين النشطين
    active_employees = db.query(Employee).filter(Employee.is_active == True).count()
    
    # إحصائيات الرخص
    valid_licenses = db.query(License).filter(
        License.expiry_date > datetime.now()
    ).count()
    
    expired_licenses = db.query(License).filter(
        License.expiry_date <= datetime.now()
    ).count()
    
    # الرخص التي ستنتهي خلال 30 يوم
    expiring_soon = db.query(License).filter(
        License.expiry_date > datetime.now(),
        License.expiry_date <= datetime.now() + timedelta(days=30)
    ).count()
    
    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "total_employees": total_employees,
        "active_employees": active_employees,
        "total_licenses": total_licenses,
        "valid_licenses": valid_licenses,
        "expired_licenses": expired_licenses,
        "expiring_soon": expiring_soon,
        "total_documents": total_documents
    }

@router.get("/recent-activity")
def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب النشاطات الأخيرة"""
    
    # أحدث الموظفين المضافين
    recent_employees = db.query(Employee).order_by(
        Employee.created_at.desc()
    ).limit(limit).all()
    
    # أحدث الرخص المضافة
    recent_licenses = db.query(License).order_by(
        License.created_at.desc()
    ).limit(limit).all()
    
    # أحدث الوثائق المرفوعة
    recent_documents = db.query(Document).order_by(
        Document.created_at.desc()
    ).limit(limit).all()
    
    return {
        "recent_employees": recent_employees,
        "recent_licenses": recent_licenses,
        "recent_documents": recent_documents
    }

@router.get("/license-expiry-alerts")
def get_license_expiry_alerts(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب تنبيهات انتهاء الرخص"""
    
    expiring_licenses = db.query(License).filter(
        License.expiry_date > datetime.now(),
        License.expiry_date <= datetime.now() + timedelta(days=days)
    ).all()
    
    return {
        "expiring_licenses": expiring_licenses,
        "count": len(expiring_licenses)
    }
