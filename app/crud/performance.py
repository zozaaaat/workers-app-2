# Performance Evaluation CRUD Operations

from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from typing import List, Optional
from datetime import datetime, timedelta

from app.models_performance import (
    PerformanceEvaluation, 
    EvaluationCriteria, 
    PerformanceGoal, 
    PerformancePlan,
    DevelopmentAction,
    EvaluationStatus,
    EvaluationPeriod
)
from app.schemas.performance import (
    PerformanceEvaluationCreate,
    PerformanceEvaluationUpdate,
    EvaluationCriteriaCreate,
    PerformanceGoalCreate,
    PerformancePlanCreate
)

class PerformanceCRUD:
    
    # === تقييمات الأداء ===
    
    def create_evaluation(
        self, 
        db: Session, 
        evaluation: PerformanceEvaluationCreate,
        evaluator_id: int
    ) -> PerformanceEvaluation:
        """إنشاء تقييم أداء جديد"""
        
        # إنشاء التقييم الأساسي
        db_evaluation = PerformanceEvaluation(
            worker_id=evaluation.worker_id,
            evaluator_id=evaluator_id,
            evaluation_period=evaluation.evaluation_period,
            period_start=evaluation.period_start,
            period_end=evaluation.period_end,
            evaluator_comments=evaluation.evaluator_comments,
            worker_comments=evaluation.worker_comments,
            manager_comments=evaluation.manager_comments,
            status=EvaluationStatus.DRAFT
        )
        
        db.add(db_evaluation)
        db.flush()  # للحصول على ID
        
        # إضافة معايير التقييم
        total_weighted_score = 0.0
        total_weight = 0.0
        
        for criteria in evaluation.criteria:
            weighted_score = criteria.score * criteria.weight
            total_weighted_score += weighted_score
            total_weight += criteria.weight
            
            db_criteria = EvaluationCriteria(
                evaluation_id=db_evaluation.id,
                criteria_name=criteria.criteria_name,
                criteria_description=criteria.criteria_description,
                weight=criteria.weight,
                score=criteria.score,
                max_score=criteria.max_score,
                weighted_score=weighted_score,
                comments=criteria.comments,
                improvement_notes=criteria.improvement_notes
            )
            db.add(db_criteria)
        
        # حساب النتيجة الإجمالية
        if total_weight > 0:
            overall_score = (total_weighted_score / total_weight) * 20  # تحويل إلى مقياس 100
            db_evaluation.overall_score = overall_score
            db_evaluation.overall_rating = self._get_rating_from_score(overall_score)
        
        # إضافة الأهداف
        for goal in evaluation.goals:
            db_goal = PerformanceGoal(
                evaluation_id=db_evaluation.id,
                worker_id=goal.worker_id,
                goal_title=goal.goal_title,
                goal_description=goal.goal_description,
                target_value=goal.target_value,
                actual_value=goal.actual_value,
                target_date=goal.target_date,
                achievement_percentage=goal.achievement_percentage,
                progress_notes=goal.progress_notes,
                challenges_faced=goal.challenges_faced,
                is_achieved=goal.achievement_percentage >= 100.0
            )
            db.add(db_goal)
        
        db.commit()
        db.refresh(db_evaluation)
        return db_evaluation
    
    def get_evaluation(self, db: Session, evaluation_id: int) -> Optional[PerformanceEvaluation]:
        """الحصول على تقييم محدد"""
        return db.query(PerformanceEvaluation).filter(
            PerformanceEvaluation.id == evaluation_id
        ).first()
    
    def get_evaluations(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        worker_id: Optional[int] = None,
        evaluator_id: Optional[int] = None,
        status: Optional[EvaluationStatus] = None
    ) -> List[PerformanceEvaluation]:
        """الحصول على قائمة التقييمات مع فلاتر"""
        
        query = db.query(PerformanceEvaluation)
        
        if worker_id:
            query = query.filter(PerformanceEvaluation.worker_id == worker_id)
        if evaluator_id:
            query = query.filter(PerformanceEvaluation.evaluator_id == evaluator_id)
        if status:
            query = query.filter(PerformanceEvaluation.status == status)
        
        return query.order_by(desc(PerformanceEvaluation.created_at)).offset(skip).limit(limit).all()
    
    def update_evaluation(
        self, 
        db: Session, 
        evaluation_id: int, 
        evaluation_update: PerformanceEvaluationUpdate
    ) -> Optional[PerformanceEvaluation]:
        """تحديث تقييم الأداء"""
        
        db_evaluation = self.get_evaluation(db, evaluation_id)
        if not db_evaluation:
            return None
        
        update_data = evaluation_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_evaluation, field, value)
        
        # إذا تم تغيير الحالة إلى مكتمل
        if evaluation_update.status == EvaluationStatus.COMPLETED and not db_evaluation.completed_at:
            db_evaluation.completed_at = datetime.utcnow()
        
        # إذا تم اعتماد التقييم
        if evaluation_update.status == EvaluationStatus.APPROVED and not db_evaluation.approved_at:
            db_evaluation.approved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_evaluation)
        return db_evaluation
    
    def delete_evaluation(self, db: Session, evaluation_id: int) -> bool:
        """حذف تقييم الأداء"""
        
        db_evaluation = self.get_evaluation(db, evaluation_id)
        if not db_evaluation:
            return False
        
        # حذف المعايير والأهداف المرتبطة
        db.query(EvaluationCriteria).filter(
            EvaluationCriteria.evaluation_id == evaluation_id
        ).delete()
        
        db.query(PerformanceGoal).filter(
            PerformanceGoal.evaluation_id == evaluation_id
        ).delete()
        
        db.delete(db_evaluation)
        db.commit()
        return True
    
    # === خطط التطوير ===
    
    def create_development_plan(
        self, 
        db: Session, 
        plan: PerformancePlanCreate
    ) -> PerformancePlan:
        """إنشاء خطة تطوير الأداء"""
        
        db_plan = PerformancePlan(
            worker_id=plan.worker_id,
            evaluation_id=plan.evaluation_id,
            plan_title=plan.plan_title,
            plan_description=plan.plan_description,
            target_completion_date=plan.target_completion_date,
            required_skills=plan.required_skills,
            recommended_training=plan.recommended_training,
            success_metrics=plan.success_metrics
        )
        
        db.add(db_plan)
        db.flush()
        
        # إضافة إجراءات التطوير
        for action in plan.actions:
            db_action = DevelopmentAction(
                plan_id=db_plan.id,
                action_title=action.action_title,
                action_description=action.action_description,
                action_type=action.action_type,
                due_date=action.due_date,
                resources_needed=action.resources_needed,
                cost_estimate=action.cost_estimate,
                notes=action.notes
            )
            db.add(db_action)
        
        db.commit()
        db.refresh(db_plan)
        return db_plan
    
    def get_development_plans(
        self, 
        db: Session, 
        worker_id: Optional[int] = None,
        is_active: bool = True
    ) -> List[PerformancePlan]:
        """الحصول على خطط التطوير"""
        
        query = db.query(PerformancePlan)
        
        if worker_id:
            query = query.filter(PerformancePlan.worker_id == worker_id)
        if is_active is not None:
            query = query.filter(PerformancePlan.is_active == is_active)
        
        return query.order_by(desc(PerformancePlan.start_date)).all()
    
    # === التقارير والإحصائيات ===
    
    def get_performance_summary(self, db: Session) -> dict:
        """ملخص إحصائيات الأداء"""
        
        total_evaluations = db.query(PerformanceEvaluation).count()
        completed_evaluations = db.query(PerformanceEvaluation).filter(
            PerformanceEvaluation.status == EvaluationStatus.COMPLETED
        ).count()
        
        pending_evaluations = db.query(PerformanceEvaluation).filter(
            PerformanceEvaluation.status.in_([EvaluationStatus.DRAFT, EvaluationStatus.IN_PROGRESS])
        ).count()
        
        # متوسط الدرجات
        avg_score = db.query(func.avg(PerformanceEvaluation.overall_score)).filter(
            PerformanceEvaluation.status == EvaluationStatus.COMPLETED
        ).scalar() or 0.0
        
        # أفضل الموظفين (آخر 3 أشهر)
        three_months_ago = datetime.utcnow() - timedelta(days=90)
        top_performers = db.query(PerformanceEvaluation).filter(
            and_(
                PerformanceEvaluation.status == EvaluationStatus.COMPLETED,
                PerformanceEvaluation.completed_at >= three_months_ago,
                PerformanceEvaluation.overall_score >= 80.0
            )
        ).order_by(desc(PerformanceEvaluation.overall_score)).limit(5).all()
        
        # الموظفين المحتاجين للتحسين
        improvement_needed = db.query(PerformanceEvaluation).filter(
            and_(
                PerformanceEvaluation.status == EvaluationStatus.COMPLETED,
                PerformanceEvaluation.completed_at >= three_months_ago,
                PerformanceEvaluation.overall_score < 60.0
            )
        ).order_by(PerformanceEvaluation.overall_score).limit(5).all()
        
        return {
            "total_evaluations": total_evaluations,
            "completed_evaluations": completed_evaluations,
            "pending_evaluations": pending_evaluations,
            "average_score": round(avg_score, 2),
            "top_performers": [
                {
                    "worker_id": eval.worker_id,
                    "score": eval.overall_score,
                    "rating": eval.overall_rating,
                    "date": eval.completed_at
                } for eval in top_performers
            ],
            "improvement_needed": [
                {
                    "worker_id": eval.worker_id,
                    "score": eval.overall_score,
                    "rating": eval.overall_rating,
                    "date": eval.completed_at
                } for eval in improvement_needed
            ]
        }
    
    def get_worker_performance_history(self, db: Session, worker_id: int) -> dict:
        """تاريخ أداء العامل"""
        
        evaluations = db.query(PerformanceEvaluation).filter(
            and_(
                PerformanceEvaluation.worker_id == worker_id,
                PerformanceEvaluation.status == EvaluationStatus.COMPLETED
            )
        ).order_by(PerformanceEvaluation.completed_at).all()
        
        if not evaluations:
            return {
                "worker_id": worker_id,
                "total_evaluations": 0,
                "average_score": 0.0,
                "performance_trend": "غير متوفر",
                "evaluations_history": []
            }
        
        # حساب الاتجاه
        if len(evaluations) >= 2:
            recent_scores = [eval.overall_score for eval in evaluations[-3:]]
            if len(recent_scores) >= 2:
                if recent_scores[-1] > recent_scores[0]:
                    trend = "تحسن"
                elif recent_scores[-1] < recent_scores[0]:
                    trend = "تراجع"
                else:
                    trend = "ثابت"
            else:
                trend = "غير محدد"
        else:
            trend = "غير محدد"
        
        avg_score = sum(eval.overall_score for eval in evaluations) / len(evaluations)
        
        return {
            "worker_id": worker_id,
            "total_evaluations": len(evaluations),
            "average_score": round(avg_score, 2),
            "performance_trend": trend,
            "latest_score": evaluations[-1].overall_score if evaluations else 0.0,
            "latest_date": evaluations[-1].completed_at if evaluations else None,
            "evaluations_history": [
                {
                    "id": eval.id,
                    "score": eval.overall_score,
                    "rating": eval.overall_rating,
                    "period": eval.evaluation_period,
                    "date": eval.completed_at
                } for eval in evaluations
            ]
        }
    
    # === المساعدات ===
    
    def _get_rating_from_score(self, score: float) -> str:
        """تحويل الدرجة إلى تقدير نصي"""
        if score >= 90:
            return "ممتاز"
        elif score >= 80:
            return "جيد جداً"
        elif score >= 70:
            return "جيد"
        elif score >= 60:
            return "مقبول"
        else:
            return "ضعيف"

# إنشاء instance
performance_crud = PerformanceCRUD()
