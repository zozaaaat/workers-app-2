from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models_worker_document import WorkerDocument
from app.schemas.worker_document import WorkerDocument as WorkerDocumentSchema

router = APIRouter(prefix="/worker_documents", tags=["worker_documents"])

# Endpoints عامة (بدون مصادقة) - يجب أن تكون أولاً
@router.get("/api/docs/{worker_id}")
def get_worker_docs_public(worker_id: int, db: Session = Depends(get_db)):
    """مستندات العامل - عام"""
    try:
        docs = db.query(WorkerDocument).filter(WorkerDocument.worker_id == worker_id).all()
        result = []
        for doc in docs:
            result.append({
                "id": doc.id,
                "filename": doc.filename,
                "filetype": doc.filetype,
                "description": doc.description or "",
                "doc_type": doc.doc_type or "other",
                "upload_date": str(doc.uploaded_at) if doc.uploaded_at else None
            })
        return result
    except Exception as e:
        return {"error": str(e), "docs": []}

@router.get("/quick-docs/{worker_id}")
def get_docs_quick_fix(worker_id: int, db: Session = Depends(get_db)):
    """إصلاح سريع - مستندات العامل"""
    try:
        docs = db.query(WorkerDocument).filter(WorkerDocument.worker_id == worker_id).all()
        result = []
        for doc in docs:
            result.append({
                "id": doc.id,
                "filename": doc.filename,
                "filetype": doc.filetype,
                "description": doc.description or "",
                "doc_type": doc.doc_type or "other",
                "upload_date": str(doc.uploaded_at) if doc.uploaded_at else None
            })
        return {"success": True, "docs": result}
    except Exception as e:
        return {"success": False, "error": str(e), "docs": []}

@router.get("/public/worker/{worker_id}/documents")
def get_public_worker_documents(worker_id: int, db: Session = Depends(get_db)):
    """مستندات العامل - عام مبسط"""
    try:
        docs = db.query(WorkerDocument).filter(WorkerDocument.worker_id == worker_id).all()
        return [
            {
                "id": doc.id,
                "filename": doc.filename,
                "doc_type": doc.doc_type or "other",
                "description": doc.description or ""
            }
            for doc in docs
        ]
    except Exception as e:
        return {"error": str(e)}

@router.get("/test/{worker_id}")
def test_worker_documents(worker_id: int):
    """اختبار بسيط للـ endpoint"""
    return {"message": f"Worker {worker_id} documents endpoint", "status": "test_success"}

# باقي endpoints (مع المصادقة)
# يمكن إضافة endpoints أخرى حسب الحاجة
