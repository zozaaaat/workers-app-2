from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class AlertType(str, Enum):
    LICENSE_EXPIRY = "license_expiry"
    DOCUMENT_MISSING = "document_missing"
    SYSTEM = "system"
    WARNING = "warning"
    INFO = "info"

class AlertBase(BaseModel):
    title: str
    message: str
    alert_type: AlertType
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    is_read: bool = False
    priority: Optional[str] = "medium"  # low, medium, high

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    alert_type: Optional[AlertType] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    is_read: Optional[bool] = None
    priority: Optional[str] = None

class AlertResponse(AlertBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
