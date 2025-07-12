"""
سكريبت لإنشاء البيانات الافتراضية للنظام
يتضمن إنشاء الأدوار والصلاحيات الافتراضية
"""

from sqlalchemy.orm import Session
from app.database.base import engine, Base
from app.models import (
    Role, Permission, DEFAULT_ROLES, DEFAULT_PERMISSIONS,
    role_permissions
)

def create_default_permissions(db: Session):
    """إنشاء الصلاحيات الافتراضية"""
    print("إنشاء الصلاحيات الافتراضية...")
    
    created_count = 0
    for perm_data in DEFAULT_PERMISSIONS:
        # التحقق من وجود الصلاحية
        existing_permission = db.query(Permission).filter(
            Permission.key == perm_data['key']
        ).first()
        
        if not existing_permission:
            permission = Permission(
                key=perm_data['key'],
                name=perm_data['name'],
                category=perm_data['category'],
                module=perm_data['module'],
                is_system=True
            )
            db.add(permission)
            created_count += 1
    
    db.commit()
    print(f"تم إنشاء {created_count} صلاحية جديدة")

def create_default_roles(db: Session):
    """إنشاء الأدوار الافتراضية"""
    print("إنشاء الأدوار الافتراضية...")
    
    created_count = 0
    for role_data in DEFAULT_ROLES:
        # التحقق من وجود الدور
        existing_role = db.query(Role).filter(
            Role.name == role_data['name']
        ).first()
        
        if not existing_role:
            role = Role(
                name=role_data['name'],
                display_name=role_data['display_name'],
                description=role_data['description'],
                is_system=role_data['is_system'],
                priority=role_data['priority']
            )
            db.add(role)
            created_count += 1
    
    db.commit()
    print(f"تم إنشاء {created_count} دور جديد")

def assign_permissions_to_roles(db: Session):
    """ربط الصلاحيات بالأدوار"""
    print("ربط الصلاحيات بالأدوار...")
    
    # تعريف الصلاحيات لكل دور
    role_permission_mapping = {
        'super_admin': [p['key'] for p in DEFAULT_PERMISSIONS],  # جميع الصلاحيات
        
        'admin': [
            'employees.view', 'employees.create', 'employees.edit', 'employees.delete', 'employees.archive',
            'licenses.view', 'licenses.create', 'licenses.edit', 'licenses.delete', 'licenses.archive',
            'leaves.view', 'leaves.create', 'leaves.edit', 'leaves.approve', 'leaves.reject',
            'deductions.view', 'deductions.create', 'deductions.edit', 'deductions.delete',
            'documents.view', 'documents.upload', 'documents.download', 'documents.delete',
            'reports.view', 'reports.export', 'reports.advanced',
            'users.view', 'users.create', 'users.edit',
            'notifications.view', 'notifications.create',
            'company.view', 'company.edit', 'company.documents'
        ],
        
        'hr_manager': [
            'employees.view', 'employees.create', 'employees.edit', 'employees.archive',
            'licenses.view', 'licenses.create', 'licenses.edit', 'licenses.archive',
            'leaves.view', 'leaves.create', 'leaves.edit', 'leaves.approve', 'leaves.reject',
            'deductions.view', 'deductions.create', 'deductions.edit',
            'documents.view', 'documents.upload', 'documents.download',
            'reports.view', 'reports.export',
            'notifications.view', 'notifications.create',
            'company.view'
        ],
        
        'hr_specialist': [
            'employees.view', 'employees.create', 'employees.edit',
            'licenses.view', 'licenses.create', 'licenses.edit',
            'leaves.view', 'leaves.create', 'leaves.edit',
            'deductions.view', 'deductions.create',
            'documents.view', 'documents.upload', 'documents.download',
            'reports.view',
            'notifications.view',
            'company.view'
        ],
        
        'manager': [
            'employees.view',
            'leaves.view', 'leaves.approve', 'leaves.reject',
            'documents.view', 'documents.download',
            'reports.view',
            'notifications.view',
            'company.view'
        ],
        
        'supervisor': [
            'employees.view',
            'leaves.view',
            'documents.view', 'documents.download',
            'reports.view',
            'notifications.view',
            'company.view'
        ],
        
        'employee': [
            'employees.view',
            'leaves.view', 'leaves.create',
            'documents.view', 'documents.upload',
            'notifications.view',
            'company.view'
        ],
        
        'viewer': [
            'employees.view',
            'licenses.view',
            'leaves.view',
            'documents.view',
            'reports.view',
            'notifications.view',
            'company.view'
        ]
    }
    
    for role_name, permission_keys in role_permission_mapping.items():
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            print(f"تحذير: الدور {role_name} غير موجود")
            continue
        
        # مسح الصلاحيات الحالية
        db.execute(
            role_permissions.delete().where(role_permissions.c.role_id == role.id)
        )
        
        # إضافة الصلاحيات الجديدة
        for perm_key in permission_keys:
            permission = db.query(Permission).filter(Permission.key == perm_key).first()
            if permission:
                db.execute(
                    role_permissions.insert().values(
                        role_id=role.id,
                        permission_id=permission.id
                    )
                )
            else:
                print(f"تحذير: الصلاحية {perm_key} غير موجودة")
    
    db.commit()
    print("تم ربط الصلاحيات بالأدوار بنجاح")

def create_tables():
    """إنشاء جداول قاعدة البيانات"""
    print("إنشاء جداول قاعدة البيانات...")
    Base.metadata.create_all(bind=engine)
    print("تم إنشاء الجداول بنجاح")

def initialize_default_data():
    """تهيئة البيانات الافتراضية"""
    print("بدء تهيئة البيانات الافتراضية...")
    
    # إنشاء الجداول
    create_tables()
    
    # إنشاء جلسة قاعدة البيانات
    db = Session(bind=engine)
    
    try:
        # إنشاء الصلاحيات الافتراضية
        create_default_permissions(db)
        
        # إنشاء الأدوار الافتراضية
        create_default_roles(db)
        
        # ربط الصلاحيات بالأدوار
        assign_permissions_to_roles(db)
        
        print("تم تهيئة البيانات الافتراضية بنجاح!")
        
    except Exception as e:
        print(f"خطأ في تهيئة البيانات: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    initialize_default_data()
