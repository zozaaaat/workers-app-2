from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.schemas.notification import Notification, NotificationCreate
from app.crud import notifications as crud_notifications
from app.database import get_db
from typing import List, Optional, Any
from datetime import datetime
from app.main import manager
import json
import os

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.post("/", response_model=Notification)
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    notif = crud_notifications.create_notification(db, notification)
    # بث الإشعار الجديد عبر WebSocket
    try:
        import asyncio
        asyncio.create_task(manager.broadcast(json.dumps({
            "id": notif.id,
            "message": notif.message,
            "type": notif.type,
            "created_at": notif.created_at.isoformat(),
            "read": notif.read,
            "user_id": notif.user_id,
            "expires_at": notif.expires_at.isoformat() if notif.expires_at else None,
            "group_key": notif.group_key,
            "archived": notif.archived,
            "allowed_roles": notif.allowed_roles
        })))
    except Exception as e:
        print("WebSocket broadcast error:", e)
    return notif

@router.post("/{notification_id}/archive")
def archive_notification(notification_id: int, db: Session = Depends(get_db)):
    success = crud_notifications.archive_notification(db, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"ok": True}

@router.get("/", response_model=List[Notification])
def get_notifications(
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    archived: Optional[bool] = None,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    user_role: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud_notifications.get_notifications(db, user_id=user_id, skip=skip, limit=limit, archived=archived, start_date=start_date, end_date=end_date, user_role=user_role)

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    success = crud_notifications.delete_notification(db, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"ok": True}

@router.get("/grouped", response_model=Any)
def get_grouped_notifications(user_id: Optional[int] = None, days: int = 7, db: Session = Depends(get_db)):
    """
    جلب الإشعارات مجمعة حسب النوع والمستلم ونص الرسالة الأساسي والفترة الزمنية
    """
    return crud_notifications.get_grouped_notifications(db, user_id=user_id, days=days)

@router.post("/with-attachment", response_model=Notification)
def create_notification_with_attachment(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    file: UploadFile = File(None)
):
    attachment_path = None
    if file:
        upload_dir = "uploaded_files/notifications"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        attachment_path = file_path
    notif = crud_notifications.create_notification(db, notification, attachment=attachment_path)
    # بث WebSocket كما في create_notification العادي
    try:
        import asyncio
        import json
        from app.main import manager
        asyncio.create_task(manager.broadcast(json.dumps({
            "id": notif.id,
            "message": notif.message,
            "type": notif.type,
            "created_at": notif.created_at.isoformat(),
            "read": notif.read,
            "user_id": notif.user_id,
            "expires_at": notif.expires_at.isoformat() if notif.expires_at else None,
            "group_key": notif.group_key,
            "archived": notif.archived,
            "allowed_roles": notif.allowed_roles,
            "attachment": notif.attachment
        })))
    except Exception as e:
        print("WebSocket broadcast error:", e)
    return notif

@router.post("/{notification_id}/action")
def update_notification_action(notification_id: int, action_status: str, db: Session = Depends(get_db)):
    notif = crud_notifications.update_notification_action(db, notification_id, action_status)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found or not interactive")
    return notif
