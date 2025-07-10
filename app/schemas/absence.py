from pydantic import BaseModel
from datetime import date
from typing import Optional

class AbsenceBase(BaseModel):
    worker_id: int
    date: date
    reason: Optional[str] = None
    is_excused: bool = False

class AbsenceCreate(AbsenceBase):
    pass

class AbsenceUpdate(AbsenceBase):
    pass

class AbsenceInDB(AbsenceBase):
    model_config = {"from_attributes": True}
    id: int
    deduction_id: Optional[int]

class AbsenceOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    worker_id: int
    date: date
    reason: Optional[str] = None
    is_excused: bool = False
    deduction_id: Optional[int]
    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
    }
