from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import companies, licenses, workers, leaves, deductions, violations, end_of_service, auth, activity_log
from .routers import absences, worker_documents
from app import models
from app.database import engine

# إنشاء جميع الجداول حسب الـ models المعرفة
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Workers Management API")

# إعدادات CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # يمكنك تخصيص الدومين هنا
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router, prefix="/companies", tags=["Companies"])
app.include_router(licenses.router, prefix="/licenses", tags=["Licenses"])
app.include_router(workers.router, prefix="/workers", tags=["Workers"])
app.include_router(leaves.router, prefix="/leaves", tags=["Leaves"])
app.include_router(deductions.router, prefix="/deductions", tags=["Deductions"])
app.include_router(violations.router, prefix="/violations", tags=["Violations"])
app.include_router(end_of_service.router, prefix="/endofservice", tags=["EndOfService"])
app.include_router(activity_log.router)
app.include_router(auth.router)
app.include_router(absences.router)
app.include_router(worker_documents.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Workers Management API"}
