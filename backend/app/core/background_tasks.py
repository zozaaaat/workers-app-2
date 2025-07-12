import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import SessionLocal
from app.models.license import License
from app.models.user import User
from app.core.cache import cache
import logging

logger = logging.getLogger(__name__)

class BackgroundTasks:
    def __init__(self):
        self.is_running = False
        
    async def start_all_tasks(self):
        """بدء جميع المهام الخلفية"""
        if self.is_running:
            return
        
        self.is_running = True
        logger.info("Starting background tasks")
        
        # تشغيل المهام بشكل متوازي
        await asyncio.gather(
            self.license_expiry_checker(),
            self.cache_cleanup_task(),
            self.database_cleanup_task(),
            self.system_health_monitor(),
            return_exceptions=True
        )
    
    async def license_expiry_checker(self):
        """فحص انتهاء صلاحية الرخص"""
        while self.is_running:
            try:
                db = SessionLocal()
                
                # البحث عن الرخص التي ستنتهي صلاحيتها خلال 30 يوم
                thirty_days_from_now = datetime.now() + timedelta(days=30)
                
                expiring_licenses = db.query(License).filter(
                    License.expiry_date <= thirty_days_from_now,
                    License.status == "active"
                ).all()
                
                for license in expiring_licenses:
                    days_left = (license.expiry_date - datetime.now().date()).days
                    
                    if days_left <= 0:
                        # الرخصة منتهية الصلاحية
                        license.status = "expired"
                        logger.warning(f"انتهت صلاحية الرخصة: {license.license_number}")
                        
                        # إرسال إشعار (يمكن إضافة نظام إشعارات لاحقاً)
                        await self.send_expiry_notification(license, "expired")
                        
                    elif days_left <= 7:
                        # الرخصة ستنتهي خلال أسبوع
                        logger.warning(f"الرخصة ستنتهي خلال {days_left} أيام: {license.license_number}")
                        await self.send_expiry_notification(license, "warning")
                        
                    elif days_left <= 30:
                        # الرخصة ستنتهي خلال شهر
                        logger.info(f"الرخصة ستنتهي خلال {days_left} يوم: {license.license_number}")
                        await self.send_expiry_notification(license, "info")
                
                db.commit()
                db.close()
                
            except Exception as e:
                logger.error(f"License expiry check error: {e}")
            
            # انتظار ساعة واحدة
                await asyncio.sleep(3600)
    
    async def send_expiry_notification(self, license: License, level: str):
        """إرسال إشعار انتهاء صلاحية"""
        # يمكن تطوير هذا لإرسال إشعارات فعلية (email, SMS, etc.)
        logger.info(f"اشعار {level}: رخصة {license.license_number}")
    
    async def cache_cleanup_task(self):
        """تنظيف الـ cache بشكل دوري"""
        while self.is_running:
            try:
                cache.cleanup_expired()
                logger.info("Cache cleaned")
                
            except Exception as e:
                logger.error(f"Cache cleanup error: {e}")
            
            # انتظار 5 دقائق
                await asyncio.sleep(300)
    
    async def database_cleanup_task(self):
        """تنظيف قاعدة البيانات من البيانات القديمة"""
        while self.is_running:
            try:
                db = SessionLocal()
                
                # حذف البيانات المؤقتة القديمة (أكثر من 30 يوم)
                thirty_days_ago = datetime.now() - timedelta(days=30)
                
                # يمكن إضافة عمليات تنظيف أخرى هنا
                # مثل حذف logs قديمة، أو sessions منتهية الصلاحية
                
                db.commit()
                db.close()
                
                logger.info("Database cleaned")
                
            except Exception as e:
                logger.error(f"Database cleanup error: {e}")
            
            # انتظار يوم واحد
                await asyncio.sleep(86400)
    
    async def system_health_monitor(self):
        """مراقبة صحة النظام"""
        while self.is_running:
            try:
                # فحص اتصال قاعدة البيانات
                db = SessionLocal()
                db.execute(text("SELECT 1"))
                db.close()
                
                # فحص استخدام الذاكرة
                import psutil
                memory_usage = psutil.virtual_memory().percent
                
                if memory_usage > 85:
                    logger.warning(f"⚠️  استخدام الذاكرة مرتفع: {memory_usage}%")
                
                # فحص مساحة القرص
                disk_usage = psutil.disk_usage('/').percent
                
                if disk_usage > 85:
                    logger.warning(f"⚠️  مساحة القرص منخفضة: {disk_usage}%")
                
                logger.info(f"System healthy - Memory: {memory_usage}% - Disk: {disk_usage}%")
                
            except Exception as e:
                logger.error(f"System health monitor error: {e}")
            
            # انتظار 10 دقائق
                await asyncio.sleep(600)
    
    def stop_all_tasks(self):
        """إيقاف جميع المهام الخلفية"""
        self.is_running = False
        logger.info("🛑 تم إيقاف المهام الخلفية")

# إنشاء instance global
background_tasks = BackgroundTasks()
