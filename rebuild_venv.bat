@echo off
chcp 65001 > nul
echo 🔧 إعادة بناء البيئة الافتراضية لـ Python...
echo ================================================

echo.
echo ⚠️  هذا سيحذف البيئة الافتراضية الحالية وينشئ واحدة جديدة
echo    تأكد من إغلاق VS Code قبل المتابعة
echo.
set /p continue="هل تريد المتابعة؟ (y/n): "
if /i not "%continue%"=="y" (
    echo تم إلغاء العملية
    pause
    exit /b 1
)

echo.
echo 🗑️  حذف البيئة الافتراضية القديمة...
if exist "venv" (
    rmdir /s /q "venv"
    echo ✅ تم حذف البيئة القديمة
) else (
    echo ⚠️  لم توجد بيئة افتراضية قديمة
)

echo.
echo 🆕 إنشاء بيئة افتراضية جديدة...
python -m venv venv
if %errorlevel% neq 0 (
    echo ❌ فشل في إنشاء البيئة الافتراضية
    pause
    exit /b 1
)
echo ✅ تم إنشاء البيئة الافتراضية

echo.
echo 📦 تفعيل البيئة الافتراضية وتحديث pip...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
if %errorlevel% neq 0 (
    echo ❌ فشل في تحديث pip
    pause
    exit /b 1
)
echo ✅ تم تحديث pip

echo.
echo 📦 تثبيت المكتبات الأساسية...
pip install -r requirements_fixed.txt
if %errorlevel% neq 0 (
    echo ❌ فشل في تثبيت المكتبات
    pause
    exit /b 1
)
echo ✅ تم تثبيت المكتبات

echo.
echo 🧪 اختبار الاستيرادات...
python -c "from fastapi import FastAPI; print('✅ FastAPI')"
python -c "from starlette.middleware.cors import CORSMiddleware; print('✅ CORS')" 
python -c "from sqlalchemy.orm import Session; print('✅ SQLAlchemy')"
python -c "from pydantic import BaseModel; print('✅ Pydantic')"

echo.
echo ================================================
echo 🎉 تم إعادة بناء البيئة الافتراضية بنجاح!
echo.
echo 📋 الخطوات التالية:
echo    1. أعد فتح VS Code
echo    2. اختر البيئة الافتراضية الجديدة
echo    3. تأكد من عدم وجود أخطاء في الاستيراد
echo.
pause
