from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.crud import company_documents
from app.api_notifications import add_notification
import asyncio
import logging

logger = logging.getLogger(__name__)

class DocumentExpiryNotificationService:
    """خدمة إشعارات انتهاء صلاحية المستندات"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
    
    async def check_and_send_notifications(self):
        """فحص المستندات وإرسال الإشعارات المطلوبة"""
        try:
            db = SessionLocal()
            
            # جلب جميع تنبيهات انتهاء الصلاحية
            alerts = company_documents.get_expiry_alerts(db)
            
            notifications_sent = 0
            
            for alert in alerts:
                # جلب المستند للتحقق من حالة الإشعارات
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
                    # تحديد محتوى الإشعار
                    if alert.alert_type == "expired":
                        message = f"⚠️ تنبيه هام: انتهت صلاحية {self.get_document_type_ar(alert.document_type)} للشركة {alert.company_name}"
                        if alert.license_number:
                            message += f" (رقم: {alert.license_number})"
                        color = "#f44336"
                        emoji = "⚠️"
                        action_required = True
                    else:
                        period_text = self.get_period_text(alert.alert_type)
                        days_text = f"{alert.days_remaining} يوم" if alert.days_remaining > 1 else "يوم واحد"
                        message = f"🔔 تنبيه: ستنتهي صلاحية {self.get_document_type_ar(alert.document_type)} للشركة {alert.company_name} خلال {days_text}"
                        if alert.license_number:
                            message += f" (رقم: {alert.license_number})"
                        color = "#ff9800" if alert.days_remaining <= 30 else "#2196F3"
                        emoji = "🔔"
                        action_required = alert.days_remaining <= 30
                    
                    # إرسال الإشعار
                    await add_notification(
                        message=message,
                        type="warning" if alert.alert_type == "expired" else "info",
                        company_id=alert.company_id,
                        emoji=emoji,
                        color=color,
                        action_required=action_required
                    )
                    
                    # تحديث حالة الإشعار في قاعدة البيانات
                    if notification_type != "expired":
                        company_documents.mark_notification_sent(db, alert.document_id, notification_type)
                    
                    notifications_sent += 1
                    logger.info(f"تم إرسال إشعار انتهاء صلاحية للشركة {alert.company_name} - {alert.document_type}")
            
            logger.info(f"تم إرسال {notifications_sent} إشعار انتهاء صلاحية")
            
        except Exception as e:
            logger.error(f"خطأ في خدمة إشعارات انتهاء الصلاحية: {e}")
        finally:
            db.close()
    
    def get_document_type_ar(self, doc_type: str) -> str:
        """ترجمة نوع المستند إلى العربية"""
        translations = {
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
        return translations.get(doc_type, doc_type)
    
    def get_period_text(self, alert_type: str) -> str:
        """تحويل نوع التنبيه إلى نص"""
        periods = {
            "6_months": "6 أشهر",
            "3_months": "3 أشهر",
            "1_month": "شهر واحد",
            "1_week": "أسبوع واحد"
        }
        return periods.get(alert_type, "")
    
    def start(self):
        """بدء خدمة المراقبة"""
        if not self.is_running:
            # إضافة مهمة فحص يومية في الساعة 9 صباحاً
            self.scheduler.add_job(
                self.check_and_send_notifications,
                trigger=IntervalTrigger(hours=24),
                id="daily_expiry_check",
                replace_existing=True
            )
            
            # إضافة مهمة فحص أسبوعية للمستندات المنتهية
            self.scheduler.add_job(
                self.check_and_send_notifications,
                trigger=IntervalTrigger(hours=6),  # كل 6 ساعات للتحقق من المستندات المنتهية
                id="expired_documents_check",
                replace_existing=True
            )
            
            self.scheduler.start()
            self.is_running = True
            logger.info("تم بدء خدمة إشعارات انتهاء صلاحية المستندات")
    
    def stop(self):
        """إيقاف خدمة المراقبة"""
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("تم إيقاف خدمة إشعارات انتهاء صلاحية المستندات")
    
    async def run_manual_check(self):
        """تشغيل فحص يدوي"""
        logger.info("بدء فحص يدوي لانتهاء صلاحية المستندات")
        await self.check_and_send_notifications()

# إنشاء مثيل عام للخدمة
notification_service = DocumentExpiryNotificationService()
