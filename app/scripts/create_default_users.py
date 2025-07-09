from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.crud import users as crud_users
from app.crud import permissions as crud_permissions
from app.models import User
from app.schemas_permissions import UserRole


def create_admin_user():
    """إنشاء مستخدم أدمن افتراضي"""
    
    db = SessionLocal()
    
    try:
        # التحقق من وجود مستخدم أدمن
        existing_admin = db.query(User).filter(User.role == "admin").first()
        
        if existing_admin:
            print(f"يوجد مستخدم أدمن بالفعل: {existing_admin.username}")
            return existing_admin
        
        # إنشاء مستخدم أدمن جديد
        admin_user = crud_users.create_user(
            db=db,
            username="admin",
            email="admin@company.com",
            password="admin123",  # يجب تغييرها في الإنتاج
            role="admin",
            full_name="مدير النظام",
            department="IT"
        )
        
        print(f"تم إنشاء مستخدم الأدمن: {admin_user.username}")
        print(f"البريد الإلكتروني: {admin_user.email}")
        print("كلمة المرور: admin123")
        print("*** يرجى تغيير كلمة المرور بعد أول تسجيل دخول ***")
        
        # منح جميع الأذونات للأدمن
        all_permissions = crud_permissions.get_permissions(db)
        permission_ids = [perm.id for perm in all_permissions]
        
        if permission_ids:
            crud_permissions.update_user_permissions(db, admin_user.id, permission_ids, admin_user.id)
            print(f"تم منح {len(permission_ids)} إذن للأدمن")
        
        return admin_user
        
    except Exception as e:
        print(f"خطأ في إنشاء مستخدم الأدمن: {e}")
        db.rollback()
        return None
    finally:
        db.close()


def create_manager_user():
    """إنشاء مستخدم مدير افتراضي للاختبار"""
    
    db = SessionLocal()
    
    try:
        # التحقق من وجود مستخدم مدير
        existing_manager = db.query(User).filter(User.username == "manager").first()
        
        if existing_manager:
            print(f"يوجد مستخدم مدير بالفعل: {existing_manager.username}")
            return existing_manager
        
        # إنشاء مستخدم مدير جديد
        manager_user = crud_users.create_user(
            db=db,
            username="manager",
            email="manager@company.com",
            password="manager123",
            role="manager",
            full_name="مدير العمليات",
            department="HR"
        )
        
        print(f"تم إنشاء مستخدم المدير: {manager_user.username}")
        print(f"البريد الإلكتروني: {manager_user.email}")
        print("كلمة المرور: manager123")
        
        # منح أذونات المدير
        manager_permissions = [
            "view_worker", "create_worker", "update_worker", "transfer_worker",
            "view_company", "create_company", "update_company",
            "view_license", "create_license", "update_license", "transfer_license",
            "view_leave", "create_leave", "update_leave", "delete_leave",
            "view_deduction", "create_deduction", "update_deduction", "delete_deduction",
            "view_violation", "create_violation", "update_violation", "delete_violation",
            "calculate_end_of_service", "view_end_of_service", "update_end_of_service",
            "view_reports", "export_data", "print_reports",
            "view_activity_logs", "view_user_activities",
            "send_notification", "view_notifications"
        ]
        
        permission_ids = []
        for perm_name in manager_permissions:
            permission = crud_permissions.get_permission_by_name(db, perm_name)
            if permission:
                permission_ids.append(permission.id)
        
        if permission_ids:
            crud_permissions.update_user_permissions(db, manager_user.id, permission_ids, 1)  # منح بواسطة الأدمن
            print(f"تم منح {len(permission_ids)} إذن للمدير")
        
        return manager_user
        
    except Exception as e:
        print(f"خطأ في إنشاء مستخدم المدير: {e}")
        db.rollback()
        return None
    finally:
        db.close()


def create_employee_user():
    """إنشاء مستخدم موظف افتراضي للاختبار"""
    
    db = SessionLocal()
    
    try:
        # التحقق من وجود مستخدم موظف
        existing_employee = db.query(User).filter(User.username == "employee").first()
        
        if existing_employee:
            print(f"يوجد مستخدم موظف بالفعل: {existing_employee.username}")
            return existing_employee
        
        # إنشاء مستخدم موظف جديد
        employee_user = crud_users.create_user(
            db=db,
            username="employee",
            email="employee@company.com",
            password="employee123",
            role="employee",
            full_name="موظف اختبار",
            department="Operations"
        )
        
        print(f"تم إنشاء مستخدم الموظف: {employee_user.username}")
        print(f"البريد الإلكتروني: {employee_user.email}")
        print("كلمة المرور: employee123")
        
        # منح أذونات أساسية للموظف
        employee_permissions = [
            "view_worker", "view_company", "view_license",
            "view_leave", "view_deduction", "view_violation",
            "view_end_of_service", "view_reports"
        ]
        
        permission_ids = []
        for perm_name in employee_permissions:
            permission = crud_permissions.get_permission_by_name(db, perm_name)
            if permission:
                permission_ids.append(permission.id)
        
        if permission_ids:
            crud_permissions.update_user_permissions(db, employee_user.id, permission_ids, 1)  # منح بواسطة الأدمن
            print(f"تم منح {len(permission_ids)} إذن للموظف")
        
        return employee_user
        
    except Exception as e:
        print(f"خطأ في إنشاء مستخدم الموظف: {e}")
        db.rollback()
        return None
    finally:
        db.close()


if __name__ == "__main__":
    print("إنشاء المستخدمين الافتراضيين...")
    print("="*50)
    
    # إنشاء الأدمن
    admin = create_admin_user()
    
    print("\n" + "="*30)
    
    # إنشاء المدير
    manager = create_manager_user()
    
    print("\n" + "="*30)
    
    # إنشاء الموظف
    employee = create_employee_user()
    
    print("\n" + "="*50)
    print("تم إنهاء إنشاء المستخدمين!")
    print("\nمعلومات تسجيل الدخول:")
    print("الأدمن: admin / admin123")
    print("المدير: manager / manager123") 
    print("الموظف: employee / employee123")
    print("\n*** يرجى تغيير كلمات المرور في بيئة الإنتاج ***")
