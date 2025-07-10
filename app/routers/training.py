"""
API Endpoints لإدارة الدورات التدريبية
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import os
import uuid

from app.database import get_db
from app.schemas.training import (
    TrainingCourse, TrainingCourseCreate, TrainingCourseUpdate,
    TrainingSession, TrainingSessionCreate, TrainingSessionUpdate,
    TrainingEnrollment, TrainingEnrollmentCreate, TrainingEnrollmentUpdate,
    SessionAttendance, SessionAttendanceCreate, SessionAttendanceUpdate,
    TrainingEvaluation, TrainingEvaluationCreate, TrainingEvaluationUpdate,
    TrainingCertificate, TrainingCertificateCreate, TrainingCertificateUpdate,
    TrainingRequirement, TrainingRequirementCreate, TrainingRequirementUpdate,
    TrainingBudget, TrainingBudgetCreate, TrainingBudgetUpdate,
    TrainingStatistics, TrainingDashboard
)
from app.crud.training import (
    training_course_crud, training_session_crud, training_enrollment_crud,
    session_attendance_crud, training_evaluation_crud, training_certificate_crud,
    training_requirement_crud, training_budget_crud
)

router = APIRouter(prefix="/training", tags=["training"])

# Training Course Endpoints
@router.post("/courses/", response_model=TrainingCourse)
def create_training_course(
    course: TrainingCourseCreate,
    db: Session = Depends(get_db),
    current_user_id: int = 1  # TODO: استخدام authentication حقيقي
):
    """إنشاء دورة تدريبية جديدة"""
    return training_course_crud.create(db, course, created_by=current_user_id)

@router.get("/courses/", response_model=List[TrainingCourse])
def get_training_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    training_type: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """الحصول على قائمة الدورات التدريبية"""
    return training_course_crud.get_multi(
        db, skip=skip, limit=limit, status=status, 
        training_type=training_type, start_date=start_date, end_date=end_date
    )

@router.get("/courses/{course_id}", response_model=TrainingCourse)
def get_training_course(course_id: int, db: Session = Depends(get_db)):
    """الحصول على دورة تدريبية محددة"""
    course = training_course_crud.get(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="الدورة التدريبية غير موجودة")
    return course

@router.put("/courses/{course_id}", response_model=TrainingCourse)
def update_training_course(
    course_id: int,
    course_update: TrainingCourseUpdate,
    db: Session = Depends(get_db)
):
    """تحديث دورة تدريبية"""
    course = training_course_crud.update(db, course_id, course_update)
    if not course:
        raise HTTPException(status_code=404, detail="الدورة التدريبية غير موجودة")
    return course

@router.delete("/courses/{course_id}")
def delete_training_course(course_id: int, db: Session = Depends(get_db)):
    """حذف دورة تدريبية"""
    success = training_course_crud.delete(db, course_id)
    if not success:
        raise HTTPException(status_code=404, detail="الدورة التدريبية غير موجودة")
    return {"message": "تم حذف الدورة التدريبية بنجاح"}

@router.get("/courses/{course_id}/statistics")
def get_course_statistics(course_id: int, db: Session = Depends(get_db)):
    """إحصائيات دورة تدريبية"""
    stats = training_course_crud.get_course_statistics(db, course_id)
    if not stats:
        raise HTTPException(status_code=404, detail="الدورة التدريبية غير موجودة")
    return stats

@router.get("/courses/upcoming/list", response_model=List[TrainingCourse])
def get_upcoming_courses(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """الدورات القادمة"""
    return training_course_crud.get_upcoming_courses(db, limit)

# Training Session Endpoints
@router.post("/sessions/", response_model=TrainingSession)
def create_training_session(session: TrainingSessionCreate, db: Session = Depends(get_db)):
    """إنشاء جلسة تدريبية"""
    return training_session_crud.create(db, session)

@router.get("/courses/{course_id}/sessions", response_model=List[TrainingSession])
def get_course_sessions(course_id: int, db: Session = Depends(get_db)):
    """الحصول على جلسات دورة"""
    return training_session_crud.get_by_course(db, course_id)

@router.put("/sessions/{session_id}", response_model=TrainingSession)
def update_training_session(
    session_id: int,
    session_update: TrainingSessionUpdate,
    db: Session = Depends(get_db)
):
    """تحديث جلسة تدريبية"""
    session = training_session_crud.update(db, session_id, session_update)
    if not session:
        raise HTTPException(status_code=404, detail="الجلسة التدريبية غير موجودة")
    return session

@router.post("/sessions/{session_id}/complete")
def mark_session_completed(
    session_id: int,
    notes: str = Form(None),
    db: Session = Depends(get_db)
):
    """تمييز الجلسة كمكتملة"""
    session = training_session_crud.mark_completed(db, session_id, notes)
    if not session:
        raise HTTPException(status_code=404, detail="الجلسة التدريبية غير موجودة")
    return {"message": "تم تمييز الجلسة كمكتملة"}

# Training Enrollment Endpoints
@router.post("/courses/{course_id}/enroll/{worker_id}")
def enroll_worker_in_course(
    course_id: int,
    worker_id: int,
    notes: str = Form(None),
    db: Session = Depends(get_db)
):
    """تسجيل عامل في دورة"""
    success, message = training_enrollment_crud.enroll_worker(db, course_id, worker_id, notes)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}

@router.get("/workers/{worker_id}/enrollments")
def get_worker_enrollments(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على تسجيلات عامل"""
    return training_enrollment_crud.get_worker_enrollments(db, worker_id)

@router.get("/courses/{course_id}/enrollments")
def get_course_enrollments(course_id: int, db: Session = Depends(get_db)):
    """الحصول على مسجلي دورة"""
    return training_enrollment_crud.get_course_enrollments(db, course_id)

@router.put("/courses/{course_id}/enrollments/{worker_id}")
def update_enrollment_status(
    course_id: int,
    worker_id: int,
    enrollment_update: TrainingEnrollmentUpdate,
    db: Session = Depends(get_db)
):
    """تحديث حالة التسجيل"""
    success = training_enrollment_crud.update_enrollment(db, course_id, worker_id, enrollment_update)
    if not success:
        raise HTTPException(status_code=404, detail="التسجيل غير موجود")
    return {"message": "تم تحديث حالة التسجيل"}

# Session Attendance Endpoints
@router.post("/sessions/{session_id}/attendance", response_model=SessionAttendance)
def record_session_attendance(
    session_id: int,
    attendance: SessionAttendanceCreate,
    db: Session = Depends(get_db),
    current_user_id: int = 1
):
    """تسجيل حضور جلسة"""
    return session_attendance_crud.record_attendance(db, attendance, recorded_by=current_user_id)

@router.get("/sessions/{session_id}/attendance", response_model=List[SessionAttendance])
def get_session_attendance(session_id: int, db: Session = Depends(get_db)):
    """الحصول على حضور جلسة"""
    return session_attendance_crud.get_session_attendance(db, session_id)

@router.get("/workers/{worker_id}/attendance")
def get_worker_attendance(
    worker_id: int,
    course_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """الحصول على حضور عامل"""
    return session_attendance_crud.get_worker_attendance(db, worker_id, course_id)

@router.post("/sessions/{session_id}/attendance/bulk")
def bulk_record_attendance(
    session_id: int,
    attendance_data: List[Dict[str, Any]],
    db: Session = Depends(get_db),
    current_user_id: int = 1
):
    """تسجيل حضور جماعي"""
    return session_attendance_crud.bulk_record_attendance(db, session_id, attendance_data, current_user_id)

# Training Evaluation Endpoints
@router.post("/evaluations/", response_model=TrainingEvaluation)
def create_training_evaluation(evaluation: TrainingEvaluationCreate, db: Session = Depends(get_db)):
    """إنشاء تقييم دورة"""
    return training_evaluation_crud.create(db, evaluation)

@router.get("/courses/{course_id}/evaluations", response_model=List[TrainingEvaluation])
def get_course_evaluations(course_id: int, db: Session = Depends(get_db)):
    """الحصول على تقييمات دورة"""
    return training_evaluation_crud.get_course_evaluations(db, course_id)

@router.get("/courses/{course_id}/evaluations/summary")
def get_evaluation_summary(course_id: int, db: Session = Depends(get_db)):
    """ملخص تقييمات دورة"""
    return training_evaluation_crud.get_evaluation_summary(db, course_id)

# Training Certificate Endpoints
@router.post("/certificates/", response_model=TrainingCertificate)
def issue_training_certificate(
    certificate: TrainingCertificateCreate,
    db: Session = Depends(get_db),
    current_user_id: int = 1
):
    """إصدار شهادة تدريب"""
    return training_certificate_crud.create(db, certificate, issued_by=current_user_id)

@router.get("/workers/{worker_id}/certificates", response_model=List[TrainingCertificate])
def get_worker_certificates(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على شهادات عامل"""
    return training_certificate_crud.get_worker_certificates(db, worker_id)

@router.get("/certificates/expiring")
def get_expiring_certificates(days: int = Query(30, ge=1), db: Session = Depends(get_db)):
    """الشهادات المنتهية الصلاحية قريباً"""
    return training_certificate_crud.get_expiring_certificates(db, days)

@router.get("/certificates/verify/{verification_code}")
def verify_certificate(verification_code: str, db: Session = Depends(get_db)):
    """التحقق من صحة شهادة"""
    certificate = training_certificate_crud.verify_certificate(db, verification_code)
    if not certificate:
        raise HTTPException(status_code=404, detail="الشهادة غير موجودة أو غير صحيحة")
    return certificate

@router.post("/certificates/{certificate_id}/upload")
async def upload_certificate_file(
    certificate_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """رفع ملف شهادة"""
    # التأكد من وجود الشهادة
    certificate = db.query(TrainingCertificate).filter(TrainingCertificate.id == certificate_id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="الشهادة غير موجودة")
    
    # حفظ الملف
    upload_dir = "uploaded_files/certificates"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
    unique_filename = f"cert_{certificate_id}_{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # تحديث مسار الملف في قاعدة البيانات
    certificate.certificate_file_path = file_path
    db.commit()
    
    return {"message": "تم رفع ملف الشهادة بنجاح", "file_path": file_path}

# Training Requirement Endpoints
@router.post("/requirements/", response_model=TrainingRequirement)
def create_training_requirement(requirement: TrainingRequirementCreate, db: Session = Depends(get_db)):
    """إنشاء متطلب تدريبي"""
    return training_requirement_crud.create(db, requirement)

@router.get("/requirements/job/{job_title}")
def get_job_training_requirements(job_title: str, db: Session = Depends(get_db)):
    """الحصول على متطلبات وظيفة"""
    return training_requirement_crud.get_by_job_title(db, job_title)

@router.get("/workers/{worker_id}/compliance")
def check_worker_compliance(worker_id: int, db: Session = Depends(get_db)):
    """فحص امتثال عامل للمتطلبات التدريبية"""
    return training_requirement_crud.check_compliance(db, worker_id)

# Training Budget Endpoints
@router.post("/budgets/", response_model=TrainingBudget)
def create_training_budget(budget: TrainingBudgetCreate, db: Session = Depends(get_db)):
    """إنشاء ميزانية تدريب"""
    return training_budget_crud.create(db, budget)

@router.get("/budgets/current-year")
def get_current_year_budgets(department: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """الحصول على ميزانية السنة الحالية"""
    return training_budget_crud.get_current_year_budget(db, department)

@router.put("/budgets/{budget_id}/spend")
def update_spent_budget(budget_id: int, amount: float, db: Session = Depends(get_db)):
    """تحديث الميزانية المصروفة"""
    return training_budget_crud.update_spent_budget(db, budget_id, amount)

# Dashboard and Reports
@router.get("/dashboard", response_model=TrainingDashboard)
def get_training_dashboard(db: Session = Depends(get_db)):
    """لوحة تحكم التدريب"""
    from sqlalchemy import func
    from decimal import Decimal
    
    # إحصائيات عامة
    total_courses = db.query(func.count(TrainingCourse.id)).scalar()
    active_courses = db.query(func.count(TrainingCourse.id)).filter(
        TrainingCourse.status == 'active'
    ).scalar()
    completed_courses = db.query(func.count(TrainingCourse.id)).filter(
        TrainingCourse.status == 'completed'
    ).scalar()
    
    # إحصائيات المشاركين
    total_participants = db.query(func.count(training_enrollments.c.id)).scalar()
    completed_participants = db.query(func.count(training_enrollments.c.id)).filter(
        training_enrollments.c.completion_status == 'completed'
    ).scalar()
    
    completion_rate = (completed_participants / total_participants * 100) if total_participants > 0 else 0
    
    # متوسط التقييم
    avg_rating = db.query(func.avg(TrainingEvaluation.overall_rating)).scalar()
    
    # الميزانية
    current_year = datetime.now().year
    budgets = db.query(TrainingBudget).filter(TrainingBudget.year == current_year).all()
    total_allocated = sum(b.allocated_budget for b in budgets)
    total_spent = sum(b.spent_budget for b in budgets)
    budget_utilization = (total_spent / total_allocated * 100) if total_allocated > 0 else 0
    
    statistics = TrainingStatistics(
        total_courses=total_courses or 0,
        active_courses=active_courses or 0,
        completed_courses=completed_courses or 0,
        total_participants=total_participants or 0,
        completion_rate=completion_rate,
        average_rating=float(avg_rating) if avg_rating else 0,
        total_budget_allocated=total_allocated,
        total_budget_spent=total_spent,
        budget_utilization=budget_utilization
    )
    
    # الدورات القادمة
    upcoming_courses = training_course_crud.get_upcoming_courses(db, 5)
    
    # الشهادات الأخيرة
    recent_certificates = db.query(TrainingCertificate).order_by(
        TrainingCertificate.created_at.desc()
    ).limit(5).all()
    
    # تنبيهات الامتثال
    compliance_alerts = []
    expiring_certs = training_certificate_crud.get_expiring_certificates(db, 30)
    for cert in expiring_certs:
        compliance_alerts.append({
            "type": "certificate_expiring",
            "message": f"شهادة {cert.certificate_number} ستنتهي في {cert.expiry_date}",
            "worker_id": cert.worker_id,
            "certificate_id": cert.id
        })
    
    return TrainingDashboard(
        statistics=statistics,
        upcoming_courses=upcoming_courses,
        recent_completions=recent_certificates,
        budget_summary=budgets,
        compliance_alerts=compliance_alerts
    )

@router.get("/reports/training-effectiveness")
def get_training_effectiveness_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    training_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """تقرير فعالية التدريب"""
    query = db.query(TrainingCourse)
    
    if start_date:
        query = query.filter(TrainingCourse.start_date >= start_date)
    if end_date:
        query = query.filter(TrainingCourse.end_date <= end_date)
    if training_type:
        query = query.filter(TrainingCourse.training_type == training_type)
    
    courses = query.all()
    
    report_data = []
    for course in courses:
        stats = training_course_crud.get_course_statistics(db, course.id)
        eval_summary = training_evaluation_crud.get_evaluation_summary(db, course.id)
        
        report_data.append({
            "course": course,
            "statistics": stats,
            "evaluation_summary": eval_summary
        })
    
    return {
        "report_type": "training_effectiveness",
        "generated_at": datetime.utcnow(),
        "parameters": {
            "start_date": start_date,
            "end_date": end_date,
            "training_type": training_type
        },
        "data": report_data
    }
