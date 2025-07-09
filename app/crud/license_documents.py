from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict
from datetime import datetime, date, timedelta
import json
import os
import shutil
from pathlib import Path

from ..models_license_document import LicenseDocument, LicenseType, DocumentArchive, ArchiveCategory, ArchiveType
from ..models import License, Company

class LicenseDocumentCRUD:
    
    def create_license_document(self, db: Session, license_id: int, file_data: Dict) -> LicenseDocument:
        """إنشاء مستند ترخيص جديد"""
        license_document = LicenseDocument(
            license_id=license_id,
            filename=file_data["filename"],
            original_filename=file_data["original_filename"],
            filepath=file_data["filepath"],
            filetype=file_data["filetype"],
            document_type=file_data["document_type"],
            description=file_data.get("description"),
            extracted_text=file_data.get("extracted_text"),
            license_number=file_data.get("license_number"),
            issue_date=file_data.get("issue_date"),
            expiry_date=file_data.get("expiry_date"),
            issuing_authority=file_data.get("issuing_authority"),
            license_status=file_data.get("license_status")
        )
        db.add(license_document)
        db.commit()
        db.refresh(license_document)
        return license_document
    
    def get_license_documents(self, db: Session, license_id: int) -> List[LicenseDocument]:
        """الحصول على جميع مستندات الترخيص"""
        return db.query(LicenseDocument).filter(LicenseDocument.license_id == license_id).order_by(desc(LicenseDocument.upload_date)).all()
    
    def get_license_document_by_id(self, db: Session, document_id: int) -> Optional[LicenseDocument]:
        """الحصول على مستند ترخيص بالمعرف"""
        return db.query(LicenseDocument).filter(LicenseDocument.id == document_id).first()
    
    def update_license_document(self, db: Session, document_id: int, update_data: Dict) -> Optional[LicenseDocument]:
        """تحديث مستند ترخيص"""
        document = db.query(LicenseDocument).filter(LicenseDocument.id == document_id).first()
        if document:
            for key, value in update_data.items():
                setattr(document, key, value)
            db.commit()
            db.refresh(document)
        return document
    
    def delete_license_document(self, db: Session, document_id: int) -> bool:
        """حذف مستند ترخيص"""
        document = db.query(LicenseDocument).filter(LicenseDocument.id == document_id).first()
        if document:
            # حذف الملف من النظام
            if os.path.exists(document.filepath):
                os.remove(document.filepath)
            db.delete(document)
            db.commit()
            return True
        return False
    
    def get_expiring_licenses(self, db: Session, days_ahead: int = 30) -> List[LicenseDocument]:
        """الحصول على الرخص المنتهية الصلاحية"""
        expiry_date = date.today() + timedelta(days=days_ahead)
        return db.query(LicenseDocument).filter(
            and_(
                LicenseDocument.expiry_date.isnot(None),
                LicenseDocument.expiry_date <= expiry_date
            )
        ).order_by(asc(LicenseDocument.expiry_date)).all()
    
    def search_license_documents(self, db: Session, search_term: str) -> List[LicenseDocument]:
        """البحث في مستندات الرخص"""
        return db.query(LicenseDocument).filter(
            or_(
                LicenseDocument.original_filename.contains(search_term),
                LicenseDocument.description.contains(search_term),
                LicenseDocument.license_number.contains(search_term),
                LicenseDocument.issuing_authority.contains(search_term)
            )
        ).order_by(desc(LicenseDocument.upload_date)).all()

class DocumentArchiveCRUD:
    
    def create_archived_document(self, db: Session, document_data: Dict) -> DocumentArchive:
        """إنشاء مستند أرشيف جديد"""
        archived_document = DocumentArchive(
            filename=document_data["filename"],
            original_filename=document_data["original_filename"],
            filepath=document_data["filepath"],
            filetype=document_data["filetype"],
            archive_type=document_data["archive_type"],
            category=document_data["category"],
            title=document_data["title"],
            description=document_data.get("description"),
            contract_number=document_data.get("contract_number"),
            amount=document_data.get("amount"),
            currency=document_data.get("currency", "EGP"),
            start_date=document_data.get("start_date"),
            end_date=document_data.get("end_date"),
            party_name=document_data.get("party_name"),
            party_contact=document_data.get("party_contact"),
            payment_date=document_data.get("payment_date"),
            payment_method=document_data.get("payment_method"),
            reference_number=document_data.get("reference_number"),
            company_id=document_data.get("company_id"),
            license_id=document_data.get("license_id"),
            is_recurring=document_data.get("is_recurring", False),
            next_due_date=document_data.get("next_due_date"),
            status=document_data.get("status", "active"),
            is_important=document_data.get("is_important", True)
        )
        db.add(archived_document)
        db.commit()
        db.refresh(archived_document)
        return archived_document
    
    def get_archived_documents(self, db: Session, category: str = None, company_id: int = None, 
                             license_id: int = None, limit: int = 100) -> List[DocumentArchive]:
        """الحصول على المستندات المؤرشفة"""
        query = db.query(DocumentArchive)
        
        if category:
            query = query.filter(DocumentArchive.category == category)
        if company_id:
            query = query.filter(DocumentArchive.company_id == company_id)
        if license_id:
            query = query.filter(DocumentArchive.license_id == license_id)
        
        return query.order_by(desc(DocumentArchive.upload_date)).limit(limit).all()
    
    def get_archived_document_by_id(self, db: Session, document_id: int) -> Optional[DocumentArchive]:
        """الحصول على مستند أرشيف بالمعرف"""
        return db.query(DocumentArchive).filter(DocumentArchive.id == document_id).first()
    
    def update_archived_document(self, db: Session, document_id: int, update_data: Dict) -> Optional[DocumentArchive]:
        """تحديث مستند أرشيف"""
        document = db.query(DocumentArchive).filter(DocumentArchive.id == document_id).first()
        if document:
            for key, value in update_data.items():
                setattr(document, key, value)
            db.commit()
            db.refresh(document)
        return document
    
    def delete_archived_document(self, db: Session, document_id: int) -> bool:
        """حذف مستند أرشيف"""
        document = db.query(DocumentArchive).filter(DocumentArchive.id == document_id).first()
        if document:
            # حذف الملف من النظام
            if os.path.exists(document.filepath):
                os.remove(document.filepath)
            db.delete(document)
            db.commit()
            return True
        return False
    
    def get_recurring_documents(self, db: Session, due_days: int = 7) -> List[DocumentArchive]:
        """الحصول على المستندات المتكررة المستحقة"""
        due_date = date.today() + timedelta(days=due_days)
        return db.query(DocumentArchive).filter(
            and_(
                DocumentArchive.is_recurring == True,
                DocumentArchive.next_due_date.isnot(None),
                DocumentArchive.next_due_date <= due_date,
                DocumentArchive.status == "active"
            )
        ).order_by(asc(DocumentArchive.next_due_date)).all()
    
    def get_expiring_contracts(self, db: Session, days_ahead: int = 30) -> List[DocumentArchive]:
        """الحصول على العقود المنتهية"""
        expiry_date = date.today() + timedelta(days=days_ahead)
        return db.query(DocumentArchive).filter(
            and_(
                DocumentArchive.category == "contracts",
                DocumentArchive.end_date.isnot(None),
                DocumentArchive.end_date <= expiry_date,
                DocumentArchive.status == "active"
            )
        ).order_by(asc(DocumentArchive.end_date)).all()
    
    def search_archived_documents(self, db: Session, search_term: str) -> List[DocumentArchive]:
        """البحث في المستندات المؤرشفة"""
        return db.query(DocumentArchive).filter(
            or_(
                DocumentArchive.title.contains(search_term),
                DocumentArchive.description.contains(search_term),
                DocumentArchive.contract_number.contains(search_term),
                DocumentArchive.party_name.contains(search_term),
                DocumentArchive.reference_number.contains(search_term)
            )
        ).order_by(desc(DocumentArchive.upload_date)).all()
    
    def get_documents_statistics(self, db: Session) -> Dict:
        """الحصول على إحصائيات المستندات"""
        stats = {}
        
        # إجمالي المستندات
        stats["total_documents"] = db.query(DocumentArchive).count()
        
        # المستندات حسب الفئة
        stats["by_category"] = db.query(
            DocumentArchive.category, 
            func.count(DocumentArchive.id)
        ).group_by(DocumentArchive.category).all()
        
        # المستندات المتكررة المستحقة
        stats["recurring_due"] = db.query(DocumentArchive).filter(
            and_(
                DocumentArchive.is_recurring == True,
                DocumentArchive.next_due_date <= date.today() + timedelta(days=7)
            )
        ).count()
        
        # العقود المنتهية قريباً
        stats["expiring_contracts"] = db.query(DocumentArchive).filter(
            and_(
                DocumentArchive.category == "contracts",
                DocumentArchive.end_date <= date.today() + timedelta(days=30)
            )
        ).count()
        
        return stats

class LicenseTypeCRUD:
    
    def create_license_type(self, db: Session, type_data: Dict) -> LicenseType:
        """إنشاء نوع ترخيص جديد"""
        license_type = LicenseType(**type_data)
        db.add(license_type)
        db.commit()
        db.refresh(license_type)
        return license_type
    
    def get_license_types(self, db: Session, main_only: bool = False) -> List[LicenseType]:
        """الحصول على أنواع الرخص"""
        query = db.query(LicenseType).filter(LicenseType.is_active == True)
        if main_only:
            query = query.filter(LicenseType.is_main_license == True)
        return query.all()
    
    def get_sub_license_types(self, db: Session, parent_id: int) -> List[LicenseType]:
        """الحصول على الرخص الفرعية"""
        return db.query(LicenseType).filter(
            and_(
                LicenseType.parent_license_type_id == parent_id,
                LicenseType.is_active == True
            )
        ).all()

class ArchiveCategoryCRUD:
    
    def create_archive_category(self, db: Session, category_data: Dict) -> ArchiveCategory:
        """إنشاء فئة أرشيف جديدة"""
        category = ArchiveCategory(**category_data)
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
    
    def get_archive_categories(self, db: Session) -> List[ArchiveCategory]:
        """الحصول على فئات الأرشيف"""
        return db.query(ArchiveCategory).filter(ArchiveCategory.is_active == True).all()
    
    def create_archive_type(self, db: Session, type_data: Dict) -> ArchiveType:
        """إنشاء نوع أرشيف جديد"""
        archive_type = ArchiveType(**type_data)
        db.add(archive_type)
        db.commit()
        db.refresh(archive_type)
        return archive_type
    
    def get_archive_types(self, db: Session, category_id: int = None) -> List[ArchiveType]:
        """الحصول على أنواع الأرشيف"""
        query = db.query(ArchiveType).filter(ArchiveType.is_active == True)
        if category_id:
            query = query.filter(ArchiveType.category_id == category_id)
        return query.all()

# تصدير الكلاسات
license_document_crud = LicenseDocumentCRUD()
document_archive_crud = DocumentArchiveCRUD()
license_type_crud = LicenseTypeCRUD()
archive_category_crud = ArchiveCategoryCRUD()
