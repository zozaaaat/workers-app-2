from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# إنشاء تطبيق FastAPI
app = FastAPI(
    title="نظام إدارة العمال - API",
    description="نظام شامل لإدارة العمال والشركات والرخص",
    version="1.0.0"
)

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# البيانات التجريبية للشركات
companies_data = [
    {
        "id": 1,
        "name": "شركة التجارة المحدودة",
        "description": "شركة رائدة في مجال التجارة والتوزيع",
        "logo": None,
        "is_active": True,
        "address": "الرياض، المملكة العربية السعودية",
        "phone": "+966501234567",
        "email": "info@trade-company.com"
    },
    {
        "id": 2,
        "name": "مؤسسة البناء والتعمير",
        "description": "متخصصون في أعمال البناء والمقاولات",
        "logo": None,
        "is_active": True,
        "address": "جدة، المملكة العربية السعودية",
        "phone": "+966507654321",
        "email": "contact@construction.com"
    },
    {
        "id": 3,
        "name": "شركة التقنية المتقدمة",
        "description": "حلول تقنية مبتكرة للأعمال",
        "logo": None,
        "is_active": True,
        "address": "الدمام، المملكة العربية السعودية",
        "phone": "+966551112233",
        "email": "info@tech-advanced.com"
    }
]

@app.get("/")
async def root():
    return {"message": "مرحباً بك في نظام إدارة العمال", "status": "Backend يعمل بنجاح! 🎉"}

@app.get("/api/v1/companies")
async def get_companies():
    return {
        "items": companies_data,
        "total": len(companies_data),
        "page": 1,
        "per_page": 10
    }

@app.get("/api/v1/companies/{company_id}")
async def get_company(company_id: int):
    for company in companies_data:
        if company["id"] == company_id:
            return company
    return {"error": "Company not found"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend API يعمل بشكل صحيح"}

if __name__ == "__main__":
    import uvicorn
    import sys
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except Exception:
            pass
    uvicorn.run(app, host="0.0.0.0", port=port)
