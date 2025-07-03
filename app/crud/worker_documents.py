from sqlalchemy.orm import Session
from app.models_worker_document import WorkerDocument
from typing import List, Optional

def get_documents_by_worker(db: Session, worker_id: int) -> List[WorkerDocument]:
    return db.query(WorkerDocument).filter(WorkerDocument.worker_id == worker_id).all()

def create_worker_document(db: Session, worker_id: int, filename: str, filetype: str, filepath: str, description: Optional[str] = None) -> WorkerDocument:
    doc = WorkerDocument(worker_id=worker_id, filename=filename, filetype=filetype, filepath=filepath, description=description)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def delete_worker_document(db: Session, doc_id: int):
    doc = db.query(WorkerDocument).filter(WorkerDocument.id == doc_id).first()
    if doc:
        db.delete(doc)
        db.commit()
    return doc
