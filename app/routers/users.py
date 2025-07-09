from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import schemas, crud, models
from app.database import get_db
from app.schemas_permissions import UserCreate, UserOut, UserUpdate, UserRole
from app.crud import permissions as crud_permissions
from app.utils.permissions import admin_required, log_user_activity
from app.routers.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserOut])
def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على قائمة المستخدمين (المدير والأدمن فقط)"""
    # التحقق من الدور
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بعرض قائمة المستخدمين")
    
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على بيانات مستخدم معين"""
    # يمكن للمستخدم رؤية بياناته أو للمدير/الأدمن رؤية بيانات الآخرين
    if current_user.id != user_id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بعرض بيانات المستخدمين الآخرين")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    return user


@router.post("/", response_model=UserOut)
# @log_user_activity("create_user", "user")  # Temporarily disabled
def create_user(
    user: UserCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """إنشاء مستخدم جديد (الأدمن فقط)"""
    # التحقق من الدور
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="غير مصرح لك بإنشاء مستخدمين جدد")
    # التحقق من عدم تكرار اسم المستخدم والبريد
    if crud.users.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="اسم المستخدم موجود مسبقاً")
    if crud.users.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="البريد الإلكتروني موجود مسبقاً")
    
    # إنشاء المستخدم
    db_user = crud.users.create_user(
        db=db, 
        username=user.username, 
        email=user.email, 
        password=user.password, 
        role=user.role,
        full_name=user.full_name,
        department=user.department,
        created_by=current_user.id
    )
    
    # منح الأذونات المحددة
    if user.permissions:
        crud_permissions.update_user_permissions(db, db_user.id, user.permissions, current_user.id)
    
    return db_user


@router.put("/{user_id}", response_model=UserOut)
@log_user_activity("update_user", "user")
def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """تحديث بيانات مستخدم (الأدمن فقط)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    # تحديث البيانات
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field != "permissions":  # الأذونات تُحدث بشكل منفصل
            setattr(db_user, field, value)
    
    # تحديث الأذونات إذا تم تمريرها
    if user_update.permissions is not None:
        crud_permissions.update_user_permissions(db, user_id, user_update.permissions, current_user.id)
    
    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{user_id}")
@log_user_activity("delete_user", "user")
def delete_user(
    user_id: int,
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """حذف مستخدم (الأدمن فقط)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    # منع حذف الأدمن لنفسه
    if db_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="لا يمكنك حذف حسابك الخاص")
    
    # تعطيل المستخدم بدلاً من الحذف
    db_user.is_active = False
    db.commit()
    
    return {"detail": "تم تعطيل المستخدم بنجاح"}


@router.post("/{user_id}/activate")
@log_user_activity("activate_user", "user")
def activate_user(
    user_id: int,
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """تفعيل مستخدم (الأدمن فقط)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    db_user.is_active = True
    db.commit()
    
    return {"detail": "تم تفعيل المستخدم بنجاح"}


@router.get("/{user_id}/permissions")
def get_user_permissions(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على أذونات مستخدم معين"""
    # يمكن للمستخدم رؤية أذوناته أو للمدير/الأدمن رؤية أذونات الآخرين
    if current_user.id != user_id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="غير مصرح لك بعرض أذونات المستخدمين الآخرين")
    
    permissions = crud_permissions.get_user_permissions(db, user_id)
    return {"user_id": user_id, "permissions": permissions}


@router.post("/{user_id}/permissions")
@log_user_activity("grant_permissions", "user")
def update_user_permissions(
    user_id: int,
    permission_ids: List[int],
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """تحديث أذونات مستخدم (الأدمن فقط)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    crud_permissions.update_user_permissions(db, user_id, permission_ids, current_user.id)
    
    return {"detail": "تم تحديث أذونات المستخدم بنجاح"}


@router.get("/roles/available")
def get_available_roles(current_user: models.User = Depends(admin_required)):
    """الحصول على الأدوار المتاحة (الأدمن فقط)"""
    return {
        "roles": [
            {"value": "admin", "label": "مدير النظام", "description": "صلاحيات كاملة"},
            {"value": "manager", "label": "مدير", "description": "إدارة العمليات والموافقات"},
            {"value": "employee", "label": "موظف", "description": "صلاحيات محدودة حسب التخصيص"}
        ]
    }
