from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # يمكن ربطها بمستخدم أو None للجميع
    type = Column(String, default="general")
    expires_at = Column(DateTime, nullable=True)  # تاريخ انتهاء صلاحية الإشعار
    group_key = Column(String, nullable=True, index=True)  # مفتاح التجميع الذكي
    archived = Column(Boolean, default=False, index=True)  # إشعار مؤرشف أم لا
    allowed_roles = Column(String, nullable=True)  # أدوار المستخدمين المسموح لهم برؤية الإشعار (CSV)
    attachment = Column(String, nullable=True)  # اسم أو مسار المرفق
    scheduled_at = Column(DateTime, nullable=True, index=True)  # وقت الجدولة
    sent = Column(Boolean, default=False, index=True)  # هل تم الإرسال فعليًا
    action_required = Column(String, nullable=True)  # نوع الإجراء المطلوب (مثلاً: confirm, approve, reject)
    action_status = Column(String, nullable=True)    # حالة الإجراء (مثلاً: pending, confirmed, rejected)
    icon = Column(String, nullable=True)   # رمز أو إيموجي
    color = Column(String, nullable=True)  # لون مخصص (hex أو اسم)

    def __repr__(self):
        return f"<Notification(id={self.id}, message={self.message})>"
