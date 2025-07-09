from sqlalchemy.orm import Session
from app.models_company_document import CompanyDocument, DocumentType
from app.schemas.company_document import CompanyDocumentCreate, CompanyDocumentUpdate, ExpiryAlert
from typing import List, Optional
from datetime import date, datetime, timedelta
import json

def get_company_documents(db: Session, company_id: int, skip: int = 0, limit: int = 100) -> List[CompanyDocument]:
    return db.query(CompanyDocument).filter(CompanyDocument.company_id == company_id).offset(skip).limit(limit).all()

def get_company_document(db: Session, document_id: int) -> Optional[CompanyDocument]:
    return db.query(CompanyDocument).filter(CompanyDocument.id == document_id).first()

def create_company_document(db: Session, document: CompanyDocumentCreate) -> CompanyDocument:
    db_document = CompanyDocument(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def update_company_document(db: Session, document_id: int, document: CompanyDocumentUpdate) -> Optional[CompanyDocument]:
    db_document = db.query(CompanyDocument).filter(CompanyDocument.id == document_id).first()
    if db_document:
        for key, value in document.dict(exclude_unset=True).items():
            setattr(db_document, key, value)
        db.commit()
        db.refresh(db_document)
    return db_document

def delete_company_document(db: Session, document_id: int) -> Optional[CompanyDocument]:
    db_document = db.query(CompanyDocument).filter(CompanyDocument.id == document_id).first()
    if db_document:
        db.delete(db_document)
        db.commit()
    return db_document

def get_documents_by_type(db: Session, document_type: str, skip: int = 0, limit: int = 100) -> List[CompanyDocument]:
    return db.query(CompanyDocument).filter(CompanyDocument.document_type == document_type).offset(skip).limit(limit).all()

def get_expiring_documents(db: Session, days_ahead: int = 180) -> List[CompanyDocument]:
    """جلب المستندات التي ستنتهي خلال عدد أيام معين"""
    cutoff_date = date.today() + timedelta(days=days_ahead)
    return db.query(CompanyDocument).filter(
        CompanyDocument.expiry_date <= cutoff_date,
        CompanyDocument.expiry_date >= date.today()
    ).all()

def get_expired_documents(db: Session) -> List[CompanyDocument]:
    """جلب المستندات المنتهية الصلاحية"""
    return db.query(CompanyDocument).filter(CompanyDocument.expiry_date < date.today()).all()

def get_expiry_alerts(db: Session) -> List[ExpiryAlert]:
    """جلب تنبيهات انتهاء الصلاحية"""
    today = date.today()
    alerts = []
    
    # جلب جميع المستندات التي لها تاريخ انتهاء مع معلومات الشركة
    from app.models import Company
    documents = db.query(CompanyDocument).join(Company).filter(CompanyDocument.expiry_date.isnot(None)).all()
    
    for doc in documents:
        if doc.expiry_date:
            days_remaining = (doc.expiry_date - today).days
            
            # تحديد نوع التنبيه
            alert_type = None
            if days_remaining < 0:
                alert_type = "expired"
            elif days_remaining <= 7:
                alert_type = "1_week"
            elif days_remaining <= 30:
                alert_type = "1_month"
            elif days_remaining <= 90:
                alert_type = "3_months"
            elif days_remaining <= 180:
                alert_type = "6_months"
            
            if alert_type:
                # الحصول على معلومات الشركة
                company = db.query(Company).filter(Company.id == doc.company_id).first()
                company_name = company.file_name if company else "غير محدد"
                
                alerts.append(ExpiryAlert(
                    document_id=doc.id,
                    company_id=doc.company_id,
                    company_name=company_name,
                    document_type=doc.document_type,
                    license_number=doc.license_number,
                    expiry_date=doc.expiry_date,
                    days_remaining=days_remaining,
                    alert_type=alert_type
                ))
    
    return alerts

def mark_notification_sent(db: Session, document_id: int, notification_type: str) -> Optional[CompanyDocument]:
    """تحديد الإشعار كمرسل"""
    db_document = db.query(CompanyDocument).filter(CompanyDocument.id == document_id).first()
    if db_document:
        if notification_type == "6_months":
            db_document.notification_6_months = True
        elif notification_type == "3_months":
            db_document.notification_3_months = True
        elif notification_type == "1_month":
            db_document.notification_1_month = True
        elif notification_type == "1_week":
            db_document.notification_1_week = True
        
        db.commit()
        db.refresh(db_document)
    return db_document

# إدارة أنواع المستندات
def get_document_types(db: Session) -> List[DocumentType]:
    return db.query(DocumentType).filter(DocumentType.is_active == True).all()

def create_document_type(db: Session, name: str, name_ar: str, description: str = None) -> DocumentType:
    db_type = DocumentType(name=name, name_ar=name_ar, description=description)
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type

def init_document_types(db: Session):
    """إنشاء أنواع المستندات الأساسية"""
    default_types = [
        {
            "name": "commercial_license",
            "name_ar": "الرخصة التجارية",
            "description": "رخصة مزاولة النشاط التجاري",
            "required_fields": json.dumps(["license_number", "issue_date", "expiry_date", "issuing_authority"]),
            "notification_periods": json.dumps([180, 90, 30, 7])  # 6 شهور، 3 شهور، شهر، أسبوع
        },
        {
            "name": "import_license",
            "name_ar": "رخصة الاستيراد",
            "description": "رخصة استيراد البضائع",
            "required_fields": json.dumps(["license_number", "issue_date", "expiry_date", "issuing_authority"]),
            "notification_periods": json.dumps([180, 90, 30, 7])
        },
        {
            "name": "advertisement_license",
            "name_ar": "رخصة الإعلان",
            "description": "رخصة الإعلان والتسويق",
            "required_fields": json.dumps(["license_number", "issue_date", "expiry_date", "issuing_authority"]),
            "notification_periods": json.dumps([180, 90, 30, 7])
        },
        {
            "name": "health_certificate",
            "name_ar": "شهادة صحية",
            "description": "شهادة صحية للمؤسسة",
            "required_fields": json.dumps(["license_number", "issue_date", "expiry_date", "issuing_authority"]),
            "notification_periods": json.dumps([90, 30, 7])  # 3 شهور، شهر، أسبوع
        },
        {
            "name": "fire_safety_certificate",
            "name_ar": "شهادة السلامة من الحريق",
            "description": "شهادة السلامة من الحريق",
            "required_fields": json.dumps(["license_number", "issue_date", "expiry_date", "issuing_authority"]),
            "notification_periods": json.dumps([90, 30, 7])
        },
        {
            "name": "environmental_permit",
            "name_ar": "تصريح بيئي",
            "description": "تصريح الأثر البيئي",
            "required_fields": json.dumps(["license_number", "issue_date", "expiry_date", "issuing_authority"]),
            "notification_periods": json.dumps([180, 90, 30, 7])
        },
        {
            "name": "labor_permit",
            "name_ar": "تصريح العمالة",
            "description": "تصريح استقدام العمالة",
            "required_fields": json.dumps(["license_number", "issue_date", "expiry_date", "issuing_authority"]),
            "notification_periods": json.dumps([180, 90, 30, 7])
        },
        {
            "name": "tax_certificate",
            "name_ar": "شهادة الضريبة",
            "description": "شهادة الضريبة المدفوعة",
            "required_fields": json.dumps(["license_number", "issue_date", "expiry_date", "issuing_authority"]),
            "notification_periods": json.dumps([90, 30, 7])
        },
        {
            "name": "other",
            "name_ar": "أخرى",
            "description": "مستندات أخرى",
            "required_fields": json.dumps(["license_number", "issue_date", "expiry_date"]),
            "notification_periods": json.dumps([180, 90, 30, 7])
        }
    ]
    
    for doc_type in default_types:
        existing = db.query(DocumentType).filter(DocumentType.name == doc_type["name"]).first()
        if not existing:
            db_type = DocumentType(**doc_type)
            db.add(db_type)
    
    db.commit()
