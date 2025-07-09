from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.schemas.notification import NotificationCreate
from app.crud import notifications as crud_notifications
from app.database import SessionLocal
import json
import asyncio

# تجنب الاستيراد الدائري - سيتم تمرير manager كمعامل
manager = None

def set_manager(websocket_manager):
    """تعيين مدير الاتصالات WebSocket"""
    global manager
    manager = websocket_manager

async def add_notification(
    message: str,
    type: str = "info",
    user_id: int = None,
    expires_at: str = None,
    emoji: str = None,
    color: str = None,
    action_required: bool = False,
    db: Session = None
):
    """إضافة إشعار جديد وإرساله عبر WebSocket"""
    
    # إنشاء جلسة قاعدة بيانات إذا لم تكن موجودة
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        # إنشاء الإشعار
        notification_data = NotificationCreate(
            message=message,
            type=type,
            user_id=user_id,
            expires_at=expires_at,
            icon=emoji,
            color=color,
            action_required=action_required
        )
        
        # حفظ الإشعار في قاعدة البيانات
        notif = crud_notifications.create_notification(db, notification_data)
        
        # بث الإشعار عبر WebSocket
        websocket_data = {
            "id": notif.id,
            "message": notif.message,
            "type": notif.type,
            "created_at": notif.created_at.isoformat(),
            "read": notif.read,
            "user_id": notif.user_id,
            "expires_at": notif.expires_at.isoformat() if notif.expires_at else None,
            "icon": notif.icon,
            "color": notif.color,
            "action_required": notif.action_required
        }
        
        await manager.broadcast(json.dumps(websocket_data))
        
        return notif
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في إضافة الإشعار: {str(e)}")
    finally:
        if should_close:
            db.close()

def add_notification_sync(
    message: str,
    type: str = "info",
    user_id: int = None,
    expires_at: str = None,
    emoji: str = None,
    color: str = None,
    action_required: bool = False,
    db: Session = None
):
    """إضافة إشعار جديد (نسخة متزامنة)"""
    
    # إنشاء جلسة قاعدة بيانات إذا لم تكن موجودة
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        # إنشاء الإشعار
        notification_data = NotificationCreate(
            message=message,
            type=type,
            user_id=user_id,
            expires_at=expires_at,
            icon=emoji,
            color=color,
            action_required=action_required
        )
        
        # حفظ الإشعار في قاعدة البيانات
        notif = crud_notifications.create_notification(db, notification_data)
        
        return notif
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في إضافة الإشعار: {str(e)}")
    finally:
        if should_close:
            db.close()
