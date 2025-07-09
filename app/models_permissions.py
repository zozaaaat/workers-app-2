from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


# -----------------------------
# أذونات المستخدمين (Permissions)
# -----------------------------
class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    module = Column(String, nullable=False)  # workers, companies, licenses, etc.
    
    def __repr__(self):
        return f"<Permission(name={self.name}, module={self.module})>"


# -----------------------------
# أذونات المستخدم (User Permissions)
# -----------------------------
class UserPermission(Base):
    __tablename__ = "user_permissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)
    granted = Column(Boolean, default=True)
    granted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    granted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="user_permissions")
    permission = relationship("Permission")
    granted_by_user = relationship("User", foreign_keys=[granted_by])

    def __repr__(self):
        return f"<UserPermission(user_id={self.user_id}, permission_id={self.permission_id})>"


# -----------------------------
# طلبات الموافقة (Approval Requests)
# -----------------------------
class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # الموظف الذي قام بالعملية
    action_type = Column(String, nullable=False)  # create, update, delete
    entity_type = Column(String, nullable=False)  # worker, company, license, etc.
    entity_id = Column(Integer, nullable=True)  # معرف الكائن المتأثر
    old_data = Column(JSON, nullable=True)  # البيانات القديمة (في حالة التعديل)
    new_data = Column(JSON, nullable=False)  # البيانات الجديدة
    description = Column(Text, nullable=True)  # وصف العملية
    status = Column(String, default="pending", nullable=False)  # pending, approved, rejected
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # المدير الذي راجع الطلب
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    review_notes = Column(Text, nullable=True)  # ملاحظات المراجعة
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="approval_requests")
    reviewer = relationship("User", foreign_keys=[reviewed_by])

    def __repr__(self):
        return f"<ApprovalRequest(id={self.id}, action={self.action_type}, entity={self.entity_type}, status={self.status})>"


# -----------------------------
# سجل الأنشطة (Activity Log)
# -----------------------------
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # login, logout, create_worker, etc.
    entity_type = Column(String, nullable=True)  # worker, company, license, etc.
    entity_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activity_logs")

    def __repr__(self):
        return f"<ActivityLog(user_id={self.user_id}, action={self.action}, created_at={self.created_at})>"
