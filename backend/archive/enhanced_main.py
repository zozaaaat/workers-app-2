import sys
import os

# إضافة المجلد الحالي إلى مسار البحث
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware

# إنشاء تطبيق FastAPI
app = FastAPI(
    title="نظام إدارة العمال والرخص المحسن",
    description="نظام شامل لإدارة العمال والرخص والوثائق مع تحسينات أمنية",
    version="2.0.0"
)

# إضافة middleware أساسي
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# البيانات التجريبية
companies_data = [
    {
        "id": 1,
        "name": "شركة البناء المتقدم",
        "email": "info@advanced-build.com",
        "phone": "966501234567",
        "address": "الرياض، المملكة العربية السعودية",
        "license_number": "CR1234567890",
        "employees_count": 150,
        "status": "active"
    },
    {
        "id": 2,
        "name": "مؤسسة التشييد الحديث",
        "email": "contact@modern-construction.com",
        "phone": "966507654321",
        "address": "جدة، المملكة العربية السعودية",
        "license_number": "CR0987654321",
        "employees_count": 89,
        "status": "active"
    }
]

employees_data = [
    {
        "id": 1,
        "name": "أحمد محمد علي",
        "position": "مهندس مدني",
        "department": "الهندسة",
        "email": "ahmed.ali@company.com",
        "phone": "966501111111",
        "company_id": 1,
        "hire_date": "2023-01-15",
        "salary": 8000,
        "status": "active"
    },
    {
        "id": 2,
        "name": "فاطمة أحمد النجار",
        "position": "محاسبة",
        "department": "المالية",
        "email": "fatima.najjar@company.com",
        "phone": "966502222222",
        "company_id": 1,
        "hire_date": "2023-03-01",
        "salary": 6500,
        "status": "active"
    }
]

tasks_data = [
    {
        "id": 1,
        "title": "مراجعة رخص العمل",
        "description": "مراجعة جميع رخص العمل المنتهية الصلاحية",
        "assigned_to": "أحمد محمد علي",
        "priority": "high",
        "status": "in_progress",
        "due_date": "2025-01-20",
        "created_at": "2025-01-10"
    },
    {
        "id": 2,
        "title": "تحديث بيانات الموظفين",
        "description": "تحديث معلومات الاتصال لجميع الموظفين",
        "assigned_to": "فاطمة أحمد النجار",
        "priority": "medium",
        "status": "pending",
        "due_date": "2025-01-25",
        "created_at": "2025-01-08"
    }
]

# نقاط النهاية الأساسية
@app.get("/")
def read_root():
    return {"message": "نظام إدارة العمال والرخص المحسن", "version": "2.0.0", "status": "enhanced"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "النظام يعمل بشكل طبيعي", "features": ["enhanced_security", "caching", "background_tasks"]}

@app.get("/api/companies")
def get_companies():
    return {"companies": companies_data, "total": len(companies_data)}

@app.get("/api/employees")
def get_employees():
    return {"employees": employees_data, "total": len(employees_data)}

@app.get("/api/tasks")
def get_tasks():
    return {"tasks": tasks_data, "total": len(tasks_data)}

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    return {
        "total_companies": len(companies_data),
        "total_employees": len(employees_data),
        "total_tasks": len(tasks_data),
        "active_companies": len([c for c in companies_data if c["status"] == "active"]),
        "active_employees": len([e for e in employees_data if e["status"] == "active"]),
        "pending_tasks": len([t for t in tasks_data if t["status"] == "pending"]),
        "system_status": "enhanced",
        "last_updated": "2025-01-10T12:00:00Z"
    }

# محاكاة تسجيل الدخول
@app.post("/api/auth/login")
def login(credentials: dict):
    # محاكاة بسيطة لتسجيل الدخول
    if credentials.get("username") == "admin" and credentials.get("password") == "admin123":
        return {
            "access_token": "mock_token_12345",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "username": "admin",
                "name": "المدير العام",
                "role": "admin"
            }
        }
    return {"error": "Invalid credentials"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
