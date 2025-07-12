from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertUpdate, AlertResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب جميع التنبيهات"""
    alerts = db.query(Alert).offset(skip).limit(limit).all()
    return alerts

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب تنبيه بالمعرف"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="التنبيه غير موجود")
    return alert

@router.post("/", response_model=AlertResponse)
def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """إنشاء تنبيه جديد"""
    db_alert = Alert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    alert_update: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """تحديث تنبيه"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="التنبيه غير موجود")
    
    for field, value in alert_update.dict(exclude_unset=True).items():
        setattr(alert, field, value)
    
    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف تنبيه"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="التنبيه غير موجود")
    
    db.delete(alert)
    db.commit()
    return {"message": "تم حذف التنبيه بنجاح"}

@router.put("/{alert_id}/read")
def mark_alert_as_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """تحديد التنبيه كمقروء"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="التنبيه غير موجود")
    
    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return alert

@router.get("/unread/count")
def get_unread_alerts_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب عدد التنبيهات غير المقروءة"""
    count = db.query(Alert).filter(Alert.is_read == False).count()
    return {"unread_count": count}
