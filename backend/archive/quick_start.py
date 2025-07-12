#!/usr/bin/env python3
"""
تشغيل سيرفر FastAPI بدون مهام خلفية
"""
import uvicorn
import sys
import os

# إضافة المجلد للمسار
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def create_simple_app():
    """إنشاء تطبيق FastAPI مبسط"""
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(
        title="نظام إدارة العمال",
        description="نظام إدارة العمال والرخص",
        version="1.0.0"
    )
    
    # إعداد CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {
            "message": "Backend works!",
            "status": "OK"
        }
    
    @app.get("/health")
    async def health():
        return {"status": "healthy"}
    
    @app.get("/api/auth/me")
    async def get_current_user():
        # مؤقت - إرجاع مستخدم وهمي
        return {
            "id": 1,
            "username": "admin",
            "email": "admin@example.com",
            "name": "المدير",
            "is_active": True,
            "role": "admin"
        }
    
    @app.post("/api/auth/login")
    async def login(credentials: dict):
        # مؤقت - قبول أي بيانات دخول
        return {
            "access_token": "fake-jwt-token-12345",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "username": credentials.get("username", "admin"),
                "email": "admin@example.com",
                "name": "المدير",
                "is_active": True,
                "role": "admin"
            }
        }
    
    @app.post("/api/auth/logout")
    async def logout():
        return {"message": "تم تسجيل الخروج بنجاح"}
    
    @app.get("/api/companies")
    async def get_companies():
        # مؤقت - إرجاع شركات وهمية
        return {
            "items": [
                {
                    "id": 1,
                    "name": "شركة الاختبار",
                    "email": "test@company.com",
                    "is_active": True
                }
            ],
            "total": 1,
            "page": 1,
            "page_size": 20
        }
    
    @app.get("/api/companies/{company_id}")
    async def get_company(company_id: int):
        # مؤقت - إرجاع شركة واحدة
        return {
            "id": company_id,
            "name": "شركة الاختبار",
            "email": "test@company.com",
            "phone": "+966501234567",
            "is_active": True,
            "license_number": "12345",
            "description": "شركة متخصصة في إدارة العمال",
            "created_at": "2024-01-01T00:00:00Z"
        }
    
    return app

if __name__ == "__main__":
    app = create_simple_app()
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002,
        reload=False
    )
