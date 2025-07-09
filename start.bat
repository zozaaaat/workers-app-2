@echo off
REM 🚀 تشغيل نظام إدارة العمال المتكامل - Windows
REM النسخة المتقدمة مع الذكاء الاصطناعي والأمان المتطور

echo 🚀 بدء تشغيل نظام إدارة العمال المتكامل...
echo ==================================================

REM التحقق من وجود Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python غير مثبت. يرجى تثبيت Python 3.8 أو أحدث
    pause
    exit /b 1
)

REM التحقق من وجود pip
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip غير مثبت. يرجى تثبيت pip
    pause
    exit /b 1
)

echo ✅ تم العثور على Python و pip

REM إنشاء البيئة الافتراضية إذا لم تكن موجودة
if not exist "venv" (
    echo 📦 إنشاء البيئة الافتراضية...
    python -m venv venv
)

REM تفعيل البيئة الافتراضية
echo 🔧 تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat

REM تثبيت المتطلبات
echo 📚 تثبيت المتطلبات...
pip install -r requirements.txt

REM إعداد قاعدة البيانات
echo 🗄️ إعداد قاعدة البيانات...
if not exist "workers.db" (
    echo إنشاء قاعدة بيانات جديدة...
)

REM تشغيل migrations
echo 🔄 تشغيل migrations...
alembic upgrade head

REM إعداد البيانات الأساسية
echo ⚙️ إعداد البيانات الأساسية...

REM تشغيل سكريبت إعداد الأذونات
if exist "scripts\setup_permissions.py" (
    echo 🔐 إعداد نظام الأذونات...
    python scripts\setup_permissions.py
)

REM تشغيل سكريبت إنشاء المستخدمين الافتراضيين
if exist "scripts\create_default_users.py" (
    echo 👥 إنشاء المستخدمين الافتراضيين...
    python scripts\create_default_users.py
)

REM إنشاء مجلد النماذج للذكاء الاصطناعي
if not exist "models" (
    echo 🤖 إنشاء مجلد نماذج الذكاء الاصطناعي...
    mkdir models
)

echo ==================================================
echo 🎉 تم الإعداد بنجاح! النظام جاهز للتشغيل
echo ==================================================

REM تشغيل الخادم
echo 🚀 تشغيل خادم التطبيق...
echo.
echo 🌐 سيتم تشغيل النظام على:
echo    - الخادم الرئيسي: http://localhost:8000
echo    - التوثيق التفاعلي: http://localhost:8000/docs
echo    - لوحة التحليلات: http://localhost:8000/analytics-dashboard.html
echo    - إعدادات الأمان: http://localhost:8000/security-settings.html
echo    - الذكاء الاصطناعي: http://localhost:8000/ai-dashboard.html
echo.
echo 📱 لتشغيل تطبيق الموبايل:
echo    cd mobile-app ^&^& npm install ^&^& npm start
echo.
echo 🛑 لإيقاف الخادم: اضغط Ctrl+C
echo ==================================================

REM تشغيل الخادم مع إعادة التحميل التلقائي
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
