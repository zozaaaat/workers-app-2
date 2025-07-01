from database import SessionLocal  # استيراد الجلسة
import models                      # استيراد المودلز
from auth import get_password_hash # دالة هاش كلمة السر
from datetime import datetime      # لتحويل النص لتاريخ

def create_admin():
    db = SessionLocal()

    # نتأكد إذا المستخدم موجود
    existing_admin = db.query(models.User).filter(models.User.username == "admin").first()
    if existing_admin:
        print("Admin user already exists.")
        return

    # ننشئ موظف إداري أولاً
    admin_employee = models.Employee(
        full_name="Admin User",
        email="admin@example.com",
        phone_number="0000000000",
        position="Administrator",
        department="IT",
        salary=0,
        start_date=datetime.strptime("2024-01-01", "%Y-%m-%d").date(),
        notes="Temporary admin employee"
    )
    db.add(admin_employee)
    db.commit()
    db.refresh(admin_employee)

    # ننشئ مستخدم الإدمن ونربطه بالموظف
    admin_user = models.User(
        username="admin",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        employee_id=admin_employee.id
    )
    db.add(admin_user)
    db.commit()
    print("Admin user created successfully.")

if __name__ == "__main__":
    create_admin()
