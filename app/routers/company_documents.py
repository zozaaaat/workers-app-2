from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import company_documents
from app.schemas.company_document import CompanyDocument, CompanyDocumentCreate, CompanyDocumentUpdate, ExpiryAlert
from app.utils.document_extractor import document_extractor
from app.api_notifications import add_notification
from typing import List
import os
import shutil
from datetime import datetime

router = APIRouter(
    prefix="/company_documents",
    tags=["company_documents"]
)

UPLOAD_DIR = "uploaded_files/companies"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=CompanyDocument)
async def upload_company_document(
    company_id: int = Form(...),
    document_type: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """رفع مستند شركة مع استخراج ذكي للمعلومات"""
    try:
        # إنشاء اسم فريد للملف
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"company_{company_id}_{timestamp}_{file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # حفظ الملف
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # استخراج المعلومات من الملف
        extracted_info = document_extractor.extract_all_info(filepath)
        
        # إنشاء مستند جديد
        document_data = CompanyDocumentCreate(
            company_id=company_id,
            filename=filename,
            original_filename=file.filename,
            filepath=filepath,
            filetype=file.content_type or "application/pdf",
            document_type=document_type,
            description=description,
            extracted_text=extracted_info.get('extracted_text', ''),
            issue_date=extracted_info.get('issue_date'),
            expiry_date=extracted_info.get('expiry_date'),
            issuing_authority=extracted_info.get('issuing_authority', ''),
            license_number=extracted_info.get('license_number', ''),
            amount=extracted_info.get('amount'),
            currency=extracted_info.get('currency', 'SAR')
        )
        
        # حفظ في قاعدة البيانات
        db_document = company_documents.create_company_document(db, document_data)
        
        # إرسال إشعار بالرفع
        await add_notification(
            f"تم رفع مستند جديد للشركة {company_id}: {document_type}",
            "info",
            emoji="📄",
            color="#2196F3"
        )
        
        return db_document
        
    except Exception as e:
        # حذف الملف في حالة الخطأ
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"خطأ في رفع المستند: {str(e)}")

@router.get("/types")
async def get_document_types_simple(db: Session = Depends(get_db)):
    """الحصول على جميع أنواع المستندات (مسار مبسط)"""
    return company_documents.get_document_types(db)

@router.get("/expiry-alerts")
async def get_expiry_alerts_simple(db: Session = Depends(get_db)):
    """الحصول على تنبيهات انتهاء الصلاحية (مسار مبسط)"""
    return company_documents.get_expiry_alerts(db)

@router.get("/company/{company_id}", response_model=List[CompanyDocument])
def get_company_documents(company_id: int, db: Session = Depends(get_db)):
    """جلب جميع مستندات الشركة"""
    return company_documents.get_company_documents(db, company_id)

@router.get("/document/{document_id}", response_model=CompanyDocument)
def get_company_document(document_id: int, db: Session = Depends(get_db)):
    """جلب مستند محدد"""
    document = company_documents.get_company_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="المستند غير موجود")
    return document

@router.put("/document/{document_id}", response_model=CompanyDocument)
def update_company_document(
    document_id: int,
    document_update: CompanyDocumentUpdate,
    db: Session = Depends(get_db)
):
    """تحديث مستند الشركة"""
    document = company_documents.update_company_document(db, document_id, document_update)
    if not document:
        raise HTTPException(status_code=404, detail="المستند غير موجود")
    return document

@router.delete("/document/{document_id}")
def delete_company_document(document_id: int, db: Session = Depends(get_db)):
    """حذف مستند الشركة"""
    document = company_documents.get_company_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="المستند غير موجود")
    
    # حذف الملف من النظام
    if os.path.exists(document.filepath):
        os.remove(document.filepath)
    
    # حذف من قاعدة البيانات
    company_documents.delete_company_document(db, document_id)
    
    return {"message": "تم حذف المستند بنجاح"}

@router.get("/expiry-alerts/all", response_model=List[ExpiryAlert])
def get_expiry_alerts(db: Session = Depends(get_db)):
    """جلب جميع تنبيهات انتهاء الصلاحية"""
    return company_documents.get_expiry_alerts(db)

@router.get("/expiring/{days}", response_model=List[CompanyDocument])
def get_expiring_documents(days: int, db: Session = Depends(get_db)):
    """جلب المستندات التي ستنتهي خلال عدد أيام معين"""
    return company_documents.get_expiring_documents(db, days)

@router.get("/expired/all", response_model=List[CompanyDocument])
def get_expired_documents(db: Session = Depends(get_db)):
    """جلب المستندات منتهية الصلاحية"""
    return company_documents.get_expired_documents(db)

@router.post("/process-expiry-notifications")
async def process_expiry_notifications(db: Session = Depends(get_db)):
    """معالجة وإرسال إشعارات انتهاء الصلاحية"""
    alerts = company_documents.get_expiry_alerts(db)
    notifications_sent = 0
    
    for alert in alerts:
        # التحقق من عدم إرسال الإشعار مسبقاً
        document = company_documents.get_company_document(db, alert.document_id)
        if not document:
            continue
        
        should_send = False
        notification_type = ""
        
        if alert.alert_type == "6_months" and not document.notification_6_months:
            should_send = True
            notification_type = "6_months"
        elif alert.alert_type == "3_months" and not document.notification_3_months:
            should_send = True
            notification_type = "3_months"
        elif alert.alert_type == "1_month" and not document.notification_1_month:
            should_send = True
            notification_type = "1_month"
        elif alert.alert_type == "1_week" and not document.notification_1_week:
            should_send = True
            notification_type = "1_week"
        elif alert.alert_type == "expired":
            should_send = True
            notification_type = "expired"
        
        if should_send:
            # تحديد رسالة الإشعار
            if alert.alert_type == "expired":
                message = f"⚠️ تنبيه: انتهت صلاحية {alert.document_type} للشركة {alert.company_name}"
                color = "#f44336"
                emoji = "⚠️"
            else:
                days_text = f"{alert.days_remaining} يوم" if alert.days_remaining > 1 else "يوم واحد"
                message = f"🔔 تنبيه: ستنتهي صلاحية {alert.document_type} للشركة {alert.company_name} خلال {days_text}"
                color = "#ff9800" if alert.days_remaining <= 30 else "#2196F3"
                emoji = "🔔"
            
            # إرسال الإشعار
            await add_notification(
                message,
                "warning" if alert.alert_type == "expired" else "info",
                company_id=alert.company_id,
                emoji=emoji,
                color=color,
                action_required=True if alert.alert_type == "expired" else False
            )
            
            # تحديث حالة الإشعار
            if notification_type != "expired":
                company_documents.mark_notification_sent(db, alert.document_id, notification_type)
            
            notifications_sent += 1
    
    return {
        "message": f"تم إرسال {notifications_sent} إشعار",
        "notifications_sent": notifications_sent
    }

@router.get("/types/all")
def get_document_types(db: Session = Depends(get_db)):
    """جلب جميع أنواع المستندات"""
    return company_documents.get_document_types(db)

@router.post("/init-types")
def initialize_document_types(db: Session = Depends(get_db)):
    """إنشاء أنواع المستندات الأساسية"""
    company_documents.init_document_types(db)
    return {"message": "تم إنشاء أنواع المستندات الأساسية"}
