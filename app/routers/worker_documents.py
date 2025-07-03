from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models_worker_document import WorkerDocument
from app.crud import worker_documents
from app.schemas.worker_document import WorkerDocument as WorkerDocumentSchema
from typing import List
import os
from datetime import datetime

router = APIRouter(
    prefix="/worker_documents",
    tags=["worker_documents"]
)

UPLOAD_DIR = "uploaded_files/workers"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=WorkerDocumentSchema)
def upload_worker_document(
    worker_id: int = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    filename = f"{worker_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        buffer.write(file.file.read())
    filetype = file.content_type
    doc = worker_documents.create_worker_document(
        db, worker_id=worker_id, filename=file.filename, filetype=filetype, filepath=filepath, description=description
    )
    return doc

@router.get("/by_worker/{worker_id}", response_model=List[WorkerDocumentSchema])
def get_worker_documents(worker_id: int, db: Session = Depends(get_db)):
    return worker_documents.get_documents_by_worker(db, worker_id)

@router.delete("/{doc_id}")
def delete_worker_document(doc_id: int, db: Session = Depends(get_db)):
    doc = worker_documents.delete_worker_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # حذف الملف من النظام
    if os.path.exists(doc.filepath):
        os.remove(doc.filepath)
    return {"detail": "Deleted"}
