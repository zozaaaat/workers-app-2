from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db

router = APIRouter(prefix="/activity-log", tags=["ActivityLog"])

# نموذج بسيط مؤقت
class ActivityLogOut(dict):
    id: int
    user: str
    action: str
    entity: str
    entity_id: int
    timestamp: datetime


@router.get("/", response_model=List[dict])
def list_logs(db: Session = Depends(get_db)):
    # في انتظار ربطها بجدول فعلي. حالياً بيانات ثابتة للتجربة.
    return [
        {
            "id": 1,
            "user": "admin",
            "action": "create",
            "entity": "worker",
            "entity_id": 5,
            "timestamp": datetime.utcnow(),
        }
    ]
