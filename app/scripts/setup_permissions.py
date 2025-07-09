from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models_permissions import Permission, UserPermission
from app.models import User, Base
from app.schemas_permissions import PermissionCreate


def create_default_permissions():
    """إنشاء الأذونات الافتراضية للنظام"""
    
    db = SessionLocal()
    
    try:
        # إنشاء الجداول إذا لم تكن موجودة
        Base.metadata.create_all(bind=engine)
        
        # قائمة الأذونات الافتراضية
        default_permissions = [
            # أذونات العمال
            {"name": "create_worker", "description": "إنشاء عامل جديد", "module": "workers"},
            {"name": "view_worker", "description": "عرض بيانات العامل", "module": "workers"},
            {"name": "update_worker", "description": "تعديل بيانات العامل", "module": "workers"},
            {"name": "delete_worker", "description": "حذف العامل", "module": "workers"},
            {"name": "transfer_worker", "description": "نقل العامل بين التراخيص", "module": "workers"},
            
            # أذونات الشركات
            {"name": "create_company", "description": "إنشاء شركة جديدة", "module": "companies"},
            {"name": "view_company", "description": "عرض بيانات الشركة", "module": "companies"},
            {"name": "update_company", "description": "تعديل بيانات الشركة", "module": "companies"},
            {"name": "delete_company", "description": "حذف الشركة", "module": "companies"},
            
            # أذونات التراخيص
            {"name": "create_license", "description": "إنشاء ترخيص جديد", "module": "licenses"},
            {"name": "view_license", "description": "عرض بيانات الترخيص", "module": "licenses"},
            {"name": "update_license", "description": "تعديل بيانات الترخيص", "module": "licenses"},
            {"name": "delete_license", "description": "حذف الترخيص", "module": "licenses"},
            {"name": "transfer_license", "description": "نقل الترخيص الفرعي", "module": "licenses"},
            
            # أذونات الإجازات
            {"name": "create_leave", "description": "إنشاء إجازة", "module": "leaves"},
            {"name": "view_leave", "description": "عرض الإجازات", "module": "leaves"},
            {"name": "update_leave", "description": "تعديل الإجازة", "module": "leaves"},
            {"name": "delete_leave", "description": "حذف الإجازة", "module": "leaves"},
            
            # أذونات الخصومات
            {"name": "create_deduction", "description": "إنشاء خصم", "module": "deductions"},
            {"name": "view_deduction", "description": "عرض الخصومات", "module": "deductions"},
            {"name": "update_deduction", "description": "تعديل الخصم", "module": "deductions"},
            {"name": "delete_deduction", "description": "حذف الخصم", "module": "deductions"},
            
            # أذونات المخالفات
            {"name": "create_violation", "description": "إنشاء مخالفة", "module": "violations"},
            {"name": "view_violation", "description": "عرض المخالفات", "module": "violations"},
            {"name": "update_violation", "description": "تعديل المخالفة", "module": "violations"},
            {"name": "delete_violation", "description": "حذف المخالفة", "module": "violations"},
            
            # أذونات نهاية الخدمة
            {"name": "calculate_end_of_service", "description": "حساب نهاية الخدمة", "module": "end_of_service"},
            {"name": "view_end_of_service", "description": "عرض حسابات نهاية الخدمة", "module": "end_of_service"},
            {"name": "update_end_of_service", "description": "تعديل حساب نهاية الخدمة", "module": "end_of_service"},
            
            # أذونات التقارير
            {"name": "view_reports", "description": "عرض التقارير", "module": "reports"},
            {"name": "export_data", "description": "تصدير البيانات", "module": "reports"},
            {"name": "print_reports", "description": "طباعة التقارير", "module": "reports"},
            
            # أذونات إدارة المستخدمين
            {"name": "create_user", "description": "إنشاء مستخدم جديد", "module": "users"},
            {"name": "view_user", "description": "عرض المستخدمين", "module": "users"},
            {"name": "update_user", "description": "تعديل المستخدم", "module": "users"},
            {"name": "delete_user", "description": "حذف المستخدم", "module": "users"},
            {"name": "manage_permissions", "description": "إدارة الأذونات", "module": "users"},
            
            # أذونات الإشعارات
            {"name": "send_notification", "description": "إرسال إشعار", "module": "notifications"},
            {"name": "view_notifications", "description": "عرض الإشعارات", "module": "notifications"},
            
            # أذونات سجلات الأنشطة
            {"name": "view_activity_logs", "description": "عرض سجلات الأنشطة", "module": "activity_logs"},
            {"name": "view_user_activities", "description": "عرض أنشطة المستخدمين", "module": "activity_logs"},
        ]
        
        # إنشاء الأذونات
        created_permissions = []
        for perm_data in default_permissions:
            # التحقق من عدم وجود الإذن مسبقاً
            existing = db.query(Permission).filter(Permission.name == perm_data["name"]).first()
            if not existing:
                permission = Permission(**perm_data)
                db.add(permission)
                created_permissions.append(perm_data["name"])
        
        db.commit()
        
        print(f"تم إنشاء {len(created_permissions)} إذن جديد:")
        for perm_name in created_permissions:
            print(f"  - {perm_name}")
        
        # منح جميع الأذونات للأدمن
        admin_user = db.query(User).filter(User.role == "admin").first()
        if admin_user:
            grant_admin_permissions(db, admin_user.id)
            print(f"تم منح جميع الأذونات للأدمن: {admin_user.username}")
        
    except Exception as e:
        print(f"خطأ في إنشاء الأذونات: {e}")
        db.rollback()
    finally:
        db.close()


def grant_admin_permissions(db: Session, admin_user_id: int):
    """منح جميع الأذونات للأدمن"""
    
    # الحصول على جميع الأذونات
    all_permissions = db.query(Permission).all()
    
    for permission in all_permissions:
        # التحقق من عدم وجود الإذن مسبقاً
        existing = db.query(UserPermission).filter(
            UserPermission.user_id == admin_user_id,
            UserPermission.permission_id == permission.id
        ).first()
        
        if not existing:
            user_permission = UserPermission(
                user_id=admin_user_id,
                permission_id=permission.id,
                granted=True,
                granted_by=admin_user_id  # الأدمن يمنح لنفسه
            )
            db.add(user_permission)
    
    db.commit()


def create_manager_permission_template():
    """إنشاء قالب أذونات للمدير"""
    
    db = SessionLocal()
    
    try:
        # أذونات المدير (كل شيء عدا إدارة المستخدمين والأذونات)
        manager_permissions = [
            # عرض وتعديل العمال والشركات والتراخيص
            "view_worker", "create_worker", "update_worker", "transfer_worker",
            "view_company", "create_company", "update_company",
            "view_license", "create_license", "update_license", "transfer_license",
            
            # إدارة الإجازات والخصومات والمخالفات
            "view_leave", "create_leave", "update_leave", "delete_leave",
            "view_deduction", "create_deduction", "update_deduction", "delete_deduction",
            "view_violation", "create_violation", "update_violation", "delete_violation",
            
            # نهاية الخدمة والتقارير
            "calculate_end_of_service", "view_end_of_service", "update_end_of_service",
            "view_reports", "export_data", "print_reports",
            
            # سجلات الأنشطة
            "view_activity_logs", "view_user_activities",
            
            # الإشعارات
            "send_notification", "view_notifications",
        ]
        
        print("أذونات المدير المقترحة:")
        for perm in manager_permissions:
            print(f"  - {perm}")
        
        return manager_permissions
        
    finally:
        db.close()


def create_employee_permission_template():
    """إنشاء قالب أذونات للموظف العادي (أساسي)"""
    
    # أذونات أساسية للموظف (عرض فقط غالباً)
    employee_basic_permissions = [
        "view_worker", "view_company", "view_license",
        "view_leave", "view_deduction", "view_violation",
        "view_end_of_service", "view_reports"
    ]
    
    print("أذونات الموظف الأساسية:")
    for perm in employee_basic_permissions:
        print(f"  - {perm}")
    
    return employee_basic_permissions


if __name__ == "__main__":
    print("إنشاء الأذونات الافتراضية...")
    create_default_permissions()
    
    print("\n" + "="*50)
    print("قوالب الأذونات:")
    print("="*50)
    
    print("\n1. أذونات المدير:")
    create_manager_permission_template()
    
    print("\n2. أذونات الموظف الأساسية:")
    create_employee_permission_template()
    
    print("\nتم إنهاء إعداد الأذونات!")
