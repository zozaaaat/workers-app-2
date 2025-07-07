from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class WorkerDocument(Base):
    __tablename__ = "worker_documents"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    filename = Column(String, nullable=False)
    filetype = Column(String, nullable=False)  # pdf, image, excel, word, ...
    filepath = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    description = Column(String)
    doc_type = Column(String, nullable=False, default="other")  # passport, work_permit, civil_id, other

    worker = relationship("Worker", back_populates="documents")
