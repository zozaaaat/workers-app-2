# AI-Powered Analytics and Recommendations System (Simplified)
from typing import List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import random
from pydantic import BaseModel

from ..database import get_db
from ..models import Worker, Company, User
from ..utils.permissions import get_current_user

router = APIRouter(prefix="/ai", tags=["artificial-intelligence"])

# Pydantic Models
class WorkerPerformancePrediction(BaseModel):
    worker_id: int
    predicted_performance: float
    confidence_score: float
    factors: List[str]
    recommendations: List[str]

class AnomalyDetection(BaseModel):
    worker_id: int
    anomaly_score: float
    is_anomaly: bool
    detected_patterns: List[str]
    risk_level: str

class AIInsight(BaseModel):
    insight_type: str
    title: str
    description: str
    impact_score: float
    recommended_actions: List[str]
    affected_workers: List[int]

class StaffingRecommendation(BaseModel):
    department: str
    recommended_staff_count: int
    optimal_skill_mix: Dict[str, int]
    predicted_workload: float
    reasoning: str

# Simplified AI Service
class AIAnalyticsService:
    def __init__(self, db: Session):
        self.db = db
    
    def predict_worker_performance(self, worker_id: int) -> WorkerPerformancePrediction:
        """Simplified performance prediction"""
        # Mock prediction with realistic data
        performance = random.uniform(60, 95)
        confidence = random.uniform(0.7, 0.95)
        
        factors = ["attendance_rate", "skill_level", "experience"]
        recommendations = [
            "تحسين معدل الحضور",
            "توفير دورات تدريبية",
            "إعادة توزيع المهام"
        ]
        
        return WorkerPerformancePrediction(
            worker_id=worker_id,
            predicted_performance=performance,
            confidence_score=confidence,
            factors=factors,
            recommendations=recommendations[:2]
        )
    
    def detect_anomalies(self, worker_id: int) -> AnomalyDetection:
        """Simplified anomaly detection"""
        anomaly_score = random.uniform(0, 1)
        is_anomaly = anomaly_score > 0.7
        
        patterns = ["غياب متكرر", "تأخير في المهام", "انخفاض الإنتاجية"]
        risk_level = "high" if anomaly_score > 0.8 else "medium" if anomaly_score > 0.5 else "low"
        
        return AnomalyDetection(
            worker_id=worker_id,
            anomaly_score=anomaly_score,
            is_anomaly=is_anomaly,
            detected_patterns=patterns[:1] if is_anomaly else [],
            risk_level=risk_level
        )
    
    def generate_insights(self) -> List[AIInsight]:
        """Generate AI insights"""
        insights = [
            AIInsight(
                insight_type="productivity",
                title="تحسن الإنتاجية",
                description="ارتفاع إنتاجية الفريق بنسبة 15% هذا الشهر",
                impact_score=0.85,
                recommended_actions=["مكافأة الفريق", "توثيق أفضل الممارسات"],
                affected_workers=[1, 2, 3]
            ),
            AIInsight(
                insight_type="attendance",
                title="تحسن الحضور",
                description="انخفاض معدل الغياب بنسبة 20%",
                impact_score=0.75,
                recommended_actions=["تطبيق نظام حوافز", "مراجعة ساعات العمل"],
                affected_workers=[4, 5, 6]
            )
        ]
        return insights
    
    def recommend_staffing(self) -> List[StaffingRecommendation]:
        """Generate staffing recommendations"""
        recommendations = [
            StaffingRecommendation(
                department="التطوير",
                recommended_staff_count=8,
                optimal_skill_mix={"senior": 3, "junior": 5},
                predicted_workload=85.5,
                reasoning="زيادة متوقعة في المشاريع"
            ),
            StaffingRecommendation(
                department="التسويق",
                recommended_staff_count=5,
                optimal_skill_mix={"senior": 2, "junior": 3},
                predicted_workload=70.0,
                reasoning="حجم عمل مستقر"
            )
        ]
        return recommendations

# API Routes
@router.post("/train-models")
async def train_ai_models(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Simulate AI model training"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {"message": "تم تدريب النماذج بنجاح (محاكاة)", "status": "success"}

@router.get("/predict/performance/{worker_id}", response_model=WorkerPerformancePrediction)
async def predict_worker_performance(
    worker_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Predict worker performance"""
    # Check if worker exists
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="العامل غير موجود")
    
    ai_service = AIAnalyticsService(db)
    return ai_service.predict_worker_performance(worker_id)

@router.get("/detect/anomalies/{worker_id}", response_model=AnomalyDetection)
async def detect_worker_anomalies(
    worker_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Detect anomalies in worker behavior"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="العامل غير موجود")
    
    ai_service = AIAnalyticsService(db)
    return ai_service.detect_anomalies(worker_id)

@router.get("/insights", response_model=List[AIInsight])
async def get_ai_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated insights"""
    ai_service = AIAnalyticsService(db)
    return ai_service.generate_insights()

@router.get("/recommend/staffing", response_model=List[StaffingRecommendation])
async def get_staffing_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get staffing recommendations"""
    ai_service = AIAnalyticsService(db)
    return ai_service.recommend_staffing()

@router.get("/chatbot/query")
async def ai_chatbot_query(
    question: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Simple AI chatbot"""
    responses = {
        "حضور": "يمكنك عرض تقارير الحضور من قسم التقارير",
        "راتب": "معلومات الرواتب متاحة في قسم المالية",
        "إجازة": "يمكنك طلب إجازة من خلال نظام الطلبات",
        "أداء": "تقييم الأداء متاح في قسم التحليلات",
        "عامل": "يمكنك إدارة العمال من قسم العمال",
        "تقرير": "التقارير متاحة في قسم التحليلات"
    }
    
    response = "عذراً، لم أفهم سؤالك. يرجى إعادة صياغته."
    for keyword, answer in responses.items():
        if keyword in question:
            response = answer
            break
    
    return {
        "question": question,
        "answer": response,
        "suggestions": [
            "كيف يمكنني عرض تقرير الحضور؟",
            "ما هو معدل أداء العمال؟",
            "كيف أطلب إجازة؟",
            "كيف أضيف عامل جديد؟"
        ]
    }
