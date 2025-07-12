#!/usr/bin/env python3
"""
خادم FastAPI مبسط جداً للاختبار - بدون قاعدة بيانات
"""

import sys
import os

# إضافة مجلد backend إلى path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

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

# Basic schemas
class HealthResponse(BaseModel):
    status: str
    message: str

class CompanyResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool = True

# Mock data
companies_data = [
    {"id": 1, "name": "شركة التجارة المحدودة", "email": "info@trade.com", "phone": "+966123456789", "is_active": True},
    {"id": 2, "name": "شركة البناء والتعمير", "email": "contact@construction.com", "phone": "+966987654321", "is_active": True},
    {"id": 3, "name": "مؤسسة الخدمات اللوجستية", "email": "services@logistics.com", "phone": "+966555666777", "is_active": True},
]

users_data = [
    {"id": 1, "username": "admin", "email": "admin@system.com", "full_name": "مدير النظام", "is_active": True},
    {"id": 2, "username": "manager", "email": "manager@company.com", "full_name": "مدير الشركة", "is_active": True},
]

# Basic endpoints
@app.get("/")
def read_root():
    return {"message": "نظام إدارة العمال والرخص", "version": "2.0.0", "status": "working"}

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="healthy", message="النظام يعمل بشكل طبيعي")

@app.get("/api/ping")
def ping():
    return {"pong": True, "timestamp": "2025-07-12"}

# Companies endpoints
@app.get("/api/companies/", response_model=List[CompanyResponse])
def get_companies():
    return [CompanyResponse(**company) for company in companies_data]

@app.get("/api/companies/{company_id}", response_model=CompanyResponse)
def get_company(company_id: int):
    for company in companies_data:
        if company["id"] == company_id:
            return CompanyResponse(**company)
    return {"error": "Company not found"}

# Users endpoints
@app.get("/api/users/", response_model=List[UserResponse])
def get_users():
    return [UserResponse(**user) for user in users_data]

@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    for user in users_data:
        if user["id"] == user_id:
            return UserResponse(**user)
    return {"error": "User not found"}

# Dashboard endpoints
@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    return {
        "total_companies": len(companies_data),
        "total_users": len(users_data),
        "active_companies": len([c for c in companies_data if c["is_active"]]),
        "active_users": len([u for u in users_data if u["is_active"]]),
        "system_status": "operational"
    }

# Test endpoint
@app.get("/api/test")
def test_endpoint():
    return {
        "id": 1, 
        "name": "test", 
        "status": "active",
        "message": "Test endpoint working"
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 بدء تشغيل خادم FastAPI المبسط...")
    print("📍 العنوان: http://localhost:8002")
    print("📚 التوثيق: http://localhost:8002/docs")
    print("✅ لا توجد قاعدة بيانات - اختبار فقط")
    
    uvicorn.run(
        "simple_test_main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        reload_dirs=[current_dir],
        log_level="info"
    )
