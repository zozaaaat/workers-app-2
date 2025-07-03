from pydantic import BaseModel
from datetime import date
from typing import Optional

class EndOfServiceBase(BaseModel):
    worker_id: int
    calculated_amount: float
    calculation_date: date
    notes: Optional[str]

class EndOfServiceCreate(EndOfServiceBase):
    pass

class EndOfServiceUpdate(BaseModel):
    calculated_amount: Optional[float] = None
    calculation_date: Optional[date] = None
    notes: Optional[str] = None
    worker_id: Optional[int] = None

class EndOfService(EndOfServiceBase):
    id: int
    worker_id: int

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }
