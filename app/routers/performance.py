# Performance Evaluation API Routes

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db

router = APIRouter(prefix="/performance", tags=["Performance Evaluation"])

@router.get("/")
def get_performance_overview():
    """نظرة عامة على نظام تقييم الأداء"""
    return {
        "message": "نظام تقييم الأداء يعمل بشكل صحيح",
        "version": "1.0",
        "features": [
            "تقييمات الأداء",
            "أهداف الأداء", 
            "خطط التطوير",
            "التقارير والإحصائيات"
        ]
    }

@router.get("/test")
def test_performance_endpoint():
    """اختبار endpoint"""
    return {"status": "working", "module": "performance"}

@router.get("/evaluations/")
def get_evaluations(db: Session = Depends(get_db)):
    """جلب قائمة التقييمات"""
    try:
        # Import here to avoid circular import issues
        from app.models_performance import PerformanceEvaluation
        evaluations = db.query(PerformanceEvaluation).all()
        return {
            "message": "evaluations endpoint working", 
            "count": len(evaluations),
            "data": [
                {
                    "id": eval.id,
                    "worker_id": eval.worker_id,
                    "overall_score": eval.overall_score,
                    "status": eval.status.value if eval.status else "unknown",
                    "created_at": eval.created_at.isoformat() if eval.created_at else None
                } for eval in evaluations
            ]
        }
    except Exception as e:
        return {"error": str(e), "message": "Error fetching evaluations"}

@router.get("/goals/")
def get_goals(db: Session = Depends(get_db)):
    """جلب قائمة الأهداف"""
    try:
        from app.models_performance import PerformanceGoal
        goals = db.query(PerformanceGoal).all()
        return {
            "message": "goals endpoint working", 
            "count": len(goals),
            "data": [
                {
                    "id": goal.id,
                    "worker_id": goal.worker_id,
                    "goal_title": goal.goal_title,
                    "achievement_percentage": goal.achievement_percentage,
                    "is_achieved": goal.is_achieved
                } for goal in goals
            ]
        }
    except Exception as e:
        return {"error": str(e), "message": "Error fetching goals"}

@router.get("/plans/")
def get_plans(db: Session = Depends(get_db)):
    """جلب قائمة خطط التطوير"""
    try:
        from app.models_performance import PerformancePlan
        plans = db.query(PerformancePlan).all()
        return {
            "message": "plans endpoint working", 
            "count": len(plans),
            "data": [
                {
                    "id": plan.id,
                    "worker_id": plan.worker_id,
                    "plan_title": plan.plan_title,
                    "completion_percentage": plan.completion_percentage,
                    "is_active": plan.is_active
                } for plan in plans
            ]
        }
    except Exception as e:
        return {"error": str(e), "message": "Error fetching plans"}

@router.get("/stats")
def get_performance_stats(db: Session = Depends(get_db)):
    """إحصائيات الأداء"""
    try:
        from app.models_performance import PerformanceEvaluation, PerformanceGoal
        
        total_evaluations = db.query(PerformanceEvaluation).count()
        completed_goals = db.query(PerformanceGoal).filter(PerformanceGoal.is_achieved == True).count()
        total_goals = db.query(PerformanceGoal).count()
        
        return {
            "total_evaluations": total_evaluations,
            "total_goals": total_goals,
            "completed_goals": completed_goals,
            "completion_rate": (completed_goals / total_goals * 100) if total_goals > 0 else 0
        }
    except Exception as e:
        return {"error": str(e), "message": "Error fetching stats"}
    """إنشاء تقييم أداء جديد"""
    
    # التحقق من الصلاحيات
    if current_user.role not in ["admin", "manager", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="غير مصرح لك بإنشاء تقييمات الأداء"
        )
    
    try:
        return performance_crud.create_evaluation(db, evaluation, current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في إنشاء التقييم: {str(e)}"
        )

@router.get("/evaluations/", response_model=List[PerformanceEvaluationResponse])
def get_evaluations(
    skip: int = 0,
    limit: int = 100,
    worker_id: Optional[int] = None,
    evaluator_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """الحصول على قائمة تقييمات الأداء"""
    
    # التحقق من الصلاحيات
    if current_user.role not in ["admin", "manager", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="غير مصرح لك بعرض تقييمات الأداء"
        )
    
    # تحويل النص إلى enum إذا تم توفيره
    status_enum = None
    if status:
        try:
            status_enum = EvaluationStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"حالة غير صالحة: {status}"
            )
    
    return performance_crud.get_evaluations(
        db, skip=skip, limit=limit, 
        worker_id=worker_id, 
        evaluator_id=evaluator_id, 
        status=status_enum
    )

@router.get("/evaluations/{evaluation_id}", response_model=PerformanceEvaluationResponse)
def get_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """الحصول على تقييم أداء محدد"""
    
    evaluation = performance_crud.get_evaluation(db, evaluation_id)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="التقييم غير موجود"
        )
    
    # التحقق من الصلاحيات - يمكن للعامل رؤية تقييمه الخاص
    if current_user.role not in ["admin", "manager", "hr"]:
        # التحقق من أن التقييم خاص بالمستخدم الحالي
        if hasattr(current_user, 'worker') and current_user.worker:
            if evaluation.worker_id != current_user.worker.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="غير مصرح لك بعرض هذا التقييم"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="غير مصرح لك بعرض تقييمات الأداء"
            )
    
    return evaluation

@router.put("/evaluations/{evaluation_id}", response_model=PerformanceEvaluationResponse)
def update_evaluation(
    evaluation_id: int,
    evaluation_update: PerformanceEvaluationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """تحديث تقييم الأداء"""
    
    # التحقق من الصلاحيات
    if current_user.role not in ["admin", "manager", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="غير مصرح لك بتحديث تقييمات الأداء"
        )
    
    evaluation = performance_crud.update_evaluation(db, evaluation_id, evaluation_update)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="التقييم غير موجود"
        )
    
    return evaluation

@router.delete("/evaluations/{evaluation_id}")
def delete_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف تقييم الأداء"""
    
    # التحقق من الصلاحيات - المدير فقط
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="غير مصرح لك بحذف تقييمات الأداء"
        )
    
    success = performance_crud.delete_evaluation(db, evaluation_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="التقييم غير موجود"
        )
    
    return {"message": "تم حذف التقييم بنجاح"}

# === خطط التطوير ===

@router.post("/development-plans/", response_model=PerformancePlanResponse)
def create_development_plan(
    plan: PerformancePlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """إنشاء خطة تطوير الأداء"""
    
    if current_user.role not in ["admin", "manager", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="غير مصرح لك بإنشاء خطط التطوير"
        )
    
    try:
        return performance_crud.create_development_plan(db, plan)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في إنشاء خطة التطوير: {str(e)}"
        )

@router.get("/development-plans/", response_model=List[PerformancePlanResponse])
def get_development_plans(
    worker_id: Optional[int] = None,
    is_active: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """الحصول على خطط التطوير"""
    
    if current_user.role not in ["admin", "manager", "hr"]:
        # للعامل: يمكنه رؤية خططه فقط
        if hasattr(current_user, 'worker') and current_user.worker:
            worker_id = current_user.worker.id
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="غير مصرح لك بعرض خطط التطوير"
            )
    
    return performance_crud.get_development_plans(db, worker_id, is_active)

# === التقارير والإحصائيات ===

@router.get("/reports/summary", response_model=PerformanceReportSummary)
def get_performance_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """تقرير ملخص الأداء العام"""
    
    if current_user.role not in ["admin", "manager", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="غير مصرح لك بعرض تقارير الأداء"
        )
    
    return performance_crud.get_performance_summary(db)

@router.get("/reports/worker/{worker_id}", response_model=WorkerPerformanceSummary)
def get_worker_performance_report(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """تقرير أداء عامل محدد"""
    
    # التحقق من الصلاحيات
    if current_user.role not in ["admin", "manager", "hr"]:
        # للعامل: يمكنه رؤية تقريره فقط
        if hasattr(current_user, 'worker') and current_user.worker:
            if worker_id != current_user.worker.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="غير مصرح لك بعرض تقرير هذا العامل"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="غير مصرح لك بعرض تقارير الأداء"
            )
    
    report = performance_crud.get_worker_performance_history(db, worker_id)
    
    return {
        "worker_id": worker_id,
        "worker_name": "اسم العامل",  # سيتم جلبه من قاعدة البيانات لاحقاً
        "latest_evaluation_score": report.get("latest_score"),
        "latest_evaluation_date": report.get("latest_date"),
        "total_evaluations": report["total_evaluations"],
        "average_score": report["average_score"],
        "performance_trend": report["performance_trend"],
        "active_goals": 0,  # سيتم حسابه لاحقاً
        "completed_goals": 0  # سيتم حسابه لاحقاً
    }

# === إجراءات خاصة ===

@router.post("/evaluations/{evaluation_id}/approve")
def approve_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """اعتماد تقييم الأداء"""
    
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="غير مصرح لك باعتماد التقييمات"
        )
    
    evaluation_update = PerformanceEvaluationUpdate(
        status=EvaluationStatus.APPROVED,
        approved_by=current_user.id
    )
    
    evaluation = performance_crud.update_evaluation(db, evaluation_id, evaluation_update)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="التقييم غير موجود"
        )
    
    return {"message": "تم اعتماد التقييم بنجاح"}

@router.post("/evaluations/{evaluation_id}/complete")
def complete_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """إكمال تقييم الأداء"""
    
    evaluation_update = PerformanceEvaluationUpdate(
        status=EvaluationStatus.COMPLETED
    )
    
    evaluation = performance_crud.update_evaluation(db, evaluation_id, evaluation_update)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="التقييم غير موجود"
        )
    
    return {"message": "تم إكمال التقييم بنجاح"}

# === قوالب التقييم ===

@router.get("/evaluation-templates")
def get_evaluation_templates():
    """الحصول على قوالب التقييم المعيارية"""
    
    templates = {
        "general_employee": {
            "name": "تقييم عام للموظفين",
            "criteria": [
                {
                    "criteria_name": "جودة العمل",
                    "criteria_description": "مستوى جودة الأعمال المنجزة",
                    "weight": 2.0,
                    "max_score": 5.0
                },
                {
                    "criteria_name": "الكمية والإنتاجية",
                    "criteria_description": "حجم العمل المنجز في الوقت المحدد",
                    "weight": 1.5,
                    "max_score": 5.0
                },
                {
                    "criteria_name": "الالتزام بالوقت",
                    "criteria_description": "الحضور والانضباط في مواعيد العمل",
                    "weight": 1.0,
                    "max_score": 5.0
                },
                {
                    "criteria_name": "التعاون والعمل الجماعي",
                    "criteria_description": "القدرة على العمل مع الفريق",
                    "weight": 1.5,
                    "max_score": 5.0
                },
                {
                    "criteria_name": "المبادرة والإبداع",
                    "criteria_description": "القدرة على المبادرة وإيجاد حلول إبداعية",
                    "weight": 1.0,
                    "max_score": 5.0
                }
            ]
        },
        "supervisor": {
            "name": "تقييم المشرفين والمدراء",
            "criteria": [
                {
                    "criteria_name": "مهارات القيادة",
                    "criteria_description": "القدرة على قيادة وتوجيه الفريق",
                    "weight": 2.5,
                    "max_score": 5.0
                },
                {
                    "criteria_name": "التخطيط والتنظيم",
                    "criteria_description": "القدرة على التخطيط وتنظيم العمل",
                    "weight": 2.0,
                    "max_score": 5.0
                },
                {
                    "criteria_name": "اتخاذ القرارات",
                    "criteria_description": "القدرة على اتخاذ قرارات صحيحة في الوقت المناسب",
                    "weight": 2.0,
                    "max_score": 5.0
                },
                {
                    "criteria_name": "التواصل والتفاعل",
                    "criteria_description": "مهارات التواصل مع الفريق والإدارة",
                    "weight": 1.5,
                    "max_score": 5.0
                },
                {
                    "criteria_name": "تطوير الموظفين",
                    "criteria_description": "الاهتمام بتطوير وتدريب أعضاء الفريق",
                    "weight": 1.0,
                    "max_score": 5.0
                }
            ]
        }
    }
    
    return templates
