from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import Dict, List, Any

from app.database import get_db
from app.models import User, Worker, Company, License, Absence, ActivityLog
from app.routers.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard/public")
def get_public_dashboard_stats(db: Session = Depends(get_db)):
    """الحصول على إحصائيات أساسية عامة"""
    try:
        # إحصائيات أساسية
        total_workers = db.query(Worker).count()
        total_companies = db.query(Company).count()
        total_licenses = db.query(License).count()
        # بدلاً من is_active، نستخدم المعايير الأخرى
        active_workers = db.query(Worker).filter(Worker.work_permit_end > datetime.now()).count()
        
        return {
            "total_workers": total_workers,
            "total_companies": total_companies,
            "total_licenses": total_licenses,
            "active_workers": active_workers,
            "status": "public"
        }
    except Exception as e:
        return {
            "error": str(e),
            "total_workers": 0,
            "total_companies": 0,
            "total_licenses": 0,
            "active_workers": 0,
            "status": "error"
        }


@router.get("/dashboard")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على إحصائيات لوحة التحكم"""
    
    try:
        # التحقق من الصلاحية
        if current_user.role not in ["admin", "manager"]:
            raise HTTPException(status_code=403, detail="غير مصرح لك بعرض الإحصائيات")
        
        # إحصائيات أساسية
        total_workers = db.query(Worker).count()
        total_companies = db.query(Company).count()
        total_licenses = db.query(License).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        
        # إحصائيات العمال حسب النوع
        worker_types = db.query(
            Worker.worker_type,
            func.count(Worker.id).label('count')
        ).group_by(Worker.worker_type).all()
        
        # إحصائيات العمال حسب الجنسية
        nationalities = db.query(
            Worker.nationality,
            func.count(Worker.id).label('count')
        ).group_by(Worker.nationality).limit(10).all()
        
        # إحصائيات الغياب في آخر 30 يوم
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_absences = db.query(Absence).filter(
            Absence.start_date >= thirty_days_ago
        ).count()
        
        # إحصائيات النشاط اليومي
        today = datetime.now().date()
        today_activities = 0  # مبسط للآن
        
        # إحصائيات الرواتب (متوسط وإجمالي)
        salary_stats = db.query(
            func.avg(Worker.salary).label('avg_salary'),
            func.sum(Worker.salary).label('total_salary'),
            func.min(Worker.salary).label('min_salary'),
            func.max(Worker.salary).label('max_salary')
        ).first()
        
        return {
            "basic_stats": {
                "total_workers": total_workers,
                "total_companies": total_companies,
                "total_licenses": total_licenses,
                "active_users": active_users,
                "recent_absences": recent_absences,
                "today_activities": today_activities
            },
            "worker_types": [{"type": wt.worker_type, "count": wt.count} for wt in worker_types],
            "nationalities": [{"nationality": n.nationality, "count": n.count} for n in nationalities],
            "salary_stats": {
                "average": float(salary_stats.avg_salary) if salary_stats.avg_salary else 0,
                "total": float(salary_stats.total_salary) if salary_stats.total_salary else 0,
                "minimum": float(salary_stats.min_salary) if salary_stats.min_salary else 0,
                "maximum": float(salary_stats.max_salary) if salary_stats.max_salary else 0
            }
        }
    except Exception as e:
        return {"error": str(e), "basic_stats": {"total_workers": 0, "total_companies": 0, "total_licenses": 0}}


@router.get("/charts/workers-by-month")
def get_workers_by_month(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """إحصائيات العمال حسب الشهر"""
    
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بعرض الإحصائيات")
    
    # العمال المضافين في آخر 12 شهر
    twelve_months_ago = datetime.now() - timedelta(days=365)
    
    monthly_data = db.query(
        extract('year', Worker.hire_date).label('year'),
        extract('month', Worker.hire_date).label('month'),
        func.count(Worker.id).label('count')
    ).filter(
        Worker.hire_date >= twelve_months_ago
    ).group_by(
        extract('year', Worker.hire_date),
        extract('month', Worker.hire_date)
    ).order_by('year', 'month').all()
    
    return {
        "monthly_hires": [
            {
                "year": int(data.year),
                "month": int(data.month),
                "count": data.count,
                "month_name": datetime(int(data.year), int(data.month), 1).strftime("%B %Y")
            }
            for data in monthly_data
        ]
    }


@router.get("/charts/activities")
def get_activities_chart(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """إحصائيات الأنشطة اليومية"""
    
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بعرض الإحصائيات")
    
    start_date = datetime.now() - timedelta(days=days)
    
    daily_activities = db.query(
        func.date(ActivityLog.created_at).label('date'),
        func.count(ActivityLog.id).label('count')
    ).filter(
        ActivityLog.created_at >= start_date
    ).group_by(
        func.date(ActivityLog.created_at)
    ).order_by('date').all()
    
    return {
        "daily_activities": [
            {
                "date": str(activity.date),
                "count": activity.count
            }
            for activity in daily_activities
        ]
    }


@router.get("/performance")
def get_performance_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """مقاييس الأداء الرئيسية (KPIs)"""
    
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بعرض مقاييس الأداء")
    
    # حساب معدل الغياب
    total_workers = db.query(Worker).count()
    recent_absences = db.query(Absence).filter(
        Absence.start_date >= datetime.now() - timedelta(days=30)
    ).count()
    
    absence_rate = (recent_absences / total_workers * 100) if total_workers > 0 else 0
    
    # معدل النشاط (أنشطة المستخدمين)
    total_users = db.query(User).filter(User.is_active == 1).count()
    active_users_today = db.query(ActivityLog.user_id).filter(
        func.date(ActivityLog.created_at) == datetime.now().date()
    ).distinct().count()
    
    activity_rate = (active_users_today / total_users * 100) if total_users > 0 else 0
    
    # نمو العمال (مقارنة بالشهر الماضي)
    current_month_workers = db.query(Worker).filter(
        extract('month', Worker.hire_date) == datetime.now().month,
        extract('year', Worker.hire_date) == datetime.now().year
    ).count()
    
    last_month = datetime.now().replace(day=1) - timedelta(days=1)
    last_month_workers = db.query(Worker).filter(
        extract('month', Worker.hire_date) == last_month.month,
        extract('year', Worker.hire_date) == last_month.year
    ).count()
    
    growth_rate = ((current_month_workers - last_month_workers) / last_month_workers * 100) if last_month_workers > 0 else 0
    
    return {
        "kpis": {
            "absence_rate": round(absence_rate, 2),
            "activity_rate": round(activity_rate, 2),
            "growth_rate": round(growth_rate, 2),
            "total_workers": total_workers,
            "active_users": active_users_today,
            "new_workers_this_month": current_month_workers
        }
    }
