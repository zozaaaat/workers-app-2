"""
عمليات CRUD لإدارة الدورات التدريبية
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, extract, desc, asc
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from decimal import Decimal

from app.models_training import (
    TrainingCourse, TrainingSession, TrainingEvaluation, 
    TrainingCertificate, TrainingRequirement, TrainingBudget,
    SessionAttendance, training_enrollments, TrainingStatusEnum
)
from app.models import Worker, User
from app.schemas.training import (
    TrainingCourseCreate, TrainingCourseUpdate,
    TrainingSessionCreate, TrainingSessionUpdate,
    TrainingEnrollmentCreate, TrainingEnrollmentUpdate,
    SessionAttendanceCreate, SessionAttendanceUpdate,
    TrainingEvaluationCreate, TrainingEvaluationUpdate,
    TrainingCertificateCreate, TrainingCertificateUpdate,
    TrainingRequirementCreate, TrainingRequirementUpdate,
    TrainingBudgetCreate, TrainingBudgetUpdate
)

# Training Course CRUD
class TrainingCourseCRUD:
    def create(self, db: Session, obj_in: TrainingCourseCreate, created_by: int = None) -> TrainingCourse:
        """إنشاء دورة تدريبية جديدة"""
        db_obj = TrainingCourse(
            **obj_in.dict(),
            created_by=created_by
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db: Session, course_id: int) -> Optional[TrainingCourse]:
        """الحصول على دورة تدريبية بالمعرف"""
        return db.query(TrainingCourse).options(
            joinedload(TrainingCourse.enrollments),
            joinedload(TrainingCourse.sessions),
            joinedload(TrainingCourse.evaluations)
        ).filter(TrainingCourse.id == course_id).first()

    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None,
        training_type: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[TrainingCourse]:
        """الحصول على قائمة الدورات التدريبية مع فلاتر"""
        query = db.query(TrainingCourse)
        
        if status:
            query = query.filter(TrainingCourse.status == status)
        if training_type:
            query = query.filter(TrainingCourse.training_type == training_type)
        if start_date:
            query = query.filter(TrainingCourse.start_date >= start_date)
        if end_date:
            query = query.filter(TrainingCourse.end_date <= end_date)
            
        return query.order_by(desc(TrainingCourse.start_date)).offset(skip).limit(limit).all()

    def update(self, db: Session, course_id: int, obj_in: TrainingCourseUpdate) -> TrainingCourse:
        """تحديث دورة تدريبية"""
        db_obj = self.get(db, course_id)
        if db_obj:
            update_data = obj_in.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_obj, field, value)
            db_obj.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, course_id: int) -> bool:
        """حذف دورة تدريبية"""
        db_obj = self.get(db, course_id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
            return True
        return False

    def get_upcoming_courses(self, db: Session, limit: int = 10) -> List[TrainingCourse]:
        """الحصول على الدورات القادمة"""
        return db.query(TrainingCourse).filter(
            TrainingCourse.start_date > datetime.utcnow(),
            TrainingCourse.status.in_(['planned', 'active'])
        ).order_by(asc(TrainingCourse.start_date)).limit(limit).all()

    def get_course_statistics(self, db: Session, course_id: int) -> Dict[str, Any]:
        """إحصائيات دورة تدريبية محددة"""
        course = self.get(db, course_id)
        if not course:
            return {}

        # عدد المشتركين
        enrolled_count = db.query(func.count()).select_from(training_enrollments).filter(
            training_enrollments.c.training_id == course_id
        ).scalar()

        # عدد المكملين
        completed_count = db.query(func.count()).select_from(training_enrollments).filter(
            training_enrollments.c.training_id == course_id,
            training_enrollments.c.completion_status == 'completed'
        ).scalar()

        # متوسط التقييم
        avg_rating = db.query(func.avg(TrainingEvaluation.overall_rating)).filter(
            TrainingEvaluation.course_id == course_id
        ).scalar()

        return {
            "enrolled_count": enrolled_count or 0,
            "completed_count": completed_count or 0,
            "completion_rate": (completed_count / enrolled_count * 100) if enrolled_count > 0 else 0,
            "average_rating": float(avg_rating) if avg_rating else 0,
            "available_spots": course.max_participants - (enrolled_count or 0)
        }

# Training Session CRUD
class TrainingSessionCRUD:
    def create(self, db: Session, obj_in: TrainingSessionCreate) -> TrainingSession:
        """إنشاء جلسة تدريبية"""
        db_obj = TrainingSession(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db: Session, session_id: int) -> Optional[TrainingSession]:
        """الحصول على جلسة تدريبية"""
        return db.query(TrainingSession).options(
            joinedload(TrainingSession.course),
            joinedload(TrainingSession.attendance_records)
        ).filter(TrainingSession.id == session_id).first()

    def get_by_course(self, db: Session, course_id: int) -> List[TrainingSession]:
        """الحصول على جلسات دورة معينة"""
        return db.query(TrainingSession).filter(
            TrainingSession.course_id == course_id
        ).order_by(asc(TrainingSession.session_number)).all()

    def update(self, db: Session, session_id: int, obj_in: TrainingSessionUpdate) -> TrainingSession:
        """تحديث جلسة تدريبية"""
        db_obj = self.get(db, session_id)
        if db_obj:
            update_data = obj_in.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_obj, field, value)
            db_obj.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_obj)
        return db_obj

    def mark_completed(self, db: Session, session_id: int, notes: str = None) -> TrainingSession:
        """تمييز الجلسة كمكتملة"""
        return self.update(db, session_id, TrainingSessionUpdate(completed=True, notes=notes))

# Training Enrollment CRUD
class TrainingEnrollmentCRUD:
    def enroll_worker(self, db: Session, course_id: int, worker_id: int, notes: str = None):
        """تسجيل عامل في دورة"""
        # التحقق من عدم التسجيل المسبق
        existing = db.execute(
            training_enrollments.select().where(
                and_(
                    training_enrollments.c.training_id == course_id,
                    training_enrollments.c.worker_id == worker_id
                )
            )
        ).first()
        
        if existing:
            return False, "العامل مسجل بالفعل في هذه الدورة"

        # التحقق من وجود أماكن متاحة
        course = db.query(TrainingCourse).filter(TrainingCourse.id == course_id).first()
        if not course:
            return False, "الدورة غير موجودة"

        enrolled_count = db.query(func.count()).select_from(training_enrollments).filter(
            training_enrollments.c.training_id == course_id
        ).scalar()

        if enrolled_count >= course.max_participants:
            return False, "لا توجد أماكن متاحة في الدورة"

        # التسجيل
        enrollment_data = {
            'training_id': course_id,
            'worker_id': worker_id,
            'enrollment_date': datetime.utcnow(),
            'completion_status': 'enrolled',
            'notes': notes
        }
        
        db.execute(training_enrollments.insert().values(**enrollment_data))
        db.commit()
        return True, "تم التسجيل بنجاح"

    def get_worker_enrollments(self, db: Session, worker_id: int) -> List[Dict]:
        """الحصول على تسجيلات عامل"""
        query = db.query(
            training_enrollments,
            TrainingCourse
        ).join(
            TrainingCourse, 
            training_enrollments.c.training_id == TrainingCourse.id
        ).filter(
            training_enrollments.c.worker_id == worker_id
        )
        return query.all()

    def get_course_enrollments(self, db: Session, course_id: int) -> List[Dict]:
        """الحصول على مسجلي دورة"""
        query = db.query(
            training_enrollments,
            Worker
        ).join(
            Worker,
            training_enrollments.c.worker_id == Worker.id
        ).filter(
            training_enrollments.c.training_id == course_id
        )
        return query.all()

    def update_enrollment(
        self, 
        db: Session, 
        course_id: int, 
        worker_id: int, 
        obj_in: TrainingEnrollmentUpdate
    ):
        """تحديث حالة التسجيل"""
        update_data = obj_in.dict(exclude_unset=True)
        db.execute(
            training_enrollments.update().where(
                and_(
                    training_enrollments.c.training_id == course_id,
                    training_enrollments.c.worker_id == worker_id
                )
            ).values(**update_data)
        )
        db.commit()
        return True

# Session Attendance CRUD
class SessionAttendanceCRUD:
    def record_attendance(self, db: Session, obj_in: SessionAttendanceCreate, recorded_by: int = None) -> SessionAttendance:
        """تسجيل حضور جلسة"""
        db_obj = SessionAttendance(
            **obj_in.dict(),
            recorded_by=recorded_by
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_session_attendance(self, db: Session, session_id: int) -> List[SessionAttendance]:
        """الحصول على حضور جلسة"""
        return db.query(SessionAttendance).options(
            joinedload(SessionAttendance.worker)
        ).filter(SessionAttendance.session_id == session_id).all()

    def get_worker_attendance(self, db: Session, worker_id: int, course_id: int = None) -> List[SessionAttendance]:
        """الحصول على حضور عامل"""
        query = db.query(SessionAttendance).filter(SessionAttendance.worker_id == worker_id)
        
        if course_id:
            query = query.join(TrainingSession).filter(TrainingSession.course_id == course_id)
            
        return query.all()

    def bulk_record_attendance(self, db: Session, session_id: int, attendance_data: List[Dict], recorded_by: int = None):
        """تسجيل حضور جماعي"""
        attendance_records = []
        for data in attendance_data:
            attendance_records.append(SessionAttendance(
                session_id=session_id,
                recorded_by=recorded_by,
                **data
            ))
        
        db.add_all(attendance_records)
        db.commit()
        return attendance_records

# Training Evaluation CRUD
class TrainingEvaluationCRUD:
    def create(self, db: Session, obj_in: TrainingEvaluationCreate) -> TrainingEvaluation:
        """إنشاء تقييم دورة"""
        # حساب نسبة التحسن
        improvement = None
        if obj_in.pre_test_score and obj_in.post_test_score:
            improvement = ((obj_in.post_test_score - obj_in.pre_test_score) / obj_in.pre_test_score) * 100

        db_obj = TrainingEvaluation(
            **obj_in.dict(),
            improvement_percentage=improvement
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_course_evaluations(self, db: Session, course_id: int) -> List[TrainingEvaluation]:
        """الحصول على تقييمات دورة"""
        return db.query(TrainingEvaluation).options(
            joinedload(TrainingEvaluation.worker)
        ).filter(TrainingEvaluation.course_id == course_id).all()

    def get_evaluation_summary(self, db: Session, course_id: int) -> Dict[str, Any]:
        """ملخص تقييمات دورة"""
        evaluations = self.get_course_evaluations(db, course_id)
        
        if not evaluations:
            return {}

        total = len(evaluations)
        return {
            "total_evaluations": total,
            "average_content_rating": sum(e.content_rating for e in evaluations if e.content_rating) / total,
            "average_instructor_rating": sum(e.instructor_rating for e in evaluations if e.instructor_rating) / total,
            "average_organization_rating": sum(e.organization_rating for e in evaluations if e.organization_rating) / total,
            "average_overall_rating": sum(e.overall_rating for e in evaluations if e.overall_rating) / total,
            "recommendation_rate": sum(1 for e in evaluations if e.would_recommend) / total * 100,
            "average_improvement": sum(e.improvement_percentage for e in evaluations if e.improvement_percentage) / total
        }

# Training Certificate CRUD
class TrainingCertificateCRUD:
    def create(self, db: Session, obj_in: TrainingCertificateCreate, issued_by: int = None) -> TrainingCertificate:
        """إصدار شهادة تدريب"""
        verification_code = f"CERT-{obj_in.course_id}-{obj_in.worker_id}-{datetime.now().strftime('%Y%m%d')}"
        
        db_obj = TrainingCertificate(
            **obj_in.dict(),
            issued_by=issued_by,
            verification_code=verification_code
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_worker_certificates(self, db: Session, worker_id: int) -> List[TrainingCertificate]:
        """الحصول على شهادات عامل"""
        return db.query(TrainingCertificate).options(
            joinedload(TrainingCertificate.course)
        ).filter(TrainingCertificate.worker_id == worker_id).all()

    def get_expiring_certificates(self, db: Session, days: int = 30) -> List[TrainingCertificate]:
        """الحصول على الشهادات المنتهية الصلاحية قريباً"""
        expiry_date = date.today() + timedelta(days=days)
        return db.query(TrainingCertificate).filter(
            TrainingCertificate.expiry_date <= expiry_date,
            TrainingCertificate.status == 'valid'
        ).all()

    def verify_certificate(self, db: Session, verification_code: str) -> Optional[TrainingCertificate]:
        """التحقق من صحة شهادة"""
        return db.query(TrainingCertificate).filter(
            TrainingCertificate.verification_code == verification_code,
            TrainingCertificate.status == 'valid'
        ).first()

# Training Requirement CRUD
class TrainingRequirementCRUD:
    def create(self, db: Session, obj_in: TrainingRequirementCreate) -> TrainingRequirement:
        """إنشاء متطلب تدريبي"""
        db_obj = TrainingRequirement(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_job_title(self, db: Session, job_title: str) -> List[TrainingRequirement]:
        """الحصول على متطلبات وظيفة"""
        return db.query(TrainingRequirement).filter(
            TrainingRequirement.job_title == job_title
        ).all()

    def check_compliance(self, db: Session, worker_id: int) -> Dict[str, Any]:
        """فحص امتثال عامل للمتطلبات التدريبية"""
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if not worker:
            return {}

        requirements = self.get_by_job_title(db, worker.job_title)
        compliance_status = []

        for req in requirements:
            # البحث عن الدورات المكتملة من نفس النوع
            completed_courses = db.query(TrainingCertificate).join(TrainingCourse).filter(
                TrainingCertificate.worker_id == worker_id,
                TrainingCourse.training_type == req.training_type,
                TrainingCertificate.status == 'valid'
            ).all()

            is_compliant = len(completed_courses) > 0
            next_due_date = None

            if req.renewal_period_months and completed_courses:
                latest_cert = max(completed_courses, key=lambda x: x.issue_date)
                next_due_date = latest_cert.issue_date + timedelta(days=req.renewal_period_months * 30)
                is_compliant = next_due_date > date.today()

            compliance_status.append({
                "requirement": req,
                "is_compliant": is_compliant,
                "completed_courses": len(completed_courses),
                "next_due_date": next_due_date
            })

        return {
            "worker_id": worker_id,
            "job_title": worker.job_title,
            "compliance_status": compliance_status,
            "overall_compliance": all(status["is_compliant"] for status in compliance_status)
        }

# Training Budget CRUD
class TrainingBudgetCRUD:
    def create(self, db: Session, obj_in: TrainingBudgetCreate) -> TrainingBudget:
        """إنشاء ميزانية تدريب"""
        db_obj = TrainingBudget(
            **obj_in.dict(),
            remaining_budget=obj_in.allocated_budget
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_spent_budget(self, db: Session, budget_id: int, amount: Decimal) -> TrainingBudget:
        """تحديث الميزانية المصروفة"""
        db_obj = db.query(TrainingBudget).filter(TrainingBudget.id == budget_id).first()
        if db_obj:
            db_obj.spent_budget += amount
            db_obj.remaining_budget = db_obj.allocated_budget - db_obj.spent_budget
            db_obj.last_updated = datetime.utcnow()
            db.commit()
            db.refresh(db_obj)
        return db_obj

    def get_current_year_budget(self, db: Session, department: str = None) -> List[TrainingBudget]:
        """الحصول على ميزانية السنة الحالية"""
        current_year = datetime.now().year
        query = db.query(TrainingBudget).filter(TrainingBudget.year == current_year)
        
        if department:
            query = query.filter(TrainingBudget.department == department)
            
        return query.all()

# إنشاء instances للاستخدام
training_course_crud = TrainingCourseCRUD()
training_session_crud = TrainingSessionCRUD()
training_enrollment_crud = TrainingEnrollmentCRUD()
session_attendance_crud = SessionAttendanceCRUD()
training_evaluation_crud = TrainingEvaluationCRUD()
training_certificate_crud = TrainingCertificateCRUD()
training_requirement_crud = TrainingRequirementCRUD()
training_budget_crud = TrainingBudgetCRUD()
