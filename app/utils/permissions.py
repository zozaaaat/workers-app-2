from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from typing import Optional, Dict, Any
import json

from app.database import get_db
from app.models import User
from app.crud import permissions as crud_permissions
from app.schemas_permissions import ApprovalRequestCreate, ActionType


# إعدادات JWT
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """الحصول على المستخدم الحالي من التوكن"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user


class PermissionChecker:
    """فئة للتحقق من الأذونات وإنشاء طلبات الموافقة"""
    
    def __init__(self, action: str, entity_type: str, requires_data: bool = False):
        self.action = action
        self.entity_type = entity_type
        self.requires_data = requires_data
    
    def __call__(self, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
        """التحقق من الصلاحية أو إنشاء طلب موافقة"""
        
        # التحقق من قدرة المستخدم على تنفيذ العملية
        permission_check = crud_permissions.can_user_perform_action(
            db, current_user.id, self.action, self.entity_type
        )
        
        if not permission_check["allowed"]:
            raise HTTPException(status_code=403, detail=permission_check["message"])
        
        # إذا كانت العملية تحتاج موافقة، قم بإنشاء طلب الموافقة
        if permission_check["requires_approval"]:
            return self._create_approval_request(request, current_user, db)
        
        # إذا كانت العملية مسموحة مباشرة، قم بتسجيل النشاط
        self._log_activity(current_user, db)
        
        return {"status": "approved", "message": "العملية مسموحة"}
    
    def _create_approval_request(self, request: Request, current_user: User, db: Session):
        """إنشاء طلب موافقة"""
        try:
            # الحصول على البيانات من الطلب
            request_data = {}
            if hasattr(request, '_body'):
                body = request._body.decode('utf-8')
                if body:
                    request_data = json.loads(body)
            
            # إنشاء طلب الموافقة
            approval_request = ApprovalRequestCreate(
                action_type=ActionType(self.action),
                entity_type=self.entity_type,
                new_data=request_data,
                description=f"طلب {self.action} {self.entity_type}"
            )
            
            created_request = crud_permissions.create_approval_request(db, approval_request, current_user.id)
            
            return {
                "status": "pending_approval",
                "message": "تم إرسال طلب الموافقة للمدير",
                "request_id": created_request.id
            }
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"خطأ في إنشاء طلب الموافقة: {str(e)}")
    
    def _log_activity(self, current_user: User, db: Session):
        """تسجيل النشاط"""
        from app.schemas_permissions import ActivityLogCreate
        
        crud_permissions.create_activity_log(db, ActivityLogCreate(
            user_id=current_user.id,
            action=f"{self.action}_{self.entity_type}",
            description=f"تنفيذ عملية {self.action} على {self.entity_type}"
        ))


# مصانع الأذونات الشائعة
def require_permission(action: str, entity_type: str):
    """مصنع لإنشاء dependency للتحقق من الأذونات"""
    return PermissionChecker(action, entity_type)


# أذونات محددة للكيانات المختلفة
create_worker_permission = require_permission("create", "worker")
update_worker_permission = require_permission("update", "worker")
delete_worker_permission = require_permission("delete", "worker")

create_company_permission = require_permission("create", "company")
update_company_permission = require_permission("update", "company")
delete_company_permission = require_permission("delete", "company")

create_license_permission = require_permission("create", "license")
update_license_permission = require_permission("update", "license")
delete_license_permission = require_permission("delete", "license")
transfer_license_permission = require_permission("transfer", "license")

view_reports_permission = require_permission("view", "reports")
export_data_permission = require_permission("export", "data")


# دالة مساعدة للتحقق من الدور
def require_role(*allowed_roles):
    """التحقق من دور المستخدم"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail=f"هذه العملية متاحة فقط للأدوار: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


# أذونات الأدوار
admin_required = require_role("admin")
manager_or_admin_required = require_role("admin", "manager")


def log_user_activity(action: str, entity_type: str = None, entity_id: int = None, description: str = None):
    """Decorator لتسجيل أنشطة المستخدم"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # البحث عن المستخدم والقاعدة في المعاملات
            current_user = None
            db = None
            
            for arg in args:
                if isinstance(arg, User):
                    current_user = arg
                elif hasattr(arg, 'query'):  # Session object
                    db = arg
            
            # البحث في الكلمات المفتاحية
            for key, value in kwargs.items():
                if key == 'current_user' and isinstance(value, User):
                    current_user = value
                elif key == 'db' and hasattr(value, 'query'):
                    db = value
            
            try:
                # تنفيذ الدالة الأصلية
                result = await func(*args, **kwargs) if hasattr(func, '__await__') else func(*args, **kwargs)
                
                # تسجيل النشاط في حالة النجاح
                if current_user and db:
                    from app.schemas_permissions import ActivityLogCreate
                    
                    crud_permissions.create_activity_log(db, ActivityLogCreate(
                        user_id=current_user.id,
                        action=action,
                        entity_type=entity_type,
                        entity_id=entity_id,
                        description=description or f"تنفيذ {action}"
                    ))
                
                return result
                
            except Exception as e:
                # تسجيل الأخطاء أيضاً
                if current_user and db:
                    from app.schemas_permissions import ActivityLogCreate
                    
                    crud_permissions.create_activity_log(db, ActivityLogCreate(
                        user_id=current_user.id,
                        action=f"{action}_failed",
                        entity_type=entity_type,
                        entity_id=entity_id,
                        description=f"فشل في {action}: {str(e)}"
                    ))
                
                raise e
        
        return wrapper
    return decorator
