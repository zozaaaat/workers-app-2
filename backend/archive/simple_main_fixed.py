#!/usr/bin/env python3
"""
Simplified FastAPI app without background tasks to avoid Unicode issues
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging

# إعداد التطبيق
@asynccontextmanager
async def lifespan(app: FastAPI):
    """إدارة دورة حياة التطبيق"""
    # بدء التشغيل
    print("Starting Workers Management System...")
    yield
    # إيقاف التشغيل
    print("Shutting down Workers Management System...")

app = FastAPI(
    title="نظام إدارة العمال والرخص",
    description="نظام شامل لإدارة العمال وتتبع الرخص والوثائق",
    version="1.0.0",
    lifespan=lifespan
)

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:3001", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# إعداد ضغط البيانات
app.add_middleware(GZipMiddleware, minimum_size=1000)

# استيراد المسارات
from app.routers import auth, users, companies, employees, licenses, documents, alerts, tasks, dashboard

# تسجيل المسارات
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(licenses.router, prefix="/api/licenses", tags=["licenses"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# الصفحة الرئيسية
@app.get("/")
async def root():
    return {
        "message": "مرحباً بك في نظام إدارة العمال",
        "status": "Backend يعمل بنجاح! 🎉"
    }

# فحص الصحة
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2025-07-12T16:50:00Z"
    }
