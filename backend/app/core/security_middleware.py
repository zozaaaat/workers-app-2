from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio

# Rate limiting storage
rate_limit_storage = defaultdict(list)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls  # عدد الطلبات المسموحة
        self.period = period  # الفترة الزمنية بالثواني
    
    async def dispatch(self, request: Request, call_next):
        # الحصول على IP العميل
        client_ip = request.client.host if request.client else "unknown"
        
        # التحقق من Rate Limiting
        now = datetime.now()
        
        # تنظيف الطلبات القديمة
        cutoff_time = now - timedelta(seconds=self.period)
        rate_limit_storage[client_ip] = [
            timestamp for timestamp in rate_limit_storage[client_ip]
            if timestamp > cutoff_time
        ]
        
        # التحقق من تجاوز الحد
        if len(rate_limit_storage[client_ip]) >= self.calls:
            raise HTTPException(
                status_code=429,
                detail=f"تم تجاوز الحد المسموح من الطلبات. الحد الأقصى {self.calls} طلب كل {self.period} ثانية"
            )
        
        # إضافة الطلب الحالي
        rate_limit_storage[client_ip].append(now)
        
        response = await call_next(request)
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """إضافة headers أمان"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # إضافة security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

# IP Whitelist/Blacklist
BLOCKED_IPS = set()
ALLOWED_IPS = set()  # إذا كان فارغ، سيسمح لجميع IPs

class IPFilterMiddleware(BaseHTTPMiddleware):
    """تصفية IP addresses"""
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        
        # التحقق من IP المحظور
        if client_ip in BLOCKED_IPS:
            raise HTTPException(
                status_code=403,
                detail="الوصول محظور من هذا العنوان"
            )
        
        # التحقق من IP المسموح (إذا كانت القائمة غير فارغة)
        if ALLOWED_IPS and client_ip not in ALLOWED_IPS:
            raise HTTPException(
                status_code=403,
                detail="الوصول غير مصرح به من هذا العنوان"
            )
        
        response = await call_next(request)
        return response

# دوال مساعدة للأمان
def block_ip(ip: str):
    """حظر IP address"""
    BLOCKED_IPS.add(ip)

def unblock_ip(ip: str):
    """إلغاء حظر IP address"""
    BLOCKED_IPS.discard(ip)

def add_allowed_ip(ip: str):
    """إضافة IP للقائمة المسموحة"""
    ALLOWED_IPS.add(ip)

def remove_allowed_ip(ip: str):
    """إزالة IP من القائمة المسموحة"""
    ALLOWED_IPS.discard(ip)

# تنظيف دوري لـ rate limiting storage
async def cleanup_rate_limit_storage():
    """تنظيف بيانات rate limiting القديمة"""
    while True:
        await asyncio.sleep(300)  # كل 5 دقائق
        
        cutoff_time = datetime.now() - timedelta(seconds=3600)  # ساعة واحدة
        
        for ip in list(rate_limit_storage.keys()):
            rate_limit_storage[ip] = [
                timestamp for timestamp in rate_limit_storage[ip]
                if timestamp > cutoff_time
            ]
            
            # حذف IP إذا لم يعد لديه طلبات
            if not rate_limit_storage[ip]:
                del rate_limit_storage[ip]
