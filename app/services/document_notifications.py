from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import company_documents
from app.api_notifications import add_notification
import asyncio
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DocumentExpiryNotificationService:
    """خدمة إرسال إشعارات انتهاء صلاحية المستندات"""
    
    def __init__(self):
        self.is_running = False
    
    async def check_and_send_notifications(self, db: Session):
        """فحص وإرسال إشعارات انتهاء الصلاحية"""
        try:
            logger.info("بدء فحص إشعارات انتهاء صلاحية المستندات")
            
            # جلب جميع التنبيهات
            alerts = company_documents.get_expiry_alerts(db)
            notifications_sent = 0
            
            for alert in alerts:
                # التحقق من المستند
                document = company_documents.get_company_document(db, alert.document_id)
                if not document:
                    continue
                
                should_send = False
                notification_type = ""
                
                # تحديد نوع الإشعار المطلوب
                if alert.alert_type == "6_months" and not document.notification_6_months:
                    should_send = True
                    notification_type = "6_months"
                elif alert.alert_type == "3_months" and not document.notification_3_months:
                    should_send = True
                    notification_type = "3_months"
                elif alert.alert_type == "1_month" and not document.notification_1_month:
                    should_send = True
                    notification_type = "1_month"
                elif alert.alert_type == "1_week" and not document.notification_1_week:
                    should_send = True
                    notification_type = "1_week"
                elif alert.alert_type == "expired":
                    should_send = True
                    notification_type = "expired"
                
                if should_send:
                    # تحديد رسالة ولون الإشعار
                    if alert.alert_type == "expired":
                        message = f"⚠️ تنبيه عاجل: انتهت صلاحية {self.get_document_type_ar(alert.document_type)} للشركة {alert.company_name}"
                        if alert.license_number:
                            message += f" (رقم: {alert.license_number})"
                        color = "#f44336"
                        emoji = "⚠️"
                        action_required = True
                    else:
                        days_text = f"{alert.days_remaining} يوم" if alert.days_remaining > 1 else "يوم واحد"
                        message = f"🔔 تنبيه: ستنتهي صلاحية {self.get_document_type_ar(alert.document_type)} للشركة {alert.company_name} خلال {days_text}"
                        if alert.license_number:
                            message += f" (رقم: {alert.license_number})"
                        
                        if alert.days_remaining <= 7:
                            color = "#f44336"
                            emoji = "🚨"
                        elif alert.days_remaining <= 30:
                            color = "#ff9800"
                            emoji = "⚠️"
                        else:
                            color = "#2196F3"
                            emoji = "🔔"
                        
                        action_required = alert.days_remaining <= 30
                    
                    # إرسال الإشعار
                    await add_notification(
                        message,
                        "warning" if alert.alert_type == "expired" else "info",
                        user_id=None,  # يمكن تحديد المستخدم المطلوب إشعاره
                        emoji=emoji,
                        color=color,
                        action_required=action_required
                    )
                    
                    # تحديث حالة الإشعار
                    if notification_type != "expired":
                        company_documents.mark_notification_sent(db, alert.document_id, notification_type)
                    
                    notifications_sent += 1
                    logger.info(f"تم إرسال إشعار لـ {alert.company_name} - {alert.document_type}")
            
            logger.info(f"تم إرسال {notifications_sent} إشعار انتهاء صلاحية")
            
        except Exception as e:
            logger.error(f"خطأ في خدمة إشعارات انتهاء الصلاحية: {e}")
    
    def get_document_type_ar(self, doc_type: str) -> str:
        """ترجمة نوع المستند إلى العربية"""
        types_map = {
            "commercial_license": "الرخصة التجارية",
            "import_license": "رخصة الاستيراد",
            "advertisement_license": "رخصة الإعلان",
            "health_certificate": "الشهادة الصحية",
            "fire_safety_certificate": "شهادة السلامة من الحريق",
            "environmental_permit": "التصريح البيئي",
            "labor_permit": "تصريح العمالة",
            "tax_certificate": "شهادة الضريبة",
            "other": "مستند آخر"
        }
        return types_map.get(doc_type, doc_type)
    
    async def start_periodic_check(self):
        """بدء الفحص الدوري للإشعارات"""
        if self.is_running:
            return
        
        self.is_running = True
        logger.info("بدء خدمة الفحص الدوري لإشعارات انتهاء الصلاحية")
        
        while self.is_running:
            try:
                # إنشاء جلسة قاعدة بيانات
                db = next(get_db())
                await self.check_and_send_notifications(db)
                db.close()
                
                # انتظار 24 ساعة قبل الفحص التالي
                await asyncio.sleep(24 * 60 * 60)  # 24 hours
                
            except Exception as e:
                logger.error(f"خطأ في الفحص الدوري: {e}")
                # انتظار ساعة واحدة في حالة الخطأ
                await asyncio.sleep(60 * 60)  # 1 hour
    
    def stop_periodic_check(self):
        """إيقاف الفحص الدوري"""
        self.is_running = False
        logger.info("تم إيقاف خدمة الفحص الدوري لإشعارات انتهاء الصلاحية")

# إنشاء مثيل عام للخدمة
notification_service = DocumentExpiryNotificationService()

async def start_document_notification_service():
    """بدء خدمة إشعارات المستندات"""
    await notification_service.start_periodic_check()

def stop_document_notification_service():
    """إيقاف خدمة إشعارات المستندات"""
    notification_service.stop_periodic_check()
