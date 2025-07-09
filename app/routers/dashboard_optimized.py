"""
Optimized Dashboard API Endpoints
نقاط API محسّنة للوحة التحكم
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database import get_db
from app.crud.optimized_crud import OptimizedQueries
from app.services.cache_service import cached_response
from datetime import timedelta

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

@router.get("/stats")
@cached_response(expiry=timedelta(minutes=5), key_prefix="dashboard_stats")
async def get_dashboard_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    الحصول على إحصائيات لوحة التحكم المحسّنة
    """
    try:
        optimizer = OptimizedQueries(db)
        stats = await optimizer.get_dashboard_stats()
        
        return {
            "success": True,
            "data": stats,
            "cached": True  # إشارة أن البيانات مخزنة مؤقتاً
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في جلب الإحصائيات: {str(e)}")

@router.get("/notifications")
async def get_recent_notifications(
    limit: int = 10,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    الحصول على الإشعارات الحديثة مع التخزين المؤقت
    """
    try:
        optimizer = OptimizedQueries(db)
        notifications = await optimizer.get_recent_notifications(limit=limit)
        
        return {
            "success": True,
            "data": notifications,
            "count": len(notifications)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في جلب الإشعارات: {str(e)}")

@router.get("/expiring-documents")
async def get_expiring_documents(
    days_ahead: int = 30,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    الحصول على الوثائق المنتهية الصلاحية قريباً
    """
    try:
        optimizer = OptimizedQueries(db)
        expiring_docs = optimizer.get_expiring_documents(days_ahead=days_ahead)
        
        return {
            "success": True,
            "data": expiring_docs,
            "count": len(expiring_docs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في جلب الوثائق المنتهية: {str(e)}")

@router.get("/workers-optimized")
async def get_workers_optimized(
    skip: int = 0,
    limit: int = 20,
    company_id: int = None,
    search: str = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    الحصول على العمال مع تحسينات الأداء
    """
    try:
        optimizer = OptimizedQueries(db)
        workers = optimizer.get_workers_optimized(
            skip=skip, 
            limit=limit, 
            company_id=company_id, 
            search=search
        )
        
        # تحويل النتائج لتجنب مشاكل التسلسل
        workers_data = []
        for worker in workers:
            worker_dict = {
                "id": worker.id,
                "name": worker.name,
                "custom_id": worker.custom_id,
                "company_name": worker.company.file_name if worker.company else None,
                "license_name": worker.license.name if worker.license else None,
                "work_status": getattr(worker, 'work_status', None)
            }
            workers_data.append(worker_dict)
        
        return {
            "success": True,
            "data": workers_data,
            "count": len(workers_data),
            "pagination": {
                "skip": skip,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في جلب العمال: {str(e)}")

@router.post("/cache/invalidate")
async def invalidate_dashboard_cache() -> Dict[str, Any]:
    """
    إلغاء التخزين المؤقت للوحة التحكم
    """
    try:
        from app.services.cache_service import invalidate_cache_pattern
        
        # إلغاء جميع بيانات لوحة التحكل المخزنة مؤقتاً
        patterns_to_clear = [
            "dashboard_stats:*",
            "dashboard:*",
            "notifications:*"
        ]
        
        cleared_count = 0
        for pattern in patterns_to_clear:
            cleared_count += invalidate_cache_pattern(pattern)
        
        return {
            "success": True,
            "message": f"تم إلغاء {cleared_count} عنصر من التخزين المؤقت",
            "cleared_count": cleared_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في إلغاء التخزين المؤقت: {str(e)}")

@router.get("/performance-info")
async def get_performance_info() -> Dict[str, Any]:
    """
    معلومات أداء النظام
    """
    try:
        from app.services.cache_service import cache
        import psutil
        import time
        
        # معلومات النظام
        memory_info = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # معلومات التخزين المؤقت
        cache_info = {
            "redis_connected": True,
            "total_keys": len(cache.redis_client.keys("workers_app:*")) if hasattr(cache, 'redis_client') else 0
        }
        
        return {
            "success": True,
            "data": {
                "system": {
                    "memory_usage_percent": memory_info.percent,
                    "cpu_usage_percent": cpu_percent,
                    "available_memory_gb": round(memory_info.available / (1024**3), 2)
                },
                "cache": cache_info,
                "timestamp": time.time()
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"خطأ في جلب معلومات الأداء: {str(e)}"
        }
