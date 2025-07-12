from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.base import Base

class AlertType(enum.Enum):
    LICENSE_EXPIRY = "license_expiry"
    DOCUMENT_EXPIRY = "document_expiry"
    CONTRACT_EXPIRY = "contract_expiry"
    BIRTHDAY = "birthday"
    SYSTEM = "system"
    WARNING = "warning"
    INFO = "info"

class AlertPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(Enum(AlertType), nullable=False)
    priority = Column(Enum(AlertPriority), default=AlertPriority.MEDIUM)
    
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    
    # التاريخ المرتبط بالتنبيه (مثل تاريخ انتهاء الرخصة)
    related_date = Column(Date)
    
    # Foreign Keys (واحد منهم فقط يجب أن يكون مملوء)
    company_id = Column(Integer, ForeignKey("companies.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    license_id = Column(Integer, ForeignKey("licenses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    company = relationship("Company")
    employee = relationship("Employee", back_populates="alerts")
    license = relationship("License", back_populates="alerts")
    user = relationship("User")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Alert(title='{self.title}', type='{self.alert_type}', priority='{self.priority}')>"
