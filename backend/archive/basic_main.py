#!/usr/bin/env python
"""
تطبيق FastAPI مبسط جداً للاختبار
"""

import sys
import os

# إضافة مجلد backend إلى path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

# Create basic FastAPI app
app = FastAPI(
    title="نظام إدارة العمال والرخص",
    description="نظام شامل لإدارة العمال والرخص والوثائق",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Basic endpoints
@app.get("/")
def read_root():
    return {"message": "نظام إدارة العمال والرخص", "version": "2.0.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "النظام يعمل بشكل طبيعي"}

@app.get("/api/ping")
def ping():
    return {"pong": True}

# إضافة الـ routers بطريقة آمنة
print("🔄 Loading routers...")

try:
    from app.routers.companies import router as companies_router
    app.include_router(companies_router, prefix="/api/companies", tags=["Companies"])
    print("✅ Companies router loaded")
except Exception as e:
    print(f"⚠ Companies router error: {e}")

try:
    from app.routers.users import router as users_router
    app.include_router(users_router, prefix="/api/users", tags=["Users"])
    print("✅ Users router loaded")
except Exception as e:
    print(f"⚠ Users router error: {e}")

try:
    from app.routers.auth import router as auth_router
    app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
    print("✅ Auth router loaded")
except Exception as e:
    print(f"⚠ Auth router error: {e}")

try:
    from app.routers.employees import router as employees_router
    app.include_router(employees_router, prefix="/api/employees", tags=["Employees"])
    print("✅ Employees router loaded")
except Exception as e:
    print(f"⚠ Employees router error: {e}")

try:
    from app.routers.licenses import router as licenses_router
    app.include_router(licenses_router, prefix="/api/licenses", tags=["Licenses"])
    print("✅ Licenses router loaded")
except Exception as e:
    print(f"⚠ Licenses router error: {e}")

try:
    from app.routers.documents import router as documents_router
    app.include_router(documents_router, prefix="/api/documents", tags=["Documents"])
    print("✅ Documents router loaded")
except Exception as e:
    print(f"⚠ Documents router error: {e}")

try:
    from app.routers.alerts import router as alerts_router
    app.include_router(alerts_router, prefix="/api/alerts", tags=["Alerts"])
    print("✅ Alerts router loaded")
except Exception as e:
    print(f"⚠ Alerts router error: {e}")

try:
    from app.routers.dashboard import router as dashboard_router
    app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
    print("✅ Dashboard router loaded")
except Exception as e:
    print(f"⚠ Dashboard router error: {e}")

print("✅ All routers loading completed!")

# Test simple schema
from pydantic import BaseModel

class TestResponse(BaseModel):
    id: int
    name: str
    status: str = "active"

@app.get("/api/test", response_model=TestResponse)
def test_endpoint():
    return TestResponse(id=1, name="test", status="active")

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 بدء تشغيل خادم FastAPI الأساسي...")
    print("📍 العنوان: http://localhost:8001")
    print("📚 التوثيق: http://localhost:8001/docs")
    
    uvicorn.run(
        "basic_main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        reload_dirs=[current_dir],
        log_level="info"
    )
