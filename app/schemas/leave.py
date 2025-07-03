from pydantic import BaseModel
from datetime import date
from typing import Optional

class LeaveBase(BaseModel):
    worker_id: int
    leave_type: str
    start_date: date
    end_date: date
    notes: Optional[str]

class LeaveCreate(LeaveBase):
    pass

class LeaveUpdate(BaseModel):
    leave_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    worker_id: Optional[int] = None

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }

class Leave(LeaveBase):
    id: int
    worker_id: int

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }
