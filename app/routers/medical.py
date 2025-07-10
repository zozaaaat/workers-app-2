"""
API Router لإدارة الملفات الطبية
Medical Files Management Router
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.schemas.medical import (
    MedicalFile, MedicalFileCreate, MedicalFileUpdate,
    MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate,
    MedicalDocument, MedicalDocumentCreate, MedicalDocumentUpdate,
    HealthAndSafetyIncident, HealthAndSafetyIncidentCreate, HealthAndSafetyIncidentUpdate,
    MedicalCheckupSchedule, MedicalCheckupScheduleCreate, MedicalCheckupScheduleUpdate,
    MedicalFileSummary, HealthStatistics
)
from app.crud import medical as crud_medical

router = APIRouter(prefix="/api/medical", tags=["medical"])

# Medical Files Endpoints
@router.post("/files/", response_model=MedicalFile)
def create_medical_file(
    medical_file: MedicalFileCreate,
    db: Session = Depends(get_db)
):
    """إنشاء ملف طبي جديد"""
    # التحقق من عدم وجود ملف طبي للعامل
    existing_file = crud_medical.get_medical_file_by_worker(db, medical_file.worker_id)
    if existing_file:
        raise HTTPException(
            status_code=400,
            detail="يوجد ملف طبي للعامل بالفعل"
        )
    
    # التحقق من عدم تكرار رقم الملف
    existing_number = crud_medical.get_medical_file_by_number(db, medical_file.file_number)
    if existing_number:
        raise HTTPException(
            status_code=400,
            detail="رقم الملف الطبي مستخدم بالفعل"
        )
    
    return crud_medical.create_medical_file(db, medical_file)

@router.get("/files/", response_model=List[MedicalFile])
def get_medical_files(
    skip: int = 0,
    limit: int = 100,
    fitness_filter: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """الحصول على جميع الملفات الطبية مع إمكانية البحث والتصفية"""
    if search or fitness_filter is not None:
        return crud_medical.search_medical_files(db, search or "", fitness_filter)
    return crud_medical.get_medical_files(db, skip=skip, limit=limit)

@router.get("/files/{medical_file_id}", response_model=MedicalFile)
def get_medical_file(medical_file_id: int, db: Session = Depends(get_db)):
    """الحصول على ملف طبي بالمعرف"""
    medical_file = crud_medical.get_medical_file(db, medical_file_id)
    if not medical_file:
        raise HTTPException(status_code=404, detail="الملف الطبي غير موجود")
    return medical_file

@router.get("/files/worker/{worker_id}", response_model=MedicalFile)
def get_medical_file_by_worker(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على الملف الطبي للعامل"""
    medical_file = crud_medical.get_medical_file_by_worker(db, worker_id)
    if not medical_file:
        raise HTTPException(status_code=404, detail="لا يوجد ملف طبي للعامل")
    return medical_file

@router.put("/files/{medical_file_id}", response_model=MedicalFile)
def update_medical_file(
    medical_file_id: int,
    medical_file: MedicalFileUpdate,
    db: Session = Depends(get_db)
):
    """تحديث ملف طبي"""
    updated_file = crud_medical.update_medical_file(db, medical_file_id, medical_file)
    if not updated_file:
        raise HTTPException(status_code=404, detail="الملف الطبي غير موجود")
    return updated_file

@router.delete("/files/{medical_file_id}")
def delete_medical_file(medical_file_id: int, db: Session = Depends(get_db)):
    """حذف ملف طبي"""
    success = crud_medical.delete_medical_file(db, medical_file_id)
    if not success:
        raise HTTPException(status_code=404, detail="الملف الطبي غير موجود")
    return {"message": "تم حذف الملف الطبي بنجاح"}

@router.get("/files/summary/{worker_id}", response_model=MedicalFileSummary)
def get_medical_file_summary(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على ملخص الملف الطبي للعامل"""
    summary = crud_medical.get_medical_file_summary(db, worker_id)
    if not summary:
        raise HTTPException(status_code=404, detail="لا يوجد ملف طبي للعامل")
    return summary

@router.get("/workers/without-files/", response_model=List[int])
def get_workers_without_medical_files(db: Session = Depends(get_db)):
    """الحصول على العمال الذين لا يملكون ملفات طبية"""
    return crud_medical.get_workers_without_medical_files(db)

# Medical Records Endpoints
@router.post("/records/", response_model=MedicalRecord)
def create_medical_record(
    medical_record: MedicalRecordCreate,
    db: Session = Depends(get_db)
):
    """إنشاء سجل طبي جديد"""
    # التحقق من وجود الملف الطبي
    medical_file = crud_medical.get_medical_file(db, medical_record.medical_file_id)
    if not medical_file:
        raise HTTPException(status_code=404, detail="الملف الطبي غير موجود")
    
    return crud_medical.create_medical_record(db, medical_record)

@router.get("/records/file/{medical_file_id}", response_model=List[MedicalRecord])
def get_medical_records_by_file(medical_file_id: int, db: Session = Depends(get_db)):
    """الحصول على السجلات الطبية للملف"""
    return crud_medical.get_medical_records_by_file(db, medical_file_id)

@router.get("/records/worker/{worker_id}", response_model=List[MedicalRecord])
def get_medical_records_by_worker(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على السجلات الطبية للعامل"""
    return crud_medical.get_medical_records_by_worker(db, worker_id)

@router.get("/records/follow-up/", response_model=List[MedicalRecord])
def get_records_with_follow_up(db: Session = Depends(get_db)):
    """الحصول على السجلات التي تحتاج متابعة"""
    return crud_medical.get_records_with_follow_up(db)

@router.get("/records/restrictions/", response_model=List[MedicalRecord])
def get_workers_with_restrictions(db: Session = Depends(get_db)):
    """الحصول على العمال الذين لديهم قيود عمل"""
    return crud_medical.get_workers_with_restrictions(db)

@router.get("/records/{record_id}", response_model=MedicalRecord)
def get_medical_record(record_id: int, db: Session = Depends(get_db)):
    """الحصول على سجل طبي بالمعرف"""
    record = crud_medical.get_medical_record(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="السجل الطبي غير موجود")
    return record

@router.put("/records/{record_id}", response_model=MedicalRecord)
def update_medical_record(
    record_id: int,
    medical_record: MedicalRecordUpdate,
    db: Session = Depends(get_db)
):
    """تحديث سجل طبي"""
    updated_record = crud_medical.update_medical_record(db, record_id, medical_record)
    if not updated_record:
        raise HTTPException(status_code=404, detail="السجل الطبي غير موجود")
    return updated_record

@router.delete("/records/{record_id}")
def delete_medical_record(record_id: int, db: Session = Depends(get_db)):
    """حذف سجل طبي"""
    success = crud_medical.delete_medical_record(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="السجل الطبي غير موجود")
    return {"message": "تم حذف السجل الطبي بنجاح"}

# Medical Documents Endpoints
@router.post("/documents/", response_model=MedicalDocument)
def create_medical_document(
    medical_file_id: int = Form(...),
    document_type: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    expiry_date: Optional[date] = Form(None),
    is_confidential: bool = Form(True),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """رفع وثيقة طبية جديدة"""
    import os
    from datetime import date as today_date
    
    # التحقق من وجود الملف الطبي
    medical_file = crud_medical.get_medical_file(db, medical_file_id)
    if not medical_file:
        raise HTTPException(status_code=404, detail="الملف الطبي غير موجود")
    
    # إنشاء مجلد التحميل إذا لم يكن موجود
    upload_dir = "uploaded_files/medical_documents"
    os.makedirs(upload_dir, exist_ok=True)
    
    # حفظ الملف
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{medical_file_id}_{document_type}_{today_date.today()}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    
    # إنشاء السجل في قاعدة البيانات
    document_data = MedicalDocumentCreate(
        medical_file_id=medical_file_id,
        document_type=document_type,
        title=title,
        file_path=file_path,
        file_size=os.path.getsize(file_path),
        uploaded_date=today_date.today(),
        expiry_date=expiry_date,
        is_confidential=is_confidential,
        description=description
    )
    
    return crud_medical.create_medical_document(db, document_data)

@router.get("/documents/file/{medical_file_id}", response_model=List[MedicalDocument])
def get_medical_documents_by_file(medical_file_id: int, db: Session = Depends(get_db)):
    """الحصول على الوثائق الطبية للملف"""
    return crud_medical.get_medical_documents_by_file(db, medical_file_id)

@router.get("/documents/expiring/", response_model=List[MedicalDocument])
def get_expiring_documents(days_ahead: int = 30, db: Session = Depends(get_db)):
    """الحصول على الوثائق التي ستنتهي صلاحيتها قريباً"""
    return crud_medical.get_expiring_documents(db, days_ahead)

@router.get("/documents/{document_id}", response_model=MedicalDocument)
def get_medical_document(document_id: int, db: Session = Depends(get_db)):
    """الحصول على وثيقة طبية بالمعرف"""
    document = crud_medical.get_medical_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="الوثيقة الطبية غير موجودة")
    return document

@router.put("/documents/{document_id}", response_model=MedicalDocument)
def update_medical_document(
    document_id: int,
    medical_document: MedicalDocumentUpdate,
    db: Session = Depends(get_db)
):
    """تحديث وثيقة طبية"""
    updated_document = crud_medical.update_medical_document(db, document_id, medical_document)
    if not updated_document:
        raise HTTPException(status_code=404, detail="الوثيقة الطبية غير موجودة")
    return updated_document

@router.delete("/documents/{document_id}")
def delete_medical_document(document_id: int, db: Session = Depends(get_db)):
    """حذف وثيقة طبية"""
    success = crud_medical.delete_medical_document(db, document_id)
    if not success:
        raise HTTPException(status_code=404, detail="الوثيقة الطبية غير موجودة")
    return {"message": "تم حذف الوثيقة الطبية بنجاح"}

# Health and Safety Incidents Endpoints
@router.post("/incidents/", response_model=HealthAndSafetyIncident)
def create_safety_incident(
    incident: HealthAndSafetyIncidentCreate,
    db: Session = Depends(get_db)
):
    """إنشاء حادث صحة وسلامة جديد"""
    return crud_medical.create_safety_incident(db, incident)

@router.get("/incidents/worker/{worker_id}", response_model=List[HealthAndSafetyIncident])
def get_safety_incidents_by_worker(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على حوادث العامل"""
    return crud_medical.get_safety_incidents_by_worker(db, worker_id)

@router.get("/incidents/recent/", response_model=List[HealthAndSafetyIncident])
def get_recent_incidents(days: int = 30, db: Session = Depends(get_db)):
    """الحصول على الحوادث الأخيرة"""
    return crud_medical.get_recent_incidents(db, days)

@router.get("/incidents/investigations/", response_model=List[HealthAndSafetyIncident])
def get_open_investigations(db: Session = Depends(get_db)):
    """الحصول على التحقيقات المفتوحة"""
    return crud_medical.get_open_investigations(db)

@router.get("/incidents/{incident_id}", response_model=HealthAndSafetyIncident)
def get_safety_incident(incident_id: int, db: Session = Depends(get_db)):
    """الحصول على حادث بالمعرف"""
    incident = crud_medical.get_safety_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="الحادث غير موجود")
    return incident

@router.put("/incidents/{incident_id}", response_model=HealthAndSafetyIncident)
def update_safety_incident(
    incident_id: int,
    incident: HealthAndSafetyIncidentUpdate,
    db: Session = Depends(get_db)
):
    """تحديث حادث صحة وسلامة"""
    updated_incident = crud_medical.update_safety_incident(db, incident_id, incident)
    if not updated_incident:
        raise HTTPException(status_code=404, detail="الحادث غير موجود")
    return updated_incident

# Medical Checkup Schedule Endpoints
@router.post("/checkups/", response_model=MedicalCheckupSchedule)
def create_checkup_schedule(
    checkup: MedicalCheckupScheduleCreate,
    db: Session = Depends(get_db)
):
    """إنشاء جدولة فحص طبي"""
    return crud_medical.create_checkup_schedule(db, checkup)

@router.get("/checkups/overdue/", response_model=List[MedicalCheckupSchedule])
def get_overdue_checkups(db: Session = Depends(get_db)):
    """الحصول على الفحوصات المتأخرة"""
    return crud_medical.get_overdue_checkups(db)

@router.get("/checkups/upcoming/", response_model=List[MedicalCheckupSchedule])
def get_upcoming_checkups(days_ahead: int = 30, db: Session = Depends(get_db)):
    """الحصول على الفحوصات القادمة"""
    return crud_medical.get_upcoming_checkups(db, days_ahead)

@router.get("/checkups/{checkup_id}", response_model=MedicalCheckupSchedule)
def get_checkup_schedule(checkup_id: int, db: Session = Depends(get_db)):
    """الحصول على جدولة فحص بالمعرف"""
    checkup = crud_medical.get_checkup_schedule(db, checkup_id)
    if not checkup:
        raise HTTPException(status_code=404, detail="جدولة الفحص غير موجودة")
    return checkup

@router.put("/checkups/{checkup_id}", response_model=MedicalCheckupSchedule)
def update_checkup_schedule(
    checkup_id: int,
    checkup: MedicalCheckupScheduleUpdate,
    db: Session = Depends(get_db)
):
    """تحديث جدولة فحص طبي"""
    updated_checkup = crud_medical.update_checkup_schedule(db, checkup_id, checkup)
    if not updated_checkup:
        raise HTTPException(status_code=404, detail="جدولة الفحص غير موجودة")
    return updated_checkup

# Statistics and Reports
@router.get("/statistics/health/", response_model=HealthStatistics)
def get_health_statistics(db: Session = Depends(get_db)):
    """الحصول على إحصائيات الصحة والسلامة"""
    return crud_medical.get_health_statistics(db)
