import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))

# سكريبت لفحص المستخدمين والتحقق من كلمة مرور الأدمن
from app.database import SessionLocal
from app.models import User
from app.crud.users import pwd_context

# بيانات الأدمن
ADMIN_USERNAME = "admin"  # عدلها إذا كان اسم الأدمن مختلف
ADMIN_PASSWORD = "admin123"  # عدلها لكلمة المرور التي أدخلتها

def list_users():
    db = SessionLocal()
    users = db.query(User).all()
    print("جميع المستخدمين:")
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {user.role}")
    db.close()

def check_admin_password():
    db = SessionLocal()
    user = db.query(User).filter(User.username == ADMIN_USERNAME).first()
    if not user:
        print("الأدمن غير موجود!")
        return
    if pwd_context.verify(ADMIN_PASSWORD, user.hashed_password):
        print("كلمة المرور صحيحة للأدمن!")
    else:
        print("كلمة المرور غير صحيحة للأدمن!")
    db.close()

def add_admin_if_not_exists():
    db = SessionLocal()
    user = db.query(User).filter(User.username == ADMIN_USERNAME).first()
    if not user:
        hashed_password = pwd_context.hash(ADMIN_PASSWORD)
        user = User(username=ADMIN_USERNAME, email="admin@admin.com", hashed_password=hashed_password, role="admin", is_active=1)
        db.add(user)
        db.commit()
        db.refresh(user)
        print("تم إضافة الأدمن بنجاح!")
    else:
        print("الأدمن موجود بالفعل.")
    db.close()

if __name__ == "__main__":
    add_admin_if_not_exists()
    list_users()
    check_admin_password()
