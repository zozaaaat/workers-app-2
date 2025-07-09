"""
Redis Caching Configuration
تكوين نظام التخزين المؤقت باستخدام Redis
"""

import redis
import json
from typing import Any, Optional
from datetime import timedelta
import os
from functools import wraps

class CacheManager:
    def __init__(self):
        # تكوين Redis
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            db=int(os.getenv('REDIS_DB', 0)),
            decode_responses=True
        )
        
        # أوقات انتهاء الصلاحية الافتراضية
        self.DEFAULT_EXPIRY = timedelta(minutes=15)
        self.STATS_EXPIRY = timedelta(minutes=5)
        self.USER_SESSION_EXPIRY = timedelta(hours=24)
        
    def _serialize_key(self, key: str) -> str:
        """تحويل المفتاح إلى نص قابل للتخزين"""
        return f"workers_app:{key}"
    
    def set(self, key: str, value: Any, expiry: Optional[timedelta] = None) -> bool:
        """تخزين قيمة في الذاكرة المؤقتة"""
        try:
            serialized_key = self._serialize_key(key)
            serialized_value = json.dumps(value, default=str)
            
            if expiry:
                return self.redis_client.setex(
                    serialized_key, 
                    int(expiry.total_seconds()), 
                    serialized_value
                )
            else:
                return self.redis_client.set(serialized_key, serialized_value)
        except Exception as e:
            print(f"خطأ في تخزين البيانات: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """استرجاع قيمة من الذاكرة المؤقتة"""
        try:
            serialized_key = self._serialize_key(key)
            value = self.redis_client.get(serialized_key)
            
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"خطأ في استرجاع البيانات: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """حذف قيمة من الذاكرة المؤقتة"""
        try:
            serialized_key = self._serialize_key(key)
            return bool(self.redis_client.delete(serialized_key))
        except Exception as e:
            print(f"خطأ في حذف البيانات: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """حذف جميع المفاتيح التي تطابق النمط"""
        try:
            full_pattern = self._serialize_key(pattern)
            keys = self.redis_client.keys(full_pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            print(f"خطأ في حذف النمط: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """فحص وجود مفتاح في الذاكرة المؤقتة"""
        try:
            serialized_key = self._serialize_key(key)
            return bool(self.redis_client.exists(serialized_key))
        except Exception as e:
            print(f"خطأ في فحص وجود المفتاح: {e}")
            return False

# إنشاء مثيل عام من مدير الذاكرة المؤقتة
cache = CacheManager()

def cached_response(expiry: Optional[timedelta] = None, key_prefix: str = "api"):
    """
    ديكوريتر لتخزين استجابات API مؤقتاً
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # إنشاء مفتاح فريد للاستعلام
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # محاولة استرجاع النتيجة من الذاكرة المؤقتة
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # تنفيذ الدالة وتخزين النتيجة
            result = await func(*args, **kwargs)
            cache.set(cache_key, result, expiry or cache.DEFAULT_EXPIRY)
            
            return result
        return wrapper
    return decorator

def invalidate_cache_pattern(pattern: str):
    """مساعد لحذف مجموعة من المفاتيح"""
    return cache.delete_pattern(pattern)

# استراتيجيات إلغاء التخزين المؤقت
class CacheInvalidationStrategies:
    @staticmethod
    def invalidate_worker_cache(worker_id: int):
        """إلغاء تخزين البيانات المتعلقة بعامل معين"""
        patterns = [
            f"api:*worker*{worker_id}*",
            "api:get_dashboard_stats*",
            "api:get_workers*"
        ]
        for pattern in patterns:
            invalidate_cache_pattern(pattern)
    
    @staticmethod
    def invalidate_company_cache(company_id: int):
        """إلغاء تخزين البيانات المتعلقة بشركة معينة"""
        patterns = [
            f"api:*company*{company_id}*",
            "api:get_dashboard_stats*",
            "api:get_companies*"
        ]
        for pattern in patterns:
            invalidate_cache_pattern(pattern)
    
    @staticmethod
    def invalidate_all_stats():
        """إلغاء تخزين جميع الإحصائيات"""
        invalidate_cache_pattern("api:*stats*")
        invalidate_cache_pattern("api:*dashboard*")
