from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import os
import uuid
from pathlib import Path
import json

from ..database import get_db
from ..crud.license_documents import (
    license_document_crud,
    document_archive_crud,
    license_type_crud,
    archive_category_crud
)
from ..schemas.license_documents import (
    LicenseDocumentCreate,
    LicenseDocumentUpdate,
    LicenseDocumentResponse,
    DocumentArchiveCreate,
    DocumentArchiveUpdate,
    DocumentArchiveResponse,
    LicenseTypeCreate,
    LicenseTypeResponse,
    ArchiveCategoryCreate,
    ArchiveCategoryResponse,
    ArchiveTypeCreate,
    ArchiveTypeResponse,
    DocumentStatistics,
    SearchResult,
    FileUploadResponse,
    DocumentNotification
)

router = APIRouter(prefix="/api/license-documents", tags=["License Documents"])

# مجلد رفع الملفات
UPLOAD_DIR = Path("uploaded_files")
LICENSES_DIR = UPLOAD_DIR / "licenses"
ARCHIVE_DIR = UPLOAD_DIR / "archive"

# إنشاء المجلدات إذا لم تكن موجودة
LICENSES_DIR.mkdir(parents=True, exist_ok=True)
ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

def save_uploaded_file(file: UploadFile, directory: Path) -> Dict[str, str]:
    """حفظ الملف المرفوع"""
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = directory / unique_filename
    
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)
    
    return {
        "filename": unique_filename,
        "filepath": str(file_path),
        "original_filename": file.filename,
        "filetype": file.content_type or "application/octet-stream"
    }

# ============== License Documents ==============

@router.post("/licenses/{license_id}/documents", response_model=FileUploadResponse)
async def upload_license_document(
    license_id: int,
    file: UploadFile = File(...),
    document_type: str = Form(...),
    description: Optional[str] = Form(None),
    license_number: Optional[str] = Form(None),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    issuing_authority: Optional[str] = Form(None),
    license_status: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """رفع مستند ترخيص جديد"""
    try:
        # حفظ الملف
        file_data = save_uploaded_file(file, LICENSES_DIR)
        
        # إعداد بيانات المستند
        document_data = {
            **file_data,
            "document_type": document_type,
            "description": description,
            "license_number": license_number,
            "issue_date": datetime.strptime(issue_date, "%Y-%m-%d").date() if issue_date else None,
            "expiry_date": datetime.strptime(expiry_date, "%Y-%m-%d").date() if expiry_date else None,
            "issuing_authority": issuing_authority,
            "license_status": license_status
        }
        
        # إنشاء المستند في قاعدة البيانات
        license_document = license_document_crud.create_license_document(db, license_id, document_data)
        
        return FileUploadResponse(
            success=True,
            message="تم رفع المستند بنجاح",
            document_id=license_document.id,
            filename=file_data["filename"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في رفع المستند: {str(e)}"
        )

@router.get("/licenses/{license_id}/documents", response_model=List[LicenseDocumentResponse])
async def get_license_documents(license_id: int, db: Session = Depends(get_db)):
    """الحصول على جميع مستندات الترخيص"""
    return license_document_crud.get_license_documents(db, license_id)

@router.get("/documents/{document_id}", response_model=LicenseDocumentResponse)
async def get_license_document(document_id: int, db: Session = Depends(get_db)):
    """الحصول على مستند ترخيص بالمعرف"""
    document = license_document_crud.get_license_document_by_id(db, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستند غير موجود"
        )
    return document

@router.put("/documents/{document_id}", response_model=LicenseDocumentResponse)
async def update_license_document(
    document_id: int,
    document_data: LicenseDocumentUpdate,
    db: Session = Depends(get_db)
):
    """تحديث مستند ترخيص"""
    document = license_document_crud.update_license_document(
        db, document_id, document_data.dict(exclude_unset=True)
    )
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستند غير موجود"
        )
    return document

@router.delete("/documents/{document_id}")
async def delete_license_document(document_id: int, db: Session = Depends(get_db)):
    """حذف مستند ترخيص"""
    success = license_document_crud.delete_license_document(db, document_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستند غير موجود"
        )
    return {"message": "تم حذف المستند بنجاح"}

@router.get("/expiring", response_model=List[LicenseDocumentResponse])
async def get_expiring_licenses(days_ahead: int = 30, db: Session = Depends(get_db)):
    """الحصول على الرخص المنتهية الصلاحية"""
    return license_document_crud.get_expiring_licenses(db, days_ahead)

@router.get("/search", response_model=SearchResult)
async def search_documents(search_term: str, db: Session = Depends(get_db)):
    """البحث في المستندات"""
    license_documents = license_document_crud.search_license_documents(db, search_term)
    archived_documents = document_archive_crud.search_archived_documents(db, search_term)
    
    return SearchResult(
        license_documents=license_documents,
        archived_documents=archived_documents,
        total_count=len(license_documents) + len(archived_documents)
    )

# ============== Document Archive ==============

@router.post("/archive", response_model=FileUploadResponse)
async def upload_archived_document(
    file: UploadFile = File(...),
    archive_type: str = Form(...),
    category: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    contract_number: Optional[str] = Form(None),
    amount: Optional[float] = Form(None),
    currency: str = Form("EGP"),
    start_date: Optional[str] = Form(None),
    end_date: Optional[str] = Form(None),
    party_name: Optional[str] = Form(None),
    party_contact: Optional[str] = Form(None),
    payment_date: Optional[str] = Form(None),
    payment_method: Optional[str] = Form(None),
    reference_number: Optional[str] = Form(None),
    company_id: Optional[int] = Form(None),
    license_id: Optional[int] = Form(None),
    is_recurring: bool = Form(False),
    next_due_date: Optional[str] = Form(None),
    status: str = Form("active"),
    is_important: bool = Form(True),
    db: Session = Depends(get_db)
):
    """رفع مستند أرشيف جديد"""
    try:
        # حفظ الملف
        file_data = save_uploaded_file(file, ARCHIVE_DIR)
        
        # إعداد بيانات المستند
        document_data = {
            **file_data,
            "archive_type": archive_type,
            "category": category,
            "title": title,
            "description": description,
            "contract_number": contract_number,
            "amount": amount,
            "currency": currency,
            "start_date": datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else None,
            "end_date": datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else None,
            "party_name": party_name,
            "party_contact": party_contact,
            "payment_date": datetime.strptime(payment_date, "%Y-%m-%d").date() if payment_date else None,
            "payment_method": payment_method,
            "reference_number": reference_number,
            "company_id": company_id,
            "license_id": license_id,
            "is_recurring": is_recurring,
            "next_due_date": datetime.strptime(next_due_date, "%Y-%m-%d").date() if next_due_date else None,
            "status": status,
            "is_important": is_important
        }
        
        # إنشاء المستند في قاعدة البيانات
        archived_document = document_archive_crud.create_archived_document(db, document_data)
        
        return FileUploadResponse(
            success=True,
            message="تم رفع المستند للأرشيف بنجاح",
            document_id=archived_document.id,
            filename=file_data["filename"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في رفع المستند: {str(e)}"
        )

@router.get("/archive", response_model=List[DocumentArchiveResponse])
async def get_archived_documents(
    category: Optional[str] = None,
    company_id: Optional[int] = None,
    license_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """الحصول على المستندات المؤرشفة"""
    return document_archive_crud.get_archived_documents(db, category, company_id, license_id, limit)

@router.get("/archive/{document_id}", response_model=DocumentArchiveResponse)
async def get_archived_document(document_id: int, db: Session = Depends(get_db)):
    """الحصول على مستند أرشيف بالمعرف"""
    document = document_archive_crud.get_archived_document_by_id(db, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستند غير موجود"
        )
    return document

@router.put("/archive/{document_id}", response_model=DocumentArchiveResponse)
async def update_archived_document(
    document_id: int,
    document_data: DocumentArchiveUpdate,
    db: Session = Depends(get_db)
):
    """تحديث مستند أرشيف"""
    document = document_archive_crud.update_archived_document(
        db, document_id, document_data.dict(exclude_unset=True)
    )
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستند غير موجود"
        )
    return document

@router.delete("/archive/{document_id}")
async def delete_archived_document(document_id: int, db: Session = Depends(get_db)):
    """حذف مستند أرشيف"""
    success = document_archive_crud.delete_archived_document(db, document_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستند غير موجود"
        )
    return {"message": "تم حذف المستند من الأرشيف بنجاح"}

@router.get("/archive/recurring/due", response_model=List[DocumentArchiveResponse])
async def get_recurring_documents_due(due_days: int = 7, db: Session = Depends(get_db)):
    """الحصول على المستندات المتكررة المستحقة"""
    return document_archive_crud.get_recurring_documents(db, due_days)

@router.get("/archive/contracts/expiring", response_model=List[DocumentArchiveResponse])
async def get_expiring_contracts(days_ahead: int = 30, db: Session = Depends(get_db)):
    """الحصول على العقود المنتهية"""
    return document_archive_crud.get_expiring_contracts(db, days_ahead)

@router.get("/statistics", response_model=DocumentStatistics)
async def get_documents_statistics(db: Session = Depends(get_db)):
    """الحصول على إحصائيات المستندات"""
    return document_archive_crud.get_documents_statistics(db)

# ============== License Types ==============

@router.post("/license-types", response_model=LicenseTypeResponse)
async def create_license_type(
    license_type_data: LicenseTypeCreate,
    db: Session = Depends(get_db)
):
    """إنشاء نوع ترخيص جديد"""
    return license_type_crud.create_license_type(db, license_type_data.dict())

@router.get("/license-types", response_model=List[LicenseTypeResponse])
async def get_license_types(main_only: bool = False, db: Session = Depends(get_db)):
    """الحصول على أنواع الرخص"""
    return license_type_crud.get_license_types(db, main_only)

@router.get("/license-types/{parent_id}/sub-types", response_model=List[LicenseTypeResponse])
async def get_sub_license_types(parent_id: int, db: Session = Depends(get_db)):
    """الحصول على الرخص الفرعية"""
    return license_type_crud.get_sub_license_types(db, parent_id)

# ============== Archive Categories ==============

@router.post("/archive-categories", response_model=ArchiveCategoryResponse)
async def create_archive_category(
    category_data: ArchiveCategoryCreate,
    db: Session = Depends(get_db)
):
    """إنشاء فئة أرشيف جديدة"""
    return archive_category_crud.create_archive_category(db, category_data.dict())

@router.get("/archive-categories", response_model=List[ArchiveCategoryResponse])
async def get_archive_categories(db: Session = Depends(get_db)):
    """الحصول على فئات الأرشيف"""
    return archive_category_crud.get_archive_categories(db)

@router.post("/archive-types", response_model=ArchiveTypeResponse)
async def create_archive_type(
    type_data: ArchiveTypeCreate,
    db: Session = Depends(get_db)
):
    """إنشاء نوع أرشيف جديد"""
    return archive_category_crud.create_archive_type(db, type_data.dict())

@router.get("/archive-types", response_model=List[ArchiveTypeResponse])
async def get_archive_types(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    """الحصول على أنواع الأرشيف"""
    return archive_category_crud.get_archive_types(db, category_id)

# ============== Notifications ==============

@router.get("/notifications", response_model=List[DocumentNotification])
async def get_document_notifications(db: Session = Depends(get_db)):
    """الحصول على إشعارات المستندات"""
    notifications = []
    
    # إشعارات انتهاء الرخص
    expiring_licenses = license_document_crud.get_expiring_licenses(db, 30)
    for license_doc in expiring_licenses:
        notifications.append(DocumentNotification(
            id=license_doc.id,
            type="license_expiry",
            title=f"انتهاء صلاحية الترخيص {license_doc.license_number or 'غير محدد'}",
            message=f"ينتهي الترخيص في {license_doc.expiry_date}",
            due_date=license_doc.expiry_date,
            document_id=license_doc.id,
            license_id=license_doc.license_id,
            priority="high" if (license_doc.expiry_date - date.today()).days <= 7 else "medium"
        ))
    
    # إشعارات العقود المنتهية
    expiring_contracts = document_archive_crud.get_expiring_contracts(db, 30)
    for contract in expiring_contracts:
        notifications.append(DocumentNotification(
            id=contract.id,
            type="contract_expiry",
            title=f"انتهاء العقد: {contract.title}",
            message=f"ينتهي العقد في {contract.end_date}",
            due_date=contract.end_date,
            document_id=contract.id,
            company_id=contract.company_id,
            license_id=contract.license_id,
            priority="high" if (contract.end_date - date.today()).days <= 7 else "medium"
        ))
    
    # إشعارات المستندات المتكررة
    recurring_due = document_archive_crud.get_recurring_documents(db, 7)
    for doc in recurring_due:
        notifications.append(DocumentNotification(
            id=doc.id,
            type="recurring_due",
            title=f"استحقاق دفع: {doc.title}",
            message=f"يستحق الدفع في {doc.next_due_date}",
            due_date=doc.next_due_date,
            document_id=doc.id,
            company_id=doc.company_id,
            license_id=doc.license_id,
            priority="medium"
        ))
    
    # ترتيب الإشعارات حسب الأولوية والتاريخ
    notifications.sort(key=lambda x: (x.priority == "low", x.due_date))
    
    return notifications
