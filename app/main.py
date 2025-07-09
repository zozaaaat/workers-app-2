print("=== MAIN.PY LOADED ===")
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi_utils.tasks import repeat_every
from sqlalchemy.orm import Session
import asyncio
print("=== IMPORTED FASTAPI & CORS ===")

# استيراد get_db
from app.database import get_db, SessionLocal

# تعريف ConnectionManager هنا
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# استيراد الراوترات بشكل منفصل لتجنب الاستيراد الدائري
from app.routers import companies
from app.routers import licenses
from app.routers import workers
from app.routers import leaves
from app.routers import deductions
from app.routers import violations
from app.routers import end_of_service
from app.routers import auth
from app.routers import activity_log
from app.routers import users
from app.routers import notifications
from app.routers import absences
from app.routers import worker_documents
from app.routers import company_documents
from app.routers import license_documents  # نظام ملفات الرخص والأرشيف
from app.routers import permissions  # نظام الأذونات والموافقات
from app.routers import analytics  # نظام التحليلات
from app.routers import security  # نظام الأمان المتقدم
from app.routers import ai_analytics  # نظام الذكاء الاصطناعي

# استيراد خدمة إشعارات المستندات
try:
    from app.services.document_notifications import start_document_notification_service, stop_document_notification_service
except ImportError:
    print("⚠️ لم يتم العثور على خدمة إشعارات المستندات")

from app import models
from app.database import engine

# إنشاء جميع الجداول حسب الـ models المعرفة
models.Base.metadata.create_all(bind=engine)

# تعيين مدير الاتصالات لتجنب الاستيراد الدائري
try:
    from app.api_notifications import set_manager
    set_manager(manager)
except ImportError:
    print("⚠️ لم يتم العثور على api_notifications")

app = FastAPI(title="Workers Management API")

# Performance middleware - تفعيل ضغط البيانات
app.add_middleware(GZipMiddleware, minimum_size=1000)

# إعدادات CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Performance optimization imports
from fastapi.middleware.gzip import GZipMiddleware
from app.services.cache_service import cache
from app.crud.optimized_crud import OptimizedQueries

# تضمين جميع الراوترات
app.include_router(companies.router, prefix="/companies", tags=["Companies"])
app.include_router(licenses.router, prefix="/licenses", tags=["Licenses"])
app.include_router(workers.router, tags=["Workers"])
app.include_router(leaves.router, prefix="/leaves", tags=["Leaves"])
app.include_router(deductions.router, prefix="/deductions", tags=["Deductions"])
app.include_router(violations.router, prefix="/violations", tags=["Violations"])
app.include_router(end_of_service.router, prefix="/end_of_service", tags=["EndOfService"])
app.include_router(activity_log.router)
app.include_router(auth.router)
app.include_router(absences.router, prefix="/absences", tags=["Absences"])
app.include_router(worker_documents.router)
app.include_router(company_documents.router)
app.include_router(license_documents.router)  # نظام ملفات الرخص والأرشيف
app.include_router(users.router)  # prefix موجود في router نفسه
app.include_router(notifications.router)
app.include_router(permissions.router)  # prefix موجود في router نفسه
app.include_router(analytics.router)  # نظام التحليلات المتقدمة
app.include_router(security.router)  # نظام الأمان المتقدم
app.include_router(ai_analytics.router)  # نظام الذكاء الاصطناعي

# Performance optimized routes
from app.routers import dashboard_optimized
app.include_router(dashboard_optimized.router, tags=["Dashboard Optimized"])

@app.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # مجرد إبقاء الاتصال حي
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {"message": "Welcome to Workers Management API"}

@app.get("/test-root")
def test_root():
    return {"status": "ok"}

@app.get("/ping")
def ping():
    return {"pong": True}

@app.get("/hello")
def hello():
    return {"msg": "hello"}

@app.on_event("startup")
@repeat_every(seconds=60)  # كل دقيقة
def process_scheduled_notifications_task() -> None:
    from app.database import SessionLocal
    db = SessionLocal()
    from app.crud.notifications import send_scheduled_notifications
    send_scheduled_notifications(db)
    db.close()

@app.get("/test-auth")
def test_auth(current_user: models.User = Depends(lambda: None)):
    """نقطة نهاية اختبار بسيطة"""
    return {"message": "ok", "user": current_user.username if current_user else "anonymous"}

@app.get("/simple-users")
def get_simple_users(db: Session = Depends(get_db)):
    """نقطة نهاية بسيطة لاختبار المستخدمين"""
    try:
        users = db.query(models.User).all()
        result = []
        for user in users:
            result.append({
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "is_active": user.is_active
            })
        return {"users": result, "count": len(result)}
    except Exception as e:
        return {"error": str(e)}

@app.get("/test-workers-direct")
def test_workers_direct(db: Session = Depends(get_db)):
    """اختبار مباشر لقاعدة بيانات العمال"""
    try:
        from app.crud import workers as crud_workers
        workers = crud_workers.get_workers(db, skip=0, limit=10)
        return {"count": len(workers), "workers": [{"id": w.id, "name": w.name} for w in workers]}
    except Exception as e:
        return {"error": str(e)}

# بدء خدمة إشعارات انتهاء صلاحية المستندات
@app.on_event("startup")
async def startup_event():
    print("🚀 بدء تشغيل الخدمات...")
    try:
        # بدء خدمة إشعارات انتهاء صلاحية المستندات
        asyncio.create_task(start_document_notification_service())
        print("✅ تم بدء خدمة إشعارات المستندات")
    except Exception as e:
        print(f"❌ خطأ في بدء الخدمات: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 إيقاف الخدمات...")
    try:
        # إيقاف خدمة إشعارات المستندات
        stop_document_notification_service()
        print("✅ تم إيقاف خدمة إشعارات المستندات")
    except Exception as e:
        print(f"❌ خطأ في إيقاف الخدمات: {e}")

@app.get("/manual-document-expiry-check")
async def manual_document_expiry_check(db: Session = Depends(get_db)):
    """تشغيل فحص يدوي لانتهاء صلاحية المستندات"""
    try:
        from app.services.document_notifications import notification_service
        await notification_service.check_and_send_notifications(db)
        return {"message": "تم تشغيل فحص انتهاء صلاحية المستندات بنجاح"}
    except Exception as e:
        return {"error": str(e)}
