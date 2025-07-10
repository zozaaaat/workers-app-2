from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    model_config = {"from_attributes": True}

    message: str
    type: Optional[str] = "general"
    user_id: Optional[int] = None
    expires_at: Optional[datetime] = None
    group_key: Optional[str] = None
    archived: Optional[bool] = False
    allowed_roles: Optional[str] = None
    attachment: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    sent: Optional[bool] = False
    action_required: Optional[str] = None
    action_status: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    created_at: datetime
    read: bool
    group_key: Optional[str] = None
    archived: Optional[bool] = False
    allowed_roles: Optional[str] = None
    attachment: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    sent: Optional[bool] = False
    action_required: Optional[str] = None
    action_status: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None