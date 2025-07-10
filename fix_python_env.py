#!/usr/bin/env python3
"""
Fix Python Environment - Reinstall Core Dependencies
إصلاح بيئة Python وإعادة تثبيت المكتبات الأساسية
"""

import subprocess
import sys
import os

def run_pip_command(command):
    """تشغيل أوامر pip"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {command}")
            return True
        else:
            print(f"❌ {command}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ خطأ في تشغيل: {command}")
        print(f"Error: {e}")
        return False

def fix_python_environment():
    """إصلاح بيئة Python"""
    
    # Get Python executable path
    venv_python = r"C:\Users\hp\Desktop\zeyad\workers-app\venv\Scripts\python.exe"
    pip_path = r"C:\Users\hp\Desktop\zeyad\workers-app\venv\Scripts\pip.exe"
    
    print("🔧 بدء إصلاح بيئة Python...")
    print("=" * 50)
    
    # Core packages that need to be installed
    core_packages = [
        "fastapi>=0.100.0",
        "uvicorn[standard]>=0.20.0", 
        "starlette>=0.27.0",
        "pydantic>=2.0.0",
        "sqlalchemy>=2.0.0",
        "alembic>=1.10.0",
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "python-multipart>=0.0.6",
        "python-dotenv>=1.0.0"
    ]
    
    print("📦 إعادة تثبيت المكتبات الأساسية...")
    
    # Upgrade pip first
    print("\n🔄 تحديث pip...")
    run_pip_command(f'"{venv_python}" -m pip install --upgrade pip')
    
    # Install core packages
    for package in core_packages:
        print(f"\n📦 تثبيت {package}...")
        success = run_pip_command(f'"{venv_python}" -m pip install --force-reinstall "{package}"')
        if not success:
            print(f"⚠️ فشل في تثبيت {package}")
    
    # Test imports
    print("\n🧪 اختبار الاستيرادات...")
    test_imports = [
        "from fastapi import FastAPI",
        "from starlette.middleware.cors import CORSMiddleware", 
        "from starlette.middleware.gzip import GZipMiddleware",
        "from sqlalchemy.orm import Session",
        "from pydantic import BaseModel"
    ]
    
    for import_test in test_imports:
        try:
            result = subprocess.run(f'"{venv_python}" -c "{import_test}"', 
                                  shell=True, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ {import_test}")
            else:
                print(f"❌ {import_test}")
                print(f"   Error: {result.stderr.strip()}")
        except Exception as e:
            print(f"❌ {import_test} - Exception: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 انتهى إصلاح بيئة Python!")
    print("\n📋 ملاحظات:")
    print("- إذا واجهت أخطاء، تأكد من إغلاق VS Code وإعادة فتحه")
    print("- تأكد من تفعيل البيئة الافتراضية الصحيحة")
    print("- في حالة استمرار المشاكل، احذف مجلد venv وأنشئه من جديد")

if __name__ == "__main__":
    fix_python_environment()
