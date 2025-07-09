"""
Optimized Database CRUD Operations with Caching
عمليات قاعدة البيانات المحسّنة مع التخزين المؤقت
"""

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models import Worker, Company, License
from app.models_notification import Notification
from app.models_worker_document import WorkerDocument
from app.services.cache_service import cache, cached_response, CacheInvalidationStrategies

class OptimizedQueries:
    """عمليات الاستعلام المحسّنة"""
    
    def __init__(self, db: Session):
        self.db = db
    
    @cached_response(expiry=timedelta(minutes=5), key_prefix="dashboard")
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """الحصول على إحصائيات لوحة التحكم مع التخزين المؤقت"""
        
        # استعلام محسّن للإحصائيات الأساسية
        stats = {}
        
        # عدد العمال الإجمالي
        stats['total_workers'] = self.db.query(func.count(Worker.id)).scalar()
        
        # عدد الشركات
        stats['total_companies'] = self.db.query(func.count(Company.id)).scalar()
        
        # العمال المضافون هذا الشهر
        current_month = datetime.now().replace(day=1)
        stats['workers_this_month'] = self.db.query(func.count(Worker.id)).filter(
            Worker.created_at >= current_month
        ).scalar() if hasattr(Worker, 'created_at') else 0
        
        # التراخيص المنتهية الصلاحية قريباً (خلال 30 يوم)
        upcoming_expiry_date = datetime.now() + timedelta(days=30)
        stats['upcoming_expirations'] = self.db.query(func.count(WorkerDocument.id)).filter(
            and_(
                WorkerDocument.expires_at <= upcoming_expiry_date,
                WorkerDocument.expires_at >= datetime.now()
            )
        ).scalar()
        
        # الإشعارات غير المقروءة
        stats['unread_notifications'] = self.db.query(func.count(Notification.id)).filter(
            Notification.archived == False
        ).scalar()
        
        return stats
    
    def get_workers_optimized(self, skip: int = 0, limit: int = 100, 
                             company_id: Optional[int] = None,
                             search: Optional[str] = None) -> List[Worker]:
        """استعلام محسّن للعمال مع eager loading"""
        
        # بناء الاستعلام مع تحميل العلاقات مسبقاً
        query = self.db.query(Worker).options(
            joinedload(Worker.company),
            joinedload(Worker.license),
            selectinload(Worker.documents)
        )
        
        # تطبيق المرشحات
        if company_id:
            query = query.filter(Worker.company_id == company_id)
        
        if search:
            search_filter = or_(
                Worker.name.contains(search),
                Worker.custom_id.contains(search)
            )
            query = query.filter(search_filter)
        
        # ترتيب وتحديد النتائج
        return query.order_by(Worker.id.desc()).offset(skip).limit(limit).all()
    
    def get_companies_optimized(self, skip: int = 0, limit: int = 100) -> List[Company]:
        """استعلام محسّن للشركات"""
        
        return self.db.query(Company).options(
            selectinload(Company.workers),
            selectinload(Company.licenses)
        ).offset(skip).limit(limit).all()
    
    @cached_response(expiry=timedelta(minutes=10), key_prefix="notifications")
    async def get_recent_notifications(self, limit: int = 10) -> List[Dict]:
        """الحصول على الإشعارات الحديثة مع التخزين المؤقت"""
        
        notifications = self.db.query(Notification).filter(
            Notification.archived == False
        ).order_by(
            Notification.created_at.desc()
        ).limit(limit).all()
        
        # تحويل النتائج إلى قاموس للتخزين المؤقت
        return [
            {
                'id': notif.id,
                'title': notif.title,
                'message': notif.message,
                'created_at': notif.created_at.isoformat() if notif.created_at else None,
                'type': getattr(notif, 'type', 'info')
            }
            for notif in notifications
        ]
    
    def get_expiring_documents(self, days_ahead: int = 30) -> List[Dict]:
        """الحصول على الوثائق المنتهية الصلاحية قريباً"""
        
        expiry_date = datetime.now() + timedelta(days=days_ahead)
        
        expiring_docs = self.db.query(WorkerDocument).options(
            joinedload(WorkerDocument.worker)
        ).filter(
            and_(
                WorkerDocument.expires_at <= expiry_date,
                WorkerDocument.expires_at >= datetime.now()
            )
        ).order_by(WorkerDocument.expires_at).all()
        
        return [
            {
                'worker_name': doc.worker.name if doc.worker else 'غير محدد',
                'document_type': doc.document_type,
                'expires_at': doc.expires_at.isoformat() if doc.expires_at else None,
                'days_remaining': (doc.expires_at - datetime.now()).days if doc.expires_at else 0
            }
            for doc in expiring_docs
        ]

# وظائف مساعدة لإدارة التخزين المؤقت
def invalidate_worker_related_cache(worker_id: int):
    """إلغاء التخزين المؤقت للبيانات المتعلقة بالعامل"""
    CacheInvalidationStrategies.invalidate_worker_cache(worker_id)
    CacheInvalidationStrategies.invalidate_all_stats()

def invalidate_company_related_cache(company_id: int):
    """إلغاء التخزين المؤقت للبيانات المتعلقة بالشركة"""
    CacheInvalidationStrategies.invalidate_company_cache(company_id)
    CacheInvalidationStrategies.invalidate_all_stats()

def invalidate_notification_cache():
    """إلغاء التخزين المؤقت للإشعارات"""
    cache.delete_pattern("notifications:*")

# استراتيجيات التحسين المتقدمة
class AdvancedOptimizations:
    """تحسينات متقدمة لقاعدة البيانات"""
    
    @staticmethod
    def batch_update_workers(db: Session, worker_updates: List[Dict]):
        """تحديث مجموعة من العمال دفعة واحدة"""
        try:
            for update_data in worker_updates:
                worker_id = update_data.pop('id')
                db.query(Worker).filter(Worker.id == worker_id).update(update_data)
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    
    @staticmethod
    def get_workers_with_pagination(db: Session, page: int = 1, per_page: int = 20):
        """الحصول على العمال مع ترقيم الصفحات المحسّن"""
        
        offset = (page - 1) * per_page
        
        # الحصول على العدد الإجمالي
        total = db.query(func.count(Worker.id)).scalar()
        
        # الحصول على البيانات
        workers = db.query(Worker).options(
            joinedload(Worker.company),
            joinedload(Worker.license)
        ).offset(offset).limit(per_page).all()
        
        return {
            'workers': workers,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        }
