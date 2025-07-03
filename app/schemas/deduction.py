from typing import Optional
from datetime import date
from pydantic import BaseModel

class DeductionBase(BaseModel):
    worker_id: int
    amount: float
    reason: str
    date: date

class DeductionCreate(DeductionBase):
    pass

class DeductionUpdate(BaseModel):
    amount: Optional[float] = None
    reason: Optional[str] = None
    date: Optional[date] = None
    worker_id: Optional[int] = None

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }

class Deduction(DeductionBase):
    id: int
    worker_id: int

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }
