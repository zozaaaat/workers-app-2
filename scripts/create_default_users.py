#!/usr/bin/env python3
"""
سكريبت إنشاء المستخدمين الافتراضيين
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import User
import hashlib

def create_default_users():
    """إنشاء المستخدمين الافتراضيين"""
    db = SessionLocal()
    
    try:
        # إنشاء المستخدمين الافتراضيين
        default_users = [
            {
                "username": "admin",
                "email": "admin@example.com",
                "password": "admin123",
                "role": "admin",
                "full_name": "مدير النظام",
                "is_active": True
            },
            {
                "username": "manager",
                "email": "manager@example.com", 
                "password": "manager123",
                "role": "manager",
                "full_name": "مدير الإدارة",
                "is_active": True
            },
            {
                "username": "employee",
                "email": "employee@example.com",
                "password": "employee123", 
                "role": "employee",
                "full_name": "موظف",
                "is_active": True
            }
        ]
        
        for user_data in default_users:
            # تحقق من وجود المستخدم
            existing_user = db.query(User).filter(User.username == user_data["username"]).first()
            if existing_user:
                print(f"المستخدم {user_data['username']} موجود بالفعل")
                continue
            
            # إنشاء المستخدم الجديد
            hashed_password = hashlib.sha256(user_data["password"].encode()).hexdigest()
            new_user = User(
                username=user_data["username"],
                email=user_data["email"],
                password_hash=hashed_password,
                role=user_data["role"],
                full_name=user_data["full_name"],
                is_active=user_data["is_active"]
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            print(f"✅ تم إنشاء المستخدم: {user_data['username']} - {user_data['role']}")
            
        print("\n🎉 تم إنشاء جميع المستخدمين الافتراضيين بنجاح!")
        print("\nبيانات تسجيل الدخول:")
        print("Admin: admin / admin123")
        print("Manager: manager / manager123") 
        print("Employee: employee / employee123")
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء المستخدمين: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_default_users()
