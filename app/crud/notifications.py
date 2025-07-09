from sqlalchemy.orm import Session
from app.models_notification import Notification
from app.schemas.notification import NotificationCreate
from datetime import datetime, timedelta
from sqlalchemy import func
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from app import config
import asyncio

# إنشاء إشعار جديد

def create_notification(db: Session, notification: NotificationCreate, attachment: str = None):
    db_notification = Notification(
        message=notification.message,
        type=notification.type,
        user_id=notification.user_id,
        expires_at=notification.expires_at or (datetime.utcnow() + timedelta(days=30)),
        allowed_roles=notification.allowed_roles,
        attachment=attachment,
        scheduled_at=getattr(notification, 'scheduled_at', None),
        sent=False if getattr(notification, 'scheduled_at', None) else True
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    # إذا لم يكن مجدولًا، أرسل فورًا (بريد/SMS/WebSocket)
    if not db_notification.scheduled_at:
        # إرسال بريد إلكتروني إذا كان الإشعار موجهاً لمستخدم
        if db_notification.user_id:
            user = db.query(__import__('app.models').models.User).filter_by(id=db_notification.user_id).first()
            if user and user.email:
                send_notification_email(
                    to_email=user.email,
                    subject="إشعار جديد في نظام العمال",
                    body=f"<b>رسالة الإشعار:</b><br>{db_notification.message}"
                )
        # إرسال بريد إلكتروني إذا كان الإشعار موجهاً لشركة
        if notification.type == "company" and hasattr(notification, "company_id"):
            company_model = __import__('app.models').models.Company
            company = db.query(company_model).filter_by(id=notification.company_id).first()
            if company and getattr(company, "email", None):
                send_notification_email(
                    to_email=company.email,
                    subject="إشعار جديد لشركتكم في نظام العمال",
                    body=f"<b>رسالة الإشعار:</b><br>{db_notification.message}"
                )
        # إرسال SMS إذا كان الإشعار موجهاً لعامل
        if db_notification.user_id:
            user = db.query(__import__('app.models').models.User).filter_by(id=db_notification.user_id).first()
            if user and hasattr(user, "phone") and user.phone:
                send_notification_sms(user.phone, db_notification.message)
        # إرسال SMS إذا كان الإشعار موجهاً لشركة
        if notification.type == "company" and hasattr(notification, "company_id"):
            company_model = __import__('app.models').models.Company
            company = db.query(company_model).filter_by(id=notification.company_id).first()
            if company and getattr(company, "phone", None):
                send_notification_sms(company.phone, db_notification.message)
    return db_notification

# جلب كل الإشعارات (مع إمكانية الفلترة)
def get_notifications(db: Session, user_id: int = None, skip: int = 0, limit: int = 100, archived: Optional[bool] = None, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, user_role: Optional[str] = None):
    query = db.query(Notification)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    if archived is not None:
        query = query.filter(Notification.archived == archived)
    if start_date:
        query = query.filter(Notification.created_at >= start_date)
    if end_date:
        query = query.filter(Notification.created_at <= end_date)
    if user_role:
        query = query.filter((Notification.allowed_roles == None) | (Notification.allowed_roles == "") | (Notification.allowed_roles.like(f"%{user_role}%")))
    return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

# حذف إشعار

def delete_notification(db: Session, notification_id: int):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        db.delete(notification)
        db.commit()
        return True
    return False

# أرشفة إشعار

def archive_notification(db: Session, notification_id: int):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.archived = True
        db.commit()
        return True
    return False

# حذف الإشعارات المنتهية

def delete_expired_notifications(db: Session):
    now = datetime.utcnow()
    db.query(Notification).filter(Notification.expires_at < now).delete()
    db.commit()

def get_grouped_notifications(db: Session, user_id: int = None, days: int = 7):
    """
    جلب الإشعارات مجمعة حسب النوع والمستلم ونص الرسالة الأساسي والفترة الزمنية
    """
    time_limit = datetime.utcnow() - timedelta(days=days)
    query = db.query(
        Notification.type,
        Notification.user_id,
        Notification.group_key,
        func.count(Notification.id).label("count"),
        func.max(Notification.created_at).label("last_created"),
        func.group_concat(Notification.id, ',').label("ids"),
        func.group_concat(Notification.message, '|||').label("messages")
    ).filter(Notification.created_at >= time_limit)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    query = query.group_by(Notification.type, Notification.user_id, Notification.group_key)
    results = query.order_by(func.max(Notification.created_at).desc()).all()
    # تحويل النصوص المجمعة إلى قوائم
    grouped = []
    for row in results:
        ids = [int(i) for i in row.ids.split(',')] if row.ids else []
        messages = row.messages.split('|||') if row.messages else []
        grouped.append({
            'type': row.type,
            'user_id': row.user_id,
            'group_key': row.group_key,
            'count': row.count,
            'last_created': row.last_created,
            'ids': ids,
            'messages': messages
        })
    return grouped

def send_notification_email(to_email: str, subject: str, body: str):
    msg = MIMEText(body, "html")
    msg["Subject"] = subject
    msg["From"] = config.SMTP_FROM
    msg["To"] = to_email
    try:
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.starttls()
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.sendmail(config.SMTP_FROM, [to_email], msg.as_string())
    except Exception as e:
        print("[EMAIL ERROR]", e)

def send_notification_sms(to_phone: str, body: str):
    # مثال: استخدام خدمة SMS افتراضية (يمكن استبدالها بمزود فعلي مثل Twilio أو SMSGateway)
    import requests
    try:
        resp = requests.post(
            "https://sms-provider.example.com/send",
            json={
                "api_key": config.SMS_API_KEY,
                "to": to_phone,
                "sender": config.SMS_SENDER,
                "message": body
            }, timeout=10
        )
        print("[SMS SENT]", to_phone, resp.status_code)
    except Exception as e:
        print("[SMS ERROR]", e)

def send_scheduled_notifications(db: Session):
    now = datetime.utcnow()
    notifs = db.query(Notification).filter(
        Notification.scheduled_at != None,
        Notification.sent == False,
        Notification.scheduled_at <= now
    ).all()
    for notif in notifs:
        # إرسال بريد إلكتروني إذا كان الإشعار موجهاً لمستخدم
        if notif.user_id:
            user = db.query(__import__('app.models').models.User).filter_by(id=notif.user_id).first()
            if user and user.email:
                send_notification_email(
                    to_email=user.email,
                    subject="إشعار جديد في نظام العمال",
                    body=f"<b>رسالة الإشعار:</b><br>{notif.message}"
                )
        # إرسال بريد إلكتروني إذا كان الإشعار موجهاً لشركة
        if notif.type == "company" and hasattr(notif, "company_id"):
            company_model = __import__('app.models').models.Company
            company = db.query(company_model).filter_by(id=notif.company_id).first()
            if company and getattr(company, "email", None):
                send_notification_email(
                    to_email=company.email,
                    subject="إشعار جديد لشركتكم في نظام العمال",
                    body=f"<b>رسالة الإشعار:</b><br>{notif.message}"
                )
        # إرسال SMS إذا كان الإشعار موجهاً لعامل
        if notif.user_id:
            user = db.query(__import__('app.models').models.User).filter_by(id=notif.user_id).first()
            if user and hasattr(user, "phone") and user.phone:
                send_notification_sms(user.phone, notif.message)
        # إرسال SMS إذا كان الإشعار موجهاً لشركة
        if notif.type == "company" and hasattr(notif, "company_id"):
            company_model = __import__('app.models').models.Company
            company = db.query(company_model).filter_by(id=notif.company_id).first()
            if company and getattr(company, "phone", None):
                send_notification_sms(company.phone, notif.message)
        notif.sent = True
    db.commit()

def update_notification_action(db: Session, notification_id: int, action_status: str):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif and notif.action_required:
        notif.action_status = action_status
        db.commit()
        return notif
    return None
