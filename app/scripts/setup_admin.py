"""
سكريبت لإنشاء مستخدم أدمن افتراضي وإعداد النظام
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import User, Base
from app.crud import users as crud_users
from app.scripts.setup_permissions import create_default_permissions
from passlib.context import CryptContext
import getpass

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_admin_user():
    """إنشاء مستخدم أدمن افتراضي"""
    
    db = SessionLocal()
    
    try:
        # إنشاء الجداول إذا لم تكن موجودة
        Base.metadata.create_all(bind=engine)
        
        print("=== إعداد مستخدم الأدمن ===")
        
        # التحقق من وجود أدمن مسبقاً
        existing_admin = db.query(User).filter(User.role == "admin").first()
        if existing_admin:
            print(f"يوجد مستخدم أدمن مسبقاً: {existing_admin.username}")
            
            update_choice = input("هل تريد تحديث كلمة المرور؟ (y/n): ").lower().strip()
            if update_choice == 'y':
                new_password = getpass.getpass("كلمة المرور الجديدة: ")
                confirm_password = getpass.getpass("تأكيد كلمة المرور: ")
                
                if new_password != confirm_password:
                    print("كلمات المرور غير متطابقة!")
                    return
                
                existing_admin.hashed_password = pwd_context.hash(new_password)
                db.commit()
                print("تم تحديث كلمة مرور الأدمن بنجاح!")
            
            return existing_admin
        
        # إنشاء أدمن جديد
        print("\nإنشاء مستخدم أدمن جديد:")
        
        username = input("اسم المستخدم (افتراضي: admin): ").strip() or "admin"
        email = input("البريد الإلكتروني (افتراضي: admin@example.com): ").strip() or "admin@example.com"
        full_name = input("الاسم الكامل (افتراضي: مدير النظام): ").strip() or "مدير النظام"
        
        password = getpass.getpass("كلمة المرور: ")
        confirm_password = getpass.getpass("تأكيد كلمة المرور: ")
        
        if password != confirm_password:
            print("كلمات المرور غير متطابقة!")
            return
        
        if len(password) < 6:
            print("كلمة المرور يجب أن تكون 6 أحرف على الأقل!")
            return
        
        # التحقق من عدم تكرار البيانات
        if db.query(User).filter(User.username == username).first():
            print(f"اسم المستخدم {username} موجود مسبقاً!")
            return
        
        if db.query(User).filter(User.email == email).first():
            print(f"البريد الإلكتروني {email} موجود مسبقاً!")
            return
        
        # إنشاء المستخدم
        admin_user = crud_users.create_user(
            db=db,
            username=username,
            email=email,
            password=password,
            role="admin",
            full_name=full_name,
            department="إدارة النظام"
        )
        
        print(f"\n✅ تم إنشاء مستخدم الأدمن بنجاح!")
        print(f"اسم المستخدم: {admin_user.username}")
        print(f"البريد الإلكتروني: {admin_user.email}")
        print(f"الدور: {admin_user.role}")
        
        return admin_user
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء مستخدم الأدمن: {e}")
        db.rollback()
        return None
    finally:
        db.close()


def create_sample_users():
    """إنشاء مستخدمين تجريبيين"""
    
    db = SessionLocal()
    
    try:
        print("\n=== إنشاء مستخدمين تجريبيين ===")
        
        # مدير تجريبي
        if not db.query(User).filter(User.username == "manager1").first():
            manager = crud_users.create_user(
                db=db,
                username="manager1",
                email="manager@example.com",
                password="manager123",
                role="manager",
                full_name="أحمد المدير",
                department="الإدارة العامة"
            )
            print(f"✅ تم إنشاء المدير: {manager.username}")
        
        # موظف تجريبي
        if not db.query(User).filter(User.username == "employee1").first():
            employee = crud_users.create_user(
                db=db,
                username="employee1",
                email="employee@example.com",
                password="employee123",
                role="employee",
                full_name="محمد الموظف",
                department="شؤون العمال"
            )
            print(f"✅ تم إنشاء الموظف: {employee.username}")
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء المستخدمين التجريبيين: {e}")
        db.rollback()
    finally:
        db.close()


def setup_complete_system():
    """إعداد النظام كاملاً"""
    
    print("🚀 بدء إعداد نظام إدارة العمال")
    print("=" * 50)
    
    # 1. إنشاء الأذونات الافتراضية
    print("\n1. إنشاء الأذونات الافتراضية...")
    create_default_permissions()
    
    # 2. إنشاء مستخدم الأدمن
    print("\n2. إعداد مستخدم الأدمن...")
    admin_user = create_admin_user()
    
    if not admin_user:
        print("❌ فشل في إنشاء مستخدم الأدمن. لا يمكن المتابعة.")
        return
    
    # 3. إنشاء مستخدمين تجريبيين (اختياري)
    create_samples = input("\n3. هل تريد إنشاء مستخدمين تجريبيين؟ (y/n): ").lower().strip()
    if create_samples == 'y':
        create_sample_users()
    
    print("\n" + "=" * 50)
    print("🎉 تم إعداد النظام بنجاح!")
    print("\nيمكنك الآن:")
    print("- تشغيل الخادم: uvicorn app.main:app --reload")
    print("- الدخول كأدمن باستخدام البيانات التي أدخلتها")
    print("- إدارة المستخدمين والأذونات من واجهة الإدارة")
    print("\n📝 ملاحظات:")
    print("- الأدمن له صلاحيات كاملة")
    print("- المدير يحتاج موافقة للعمليات الحساسة فقط")
    print("- الموظف العادي يحتاج موافقة لجميع العمليات")


if __name__ == "__main__":
    setup_complete_system()
