from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WorkerDocumentBase(BaseModel):
    filename: str
    filetype: str
    description: Optional[str] = None
    doc_type: str

class WorkerDocumentCreate(WorkerDocumentBase):
    pass

class WorkerDocument(WorkerDocumentBase):
    id: int
    worker_id: int
    filepath: str
    uploaded_at: datetime

    class Config:
        orm_mode = True
