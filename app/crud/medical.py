"""
CRUD operations لإدارة الملفات الطبية
Medical Files Management CRUD
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, extract
from typing import List, Optional, Dict
from datetime import date, datetime, timedelta
import calendar

from app.models_medical import (
    MedicalFile, MedicalRecord, MedicalDocument,
    HealthAndSafetyIncident, MedicalCheckupSchedule
)
from app.schemas.medical import (
    MedicalFileCreate, MedicalFileUpdate,
    MedicalRecordCreate, MedicalRecordUpdate,
    MedicalDocumentCreate, MedicalDocumentUpdate,
    HealthAndSafetyIncidentCreate, HealthAndSafetyIncidentUpdate,
    MedicalCheckupScheduleCreate, MedicalCheckupScheduleUpdate,
    MedicalFileSummary, HealthStatistics
)

# Medical File CRUD Operations
def create_medical_file(db: Session, medical_file: MedicalFileCreate) -> MedicalFile:
    """إنشاء ملف طبي جديد"""
    db_medical_file = MedicalFile(**medical_file.dict())
    db.add(db_medical_file)
    db.commit()
    db.refresh(db_medical_file)
    return db_medical_file

def get_medical_file(db: Session, medical_file_id: int) -> Optional[MedicalFile]:
    """الحصول على ملف طبي بالمعرف"""
    return db.query(MedicalFile).filter(MedicalFile.id == medical_file_id).first()

def get_medical_file_by_worker(db: Session, worker_id: int) -> Optional[MedicalFile]:
    """الحصول على الملف الطبي للعامل"""
    return db.query(MedicalFile).filter(MedicalFile.worker_id == worker_id).first()

def get_medical_file_by_number(db: Session, file_number: str) -> Optional[MedicalFile]:
    """الحصول على ملف طبي برقم الملف"""
    return db.query(MedicalFile).filter(MedicalFile.file_number == file_number).first()

def get_medical_files(db: Session, skip: int = 0, limit: int = 100) -> List[MedicalFile]:
    """الحصول على جميع الملفات الطبية"""
    return db.query(MedicalFile).offset(skip).limit(limit).all()

def update_medical_file(db: Session, medical_file_id: int, medical_file: MedicalFileUpdate) -> Optional[MedicalFile]:
    """تحديث ملف طبي"""
    db_medical_file = db.query(MedicalFile).filter(MedicalFile.id == medical_file_id).first()
    if db_medical_file:
        update_data = medical_file.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_medical_file, field, value)
        db.commit()
        db.refresh(db_medical_file)
    return db_medical_file

def delete_medical_file(db: Session, medical_file_id: int) -> bool:
    """حذف ملف طبي"""
    db_medical_file = db.query(MedicalFile).filter(MedicalFile.id == medical_file_id).first()
    if db_medical_file:
        db.delete(db_medical_file)
        db.commit()
        return True
    return False

def get_workers_without_medical_files(db: Session) -> List[int]:
    """الحصول على العمال الذين لا يملكون ملفات طبية"""
    from app.models import Worker
    workers_with_files = db.query(MedicalFile.worker_id).all()
    worker_ids_with_files = [w[0] for w in workers_with_files]
    
    workers_without_files = db.query(Worker.id).filter(
        ~Worker.id.in_(worker_ids_with_files)
    ).all()
    
    return [w[0] for w in workers_without_files]

def search_medical_files(db: Session, query: str, fitness_filter: Optional[bool] = None) -> List[MedicalFile]:
    """البحث في الملفات الطبية"""
    search_query = db.query(MedicalFile)
    
    if query:
        search_query = search_query.filter(
            or_(
                MedicalFile.file_number.contains(query),
                MedicalFile.blood_type.contains(query),
                MedicalFile.chronic_diseases.contains(query),
                MedicalFile.allergies.contains(query)
            )
        )
    
    if fitness_filter is not None:
        search_query = search_query.filter(MedicalFile.fitness_for_work == fitness_filter)
    
    return search_query.all()

# Medical Record CRUD Operations
def create_medical_record(db: Session, medical_record: MedicalRecordCreate) -> MedicalRecord:
    """إنشاء سجل طبي جديد"""
    db_medical_record = MedicalRecord(**medical_record.dict())
    db.add(db_medical_record)
    db.commit()
    db.refresh(db_medical_record)
    return db_medical_record

def get_medical_record(db: Session, record_id: int) -> Optional[MedicalRecord]:
    """الحصول على سجل طبي بالمعرف"""
    return db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()

def get_medical_records_by_file(db: Session, medical_file_id: int) -> List[MedicalRecord]:
    """الحصول على السجلات الطبية للملف"""
    return db.query(MedicalRecord).filter(
        MedicalRecord.medical_file_id == medical_file_id
    ).order_by(MedicalRecord.record_date.desc()).all()

def get_medical_records_by_worker(db: Session, worker_id: int) -> List[MedicalRecord]:
    """الحصول على السجلات الطبية للعامل"""
    return db.query(MedicalRecord).join(MedicalFile).filter(
        MedicalFile.worker_id == worker_id
    ).order_by(MedicalRecord.record_date.desc()).all()

def get_records_with_follow_up(db: Session) -> List[MedicalRecord]:
    """الحصول على السجلات التي تحتاج متابعة"""
    return db.query(MedicalRecord).filter(
        and_(
            MedicalRecord.follow_up_required == True,
            MedicalRecord.follow_up_date <= date.today()
        )
    ).all()

def get_workers_with_restrictions(db: Session) -> List[MedicalRecord]:
    """الحصول على العمال الذين لديهم قيود عمل"""
    return db.query(MedicalRecord).filter(
        and_(
            MedicalRecord.work_restriction == True,
            or_(
                MedicalRecord.restriction_end_date.is_(None),
                MedicalRecord.restriction_end_date >= date.today()
            )
        )
    ).all()

def update_medical_record(db: Session, record_id: int, medical_record: MedicalRecordUpdate) -> Optional[MedicalRecord]:
    """تحديث سجل طبي"""
    db_record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if db_record:
        update_data = medical_record.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_record, field, value)
        db.commit()
        db.refresh(db_record)
    return db_record

def delete_medical_record(db: Session, record_id: int) -> bool:
    """حذف سجل طبي"""
    db_record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if db_record:
        db.delete(db_record)
        db.commit()
        return True
    return False

# Medical Document CRUD Operations
def create_medical_document(db: Session, medical_document: MedicalDocumentCreate) -> MedicalDocument:
    """إنشاء وثيقة طبية جديدة"""
    db_document = MedicalDocument(**medical_document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_medical_document(db: Session, document_id: int) -> Optional[MedicalDocument]:
    """الحصول على وثيقة طبية بالمعرف"""
    return db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()

def get_medical_documents_by_file(db: Session, medical_file_id: int) -> List[MedicalDocument]:
    """الحصول على الوثائق الطبية للملف"""
    return db.query(MedicalDocument).filter(
        MedicalDocument.medical_file_id == medical_file_id
    ).order_by(MedicalDocument.uploaded_date.desc()).all()

def get_expiring_documents(db: Session, days_ahead: int = 30) -> List[MedicalDocument]:
    """الحصول على الوثائق التي ستنتهي صلاحيتها قريباً"""
    expiry_date = date.today() + timedelta(days=days_ahead)
    return db.query(MedicalDocument).filter(
        and_(
            MedicalDocument.expiry_date.is_not(None),
            MedicalDocument.expiry_date <= expiry_date,
            MedicalDocument.expiry_date >= date.today()
        )
    ).all()

def update_medical_document(db: Session, document_id: int, medical_document: MedicalDocumentUpdate) -> Optional[MedicalDocument]:
    """تحديث وثيقة طبية"""
    db_document = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if db_document:
        update_data = medical_document.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_document, field, value)
        db.commit()
        db.refresh(db_document)
    return db_document

def delete_medical_document(db: Session, document_id: int) -> bool:
    """حذف وثيقة طبية"""
    db_document = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if db_document:
        db.delete(db_document)
        db.commit()
        return True
    return False

# Health and Safety Incident CRUD Operations
def create_safety_incident(db: Session, incident: HealthAndSafetyIncidentCreate) -> HealthAndSafetyIncident:
    """إنشاء حادث صحة وسلامة جديد"""
    db_incident = HealthAndSafetyIncident(**incident.dict())
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

def get_safety_incident(db: Session, incident_id: int) -> Optional[HealthAndSafetyIncident]:
    """الحصول على حادث بالمعرف"""
    return db.query(HealthAndSafetyIncident).filter(HealthAndSafetyIncident.id == incident_id).first()

def get_safety_incidents_by_worker(db: Session, worker_id: int) -> List[HealthAndSafetyIncident]:
    """الحصول على حوادث العامل"""
    return db.query(HealthAndSafetyIncident).filter(
        HealthAndSafetyIncident.worker_id == worker_id
    ).order_by(HealthAndSafetyIncident.incident_date.desc()).all()

def get_recent_incidents(db: Session, days: int = 30) -> List[HealthAndSafetyIncident]:
    """الحصول على الحوادث الأخيرة"""
    start_date = datetime.now() - timedelta(days=days)
    return db.query(HealthAndSafetyIncident).filter(
        HealthAndSafetyIncident.incident_date >= start_date
    ).order_by(HealthAndSafetyIncident.incident_date.desc()).all()

def get_open_investigations(db: Session) -> List[HealthAndSafetyIncident]:
    """الحصول على التحقيقات المفتوحة"""
    return db.query(HealthAndSafetyIncident).filter(
        and_(
            HealthAndSafetyIncident.investigation_required == True,
            HealthAndSafetyIncident.investigation_completed == False
        )
    ).all()

def update_safety_incident(db: Session, incident_id: int, incident: HealthAndSafetyIncidentUpdate) -> Optional[HealthAndSafetyIncident]:
    """تحديث حادث صحة وسلامة"""
    db_incident = db.query(HealthAndSafetyIncident).filter(HealthAndSafetyIncident.id == incident_id).first()
    if db_incident:
        update_data = incident.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_incident, field, value)
        db.commit()
        db.refresh(db_incident)
    return db_incident

# Medical Checkup Schedule CRUD Operations
def create_checkup_schedule(db: Session, checkup: MedicalCheckupScheduleCreate) -> MedicalCheckupSchedule:
    """إنشاء جدولة فحص طبي"""
    db_checkup = MedicalCheckupSchedule(**checkup.dict())
    db.add(db_checkup)
    db.commit()
    db.refresh(db_checkup)
    return db_checkup

def get_checkup_schedule(db: Session, checkup_id: int) -> Optional[MedicalCheckupSchedule]:
    """الحصول على جدولة فحص بالمعرف"""
    return db.query(MedicalCheckupSchedule).filter(MedicalCheckupSchedule.id == checkup_id).first()

def get_overdue_checkups(db: Session) -> List[MedicalCheckupSchedule]:
    """الحصول على الفحوصات المتأخرة"""
    return db.query(MedicalCheckupSchedule).filter(
        and_(
            MedicalCheckupSchedule.completed == False,
            MedicalCheckupSchedule.scheduled_date < date.today()
        )
    ).all()

def get_upcoming_checkups(db: Session, days_ahead: int = 30) -> List[MedicalCheckupSchedule]:
    """الحصول على الفحوصات القادمة"""
    end_date = date.today() + timedelta(days=days_ahead)
    return db.query(MedicalCheckupSchedule).filter(
        and_(
            MedicalCheckupSchedule.completed == False,
            MedicalCheckupSchedule.scheduled_date.between(date.today(), end_date)
        )
    ).all()

def update_checkup_schedule(db: Session, checkup_id: int, checkup: MedicalCheckupScheduleUpdate) -> Optional[MedicalCheckupSchedule]:
    """تحديث جدولة فحص طبي"""
    db_checkup = db.query(MedicalCheckupSchedule).filter(MedicalCheckupSchedule.id == checkup_id).first()
    if db_checkup:
        update_data = checkup.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_checkup, field, value)
        db.commit()
        db.refresh(db_checkup)
    return db_checkup

# Statistics and Reports
def get_health_statistics(db: Session) -> HealthStatistics:
    """الحصول على إحصائيات الصحة والسلامة"""
    total_files = db.query(MedicalFile).count()
    fit_for_work = db.query(MedicalFile).filter(MedicalFile.fitness_for_work == True).count()
    
    # العمال مع قيود العمل
    workers_with_restrictions = db.query(MedicalRecord).filter(
        and_(
            MedicalRecord.work_restriction == True,
            or_(
                MedicalRecord.restriction_end_date.is_(None),
                MedicalRecord.restriction_end_date >= date.today()
            )
        )
    ).count()
    
    # الفحوصات المتأخرة
    overdue_checkups = db.query(MedicalCheckupSchedule).filter(
        and_(
            MedicalCheckupSchedule.completed == False,
            MedicalCheckupSchedule.scheduled_date < date.today()
        )
    ).count()
    
    # الحوادث الأخيرة (آخر 30 يوم)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_incidents = db.query(HealthAndSafetyIncident).filter(
        HealthAndSafetyIncident.incident_date >= thirty_days_ago
    ).count()
    
    # الحوادث هذا الشهر
    current_month_start = date.today().replace(day=1)
    incidents_this_month = db.query(HealthAndSafetyIncident).filter(
        HealthAndSafetyIncident.incident_date >= current_month_start
    ).count()
    
    # تصنيف الحوادث حسب النوع
    incident_types = db.query(
        HealthAndSafetyIncident.incident_type,
        func.count(HealthAndSafetyIncident.id)
    ).filter(
        HealthAndSafetyIncident.incident_date >= thirty_days_ago
    ).group_by(HealthAndSafetyIncident.incident_type).all()
    
    incident_types_breakdown = {incident_type: count for incident_type, count in incident_types}
    
    # تصنيف الحوادث حسب الخطورة
    severity_breakdown_query = db.query(
        HealthAndSafetyIncident.severity,
        func.count(HealthAndSafetyIncident.id)
    ).filter(
        HealthAndSafetyIncident.incident_date >= thirty_days_ago
    ).group_by(HealthAndSafetyIncident.severity).all()
    
    severity_breakdown = {severity: count for severity, count in severity_breakdown_query}
    
    # متوسط أيام الإجازة المرضية لكل حادث
    avg_time_off = db.query(func.avg(HealthAndSafetyIncident.time_off_work)).filter(
        HealthAndSafetyIncident.incident_date >= thirty_days_ago
    ).scalar() or 0.0
    
    return HealthStatistics(
        total_workers_with_medical_files=total_files,
        fit_for_work_count=fit_for_work,
        workers_with_restrictions=workers_with_restrictions,
        overdue_checkups=overdue_checkups,
        recent_incidents=recent_incidents,
        total_incidents_this_month=incidents_this_month,
        incident_types_breakdown=incident_types_breakdown,
        severity_breakdown=severity_breakdown,
        average_time_off_per_incident=float(avg_time_off)
    )

def get_medical_file_summary(db: Session, worker_id: int) -> Optional[MedicalFileSummary]:
    """الحصول على ملخص الملف الطبي للعامل"""
    from app.models import Worker
    
    medical_file = db.query(MedicalFile).filter(MedicalFile.worker_id == worker_id).first()
    if not medical_file:
        return None
        
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        return None
    
    # عدد السجلات الطبية
    total_records = db.query(MedicalRecord).filter(
        MedicalRecord.medical_file_id == medical_file.id
    ).count()
    
    # الحوادث الأخيرة (آخر 30 يوم)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_incidents = db.query(HealthAndSafetyIncident).filter(
        and_(
            HealthAndSafetyIncident.worker_id == worker_id,
            HealthAndSafetyIncident.incident_date >= thirty_days_ago
        )
    ).count()
    
    # المتابعات المعلقة
    pending_follow_ups = db.query(MedicalRecord).filter(
        and_(
            MedicalRecord.medical_file_id == medical_file.id,
            MedicalRecord.follow_up_required == True,
            MedicalRecord.follow_up_date <= date.today()
        )
    ).count()
    
    return MedicalFileSummary(
        worker_id=worker_id,
        worker_name=f"{worker.first_name} {worker.last_name}",
        file_number=medical_file.file_number,
        blood_type=medical_file.blood_type,
        fitness_for_work=medical_file.fitness_for_work,
        last_checkup_date=medical_file.last_checkup_date,
        next_checkup_due=medical_file.next_checkup_due,
        total_records=total_records,
        recent_incidents=recent_incidents,
        pending_follow_ups=pending_follow_ups
    )
