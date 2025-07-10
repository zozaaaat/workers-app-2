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
