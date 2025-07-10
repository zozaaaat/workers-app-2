
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models_worker_document import WorkerDocument
from app.schemas.worker_document import WorkerDocument as WorkerDocumentSchema

router = APIRouter(prefix="/worker_documents", tags=["worker_documents"])

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
                "upload_date": str(doc.upload_date) if doc.upload_date else None
            })
        return result
    except Exception as e:
        return {"error": str(e), "docs": []}

# باقي endpoints (مع المصادقة)  
# ... (يمكن الاحتفاظ بباقي الكود كما هو)
