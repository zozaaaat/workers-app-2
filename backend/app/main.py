from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from typing import List
import asyncio

# Database imports
from app.database.session import get_db, SessionLocal
from app.database.base import Base
from app.database.session import engine

# Connection Manager for WebSocket
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

# Import routers
from app.routers.auth import router as auth_router
from app.routers.companies import router as companies_router
from app.routers.users import router as users_router
from app.routers.employees import router as employees_router
from app.routers.licenses import router as licenses_router
from app.routers.dashboard import router as dashboard_router
from app.routers.documents import router as documents_router
from app.routers.alerts import router as alerts_router
from app.routers.tasks import router as tasks_router

# Import models to ensure they are created
try:
    from app.models.user import User
    from app.models.company import Company
    from app.models.employee import Employee
    from app.models.license import License
    from app.models.document import Document
    from app.models.alert import Alert
    from app.models.role import Role
    from app.models.permission import Permission
    from app.models.task import Task
    print("✅ All models imported successfully")
except Exception as e:
    print(f"❌ Model import error: {e}")

# Create all tables
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
except Exception as e:
    print(f"❌ Database creation error: {e}")

# Initialize FastAPI app

app = FastAPI(
    title="نظام إدارة العمال والرخص",
    description="نظام شامل لإدارة العمال والرخص والوثائق",
    version="2.0.0"
)

# إضافة بيانات شركات تجريبية عند بدء التطبيق
@app.on_event("startup")
def add_test_companies():
    db = SessionLocal()
    if db.query(Company).count() == 0:
        companies = [
            Company(name="شركة الاختبار الأولى", email="test1@company.com", phone="0500000001", address="الرياض", registration_number="1001", tax_number="2001", is_active=True),
            Company(name="شركة الاختبار الثانية", email="test2@company.com", phone="0500000002", address="جدة", registration_number="1002", tax_number="2002", is_active=True),
            Company(name="شركة غير نشطة", email="inactive@company.com", phone="0500000003", address="الدمام", registration_number="1003", tax_number="2003", is_active=False)
        ]
        db.add_all(companies)
        db.commit()
        # جلب الشركات بعد الحفظ للحصول على المعرفات الصحيحة
        saved_companies = db.query(Company).all()
        company_map = {c.name: c.id for c in saved_companies}
        from app.models.employee import Employee
        employees = [
            Employee(name="أحمد علي", email="ahmed1@company.com", phone="0551111111", position="مدير موارد بشرية", company_id=company_map.get("شركة الاختبار الأولى"), is_active=True),
            Employee(name="سارة محمد", email="sara1@company.com", phone="0552222222", position="محاسبة", company_id=company_map.get("شركة الاختبار الأولى"), is_active=True),
            Employee(name="خالد يوسف", email="khaled2@company.com", phone="0553333333", position="مدير مشاريع", company_id=company_map.get("شركة الاختبار الثانية"), is_active=True),
            Employee(name="منى فهد", email="mona2@company.com", phone="0554444444", position="سكرتيرة", company_id=company_map.get("شركة الاختبار الثانية"), is_active=True)
        ]
        db.add_all(employees)
        db.commit()
        print("✅ تم إضافة شركات وموظفين تجريبيين للاختبار")
    db.close()

# Add middleware
from app.core.middleware import ErrorHandlingMiddleware, RequestLoggingMiddleware
from app.core.security_middleware import RateLimitMiddleware, SecurityHeadersMiddleware, IPFilterMiddleware
from app.core.background_tasks import background_tasks
from app.core.cache import cache

app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)  # 100 طلب كل دقيقة
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(IPFilterMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include routers واحد بواحد مع معالجة الأخطاء
routers_to_include = [
    ("dashboard", "/api/dashboard", "Dashboard"),
    ("auth", "/api/auth", "Authentication"),
    ("companies", "/api/companies", "Companies"),
    ("users", "/api/users", "Users"),
    ("employees", "/api/employees", "Employees"),
    ("licenses", "/api/licenses", "Licenses"),
    ("documents", "/api/documents", "Documents"),
    ("alerts", "/api/alerts", "Alerts"),
    ("tasks", "/api/tasks", "Tasks"),
]

for router_name, prefix, tag in routers_to_include:
    try:
        if router_name == "dashboard":
            from app.routers.dashboard import router as dashboard_router
            app.include_router(dashboard_router, prefix=prefix, tags=[tag])
        elif router_name == "auth":
            from app.routers.auth import router as auth_router
            app.include_router(auth_router, prefix=prefix, tags=[tag])
        elif router_name == "companies":
            from app.routers.companies import router as companies_router
            app.include_router(companies_router, prefix=prefix, tags=[tag])
        elif router_name == "users":
            from app.routers.users import router as users_router
            app.include_router(users_router, prefix=prefix, tags=[tag])
        elif router_name == "employees":
            from app.routers.employees import router as employees_router
            app.include_router(employees_router, prefix=prefix, tags=[tag])
        elif router_name == "licenses":
            from app.routers.licenses import router as licenses_router
            app.include_router(licenses_router, prefix=prefix, tags=[tag])
        elif router_name == "documents":
            from app.routers.documents import router as documents_router
            app.include_router(documents_router, prefix=prefix, tags=[tag])
        elif router_name == "alerts":
            from app.routers.alerts import router as alerts_router
            app.include_router(alerts_router, prefix=prefix, tags=[tag])
        elif router_name == "tasks":
            from app.routers.tasks import router as tasks_router
            app.include_router(tasks_router, prefix=prefix, tags=[tag])
        print(f"✅ {router_name} router loaded")
    except Exception as e:
        print(f"❌ {router_name} router error: {e}")

# TODO: إضافة باقي الـ routers بعد إصلاح الـ schemas
# - employees
# - licenses  
# - documents
# - alerts

# WebSocket endpoint for real-time notifications
@app.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Health check endpoints
@app.get("/")
def read_root():
    return {"message": "نظام إدارة العمال والرخص", "version": "2.0.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "النظام يعمل بشكل طبيعي"}

@app.get("/api/ping")
def ping():
    return {"pong": True}

# Startup and shutdown events



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
