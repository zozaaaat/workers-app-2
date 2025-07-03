from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Absence(Base):
    __tablename__ = "absences"
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    date = Column(Date, nullable=False)
    reason = Column(String, nullable=True)
    is_excused = Column(Boolean, default=False)
    deduction_id = Column(Integer, ForeignKey("deductions.id"), nullable=True)

    worker = relationship("Worker", back_populates="absences")
    deduction = relationship("Deduction", back_populates="absence")
