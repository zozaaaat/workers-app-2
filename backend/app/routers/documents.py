from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from app.database.session import get_db
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

# مجلد رفع الملفات
UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[DocumentResponse])
def get_documents(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب جميع الوثائق مع الصفحات"""
    skip = (page - 1) * page_size
    documents = db.query(Document).offset(skip).limit(page_size).all()
    total = db.query(Document).count()
    
    return {
        "items": documents,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size
    }

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب وثيقة بالمعرف"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="الوثيقة غير موجودة")
    return document

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    entity_type: str = Form(...),
    entity_id: int = Form(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """رفع وثيقة جديدة"""
    
    # إنشاء مجلد للكيان إذا لم يكن موجوداً
    entity_dir = os.path.join(UPLOAD_DIR, entity_type)
    os.makedirs(entity_dir, exist_ok=True)
    
    # إنشاء اسم فريد للملف
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{entity_type}_{entity_id}_{timestamp}_{file.filename}"
    file_path = os.path.join(entity_dir, filename)
    
    # حفظ الملف
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # إنشاء سجل في قاعدة البيانات
    document = Document(
        title=title or file.filename,
        description=description,
        file_name=filename,
        file_path=file_path,
        file_size=os.path.getsize(file_path),
        mime_type=file.content_type,
        entity_type=entity_type,
        entity_id=entity_id,
        uploaded_by=current_user.id
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return document

@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: int,
    document_update: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """تحديث وثيقة"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="الوثيقة غير موجودة")
    
    for field, value in document_update.dict(exclude_unset=True).items():
        setattr(document, field, value)
    
    db.commit()
    db.refresh(document)
    return document

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف وثيقة"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="الوثيقة غير موجودة")
    
    # حذف الملف من النظام
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # حذف السجل من قاعدة البيانات
    db.delete(document)
    db.commit()
    
    return {"message": "تم حذف الوثيقة بنجاح"}

@router.get("/entity/{entity_type}/{entity_id}", response_model=List[DocumentResponse])
def get_documents_by_entity(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب الوثائق حسب الكيان"""
    documents = db.query(Document).filter(
        Document.entity_type == entity_type,
        Document.entity_id == entity_id
    ).all()
    return documents

@router.get("/search")
def search_documents(
    search: str,
    entity_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """البحث في الوثائق"""
    query = db.query(Document)
    
    # البحث في العنوان والوصف
    if search:
        query = query.filter(
            (Document.title.ilike(f"%{search}%")) |
            (Document.description.ilike(f"%{search}%"))
        )
    
    # فلترة حسب نوع الكيان
    if entity_type:
        query = query.filter(Document.entity_type == entity_type)
    
    # تطبيق الصفحات
    skip = (page - 1) * page_size
    documents = query.offset(skip).limit(page_size).all()
    total = query.count()
    
    return {
        "items": documents,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size
    }

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """تحميل وثيقة"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="الوثيقة غير موجودة")
    
    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="الملف غير موجود")
    
    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type=document.mime_type
    )
