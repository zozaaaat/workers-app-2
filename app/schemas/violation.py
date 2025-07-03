from pydantic import BaseModel
from datetime import date
from typing import Optional

class ViolationBase(BaseModel):
    worker_id: int
    description: str
    penalty_amount: float
    date: date

class ViolationCreate(ViolationBase):
    pass

class ViolationUpdate(BaseModel):
    description: Optional[str] = None
    penalty_amount: Optional[float] = None
    date: Optional[date] = None
    worker_id: Optional[int] = None

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }

class Violation(ViolationBase):
    id: int
    worker_id: int

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }
