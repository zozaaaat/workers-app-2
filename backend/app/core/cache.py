from typing import Any, Optional
import json
import hashlib
from datetime import datetime, timedelta
import asyncio
from functools import wraps

# Simple in-memory cache (يمكن استبداله بـ Redis لاحقاً)
_cache_store = {}
_cache_expiry = {}

class CacheManager:
    def __init__(self):
        self.store = _cache_store
        self.expiry = _cache_expiry
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """توليد مفتاح cache فريد"""
        key_data = f"{prefix}:{args}:{sorted(kwargs.items())}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def set(self, key: str, value: Any, expire_seconds: int = 300):
        """حفظ قيمة في الـ cache مع انتهاء صلاحية"""
        self.store[key] = value
        self.expiry[key] = datetime.now() + timedelta(seconds=expire_seconds)
    
    def get(self, key: str) -> Optional[Any]:
        """جلب قيمة من الـ cache"""
        if key not in self.store:
            return None
        
        # التحقق من انتهاء الصلاحية
        if key in self.expiry and datetime.now() > self.expiry[key]:
            del self.store[key]
            del self.expiry[key]
            return None
        
        return self.store[key]
    
    def delete(self, key: str):
        """حذف قيمة من الـ cache"""
        if key in self.store:
            del self.store[key]
        if key in self.expiry:
            del self.expiry[key]
    
    def clear(self):
        """مسح جميع البيانات من الـ cache"""
        self.store.clear()
        self.expiry.clear()
    
    def cleanup_expired(self):
        """إزالة البيانات منتهية الصلاحية"""
        now = datetime.now()
        expired_keys = [
            key for key, expiry_time in self.expiry.items()
            if now > expiry_time
        ]
        
        for key in expired_keys:
            if key in self.store:
                del self.store[key]
            del self.expiry[key]

# إنشاء instance global
cache = CacheManager()

def cached(expire_seconds: int = 300, prefix: str = "default"):
    """Decorator لـ caching نتائج الدوال"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # توليد cache key
            cache_key = cache._generate_key(f"{prefix}_{func.__name__}", *args, **kwargs)
            
            # محاولة جلب النتيجة من الـ cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # تنفيذ الدالة وحفظ النتيجة
            result = await func(*args, **kwargs)
            cache.set(cache_key, result, expire_seconds)
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # توليد cache key
            cache_key = cache._generate_key(f"{prefix}_{func.__name__}", *args, **kwargs)
            
            # محاولة جلب النتيجة من الـ cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # تنفيذ الدالة وحفظ النتيجة
            result = func(*args, **kwargs)
            cache.set(cache_key, result, expire_seconds)
            
            return result
        
        # التحقق من نوع الدالة
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

# دالة لـ background cleanup
async def start_cache_cleanup():
    """تنظيف دوري للـ cache"""
    while True:
        await asyncio.sleep(300)  # كل 5 دقائق
        cache.cleanup_expired()

# Cache decorators محددة للتطبيق
def cache_user_data(expire_seconds: int = 600):
    """Cache بيانات المستخدمين لمدة 10 دقائق"""
    return cached(expire_seconds=expire_seconds, prefix="user")

def cache_company_data(expire_seconds: int = 1800):
    """Cache بيانات الشركات لمدة 30 دقيقة"""
    return cached(expire_seconds=expire_seconds, prefix="company")

def cache_statistics(expire_seconds: int = 300):
    """Cache الإحصائيات لمدة 5 دقائق"""
    return cached(expire_seconds=expire_seconds, prefix="stats")
