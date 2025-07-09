#!/bin/bash

# 🚀 تشغيل نظام إدارة العمال المتكامل
# النسخة المتقدمة مع الذكاء الاصطناعي والأمان المتطور

echo "🚀 بدء تشغيل نظام إدارة العمال المتكامل..."
echo "=================================================="

# التحقق من وجود Python
if ! command -v python &> /dev/null; then
    echo "❌ Python غير مثبت. يرجى تثبيت Python 3.8 أو أحدث"
    exit 1
fi

# التحقق من وجود pip
if ! command -v pip &> /dev/null; then
    echo "❌ pip غير مثبت. يرجى تثبيت pip"
    exit 1
fi

echo "✅ تم العثور على Python و pip"

# إنشاء البيئة الافتراضية إذا لم تكن موجودة
if [ ! -d "venv" ]; then
    echo "📦 إنشاء البيئة الافتراضية..."
    python -m venv venv
fi

# تفعيل البيئة الافتراضية
echo "🔧 تفعيل البيئة الافتراضية..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Linux/Mac
    source venv/bin/activate
fi

# تثبيت المتطلبات
echo "📚 تثبيت المتطلبات..."
pip install -r requirements.txt

# إعداد قاعدة البيانات
echo "🗄️ إعداد قاعدة البيانات..."
if [ ! -f "workers.db" ]; then
    echo "إنشاء قاعدة بيانات جديدة..."
fi

# تشغيل migrations
echo "🔄 تشغيل migrations..."
alembic upgrade head

# إعداد البيانات الأساسية
echo "⚙️ إعداد البيانات الأساسية..."

# تشغيل سكريبت إعداد الأذونات
if [ -f "scripts/setup_permissions.py" ]; then
    echo "🔐 إعداد نظام الأذونات..."
    python scripts/setup_permissions.py
fi

# تشغيل سكريبت إنشاء المستخدمين الافتراضيين
if [ -f "scripts/create_default_users.py" ]; then
    echo "👥 إنشاء المستخدمين الافتراضيين..."
    python scripts/create_default_users.py
fi

# إنشاء مجلد النماذج للذكاء الاصطناعي
if [ ! -d "models" ]; then
    echo "🤖 إنشاء مجلد نماذج الذكاء الاصطناعي..."
    mkdir models
fi

echo "=================================================="
echo "🎉 تم الإعداد بنجاح! النظام جاهز للتشغيل"
echo "=================================================="

# تشغيل الخادم
echo "🚀 تشغيل خادم التطبيق..."
echo ""
echo "🌐 سيتم تشغيل النظام على:"
echo "   - الخادم الرئيسي: http://localhost:8000"
echo "   - التوثيق التفاعلي: http://localhost:8000/docs"
echo "   - لوحة التحليلات: http://localhost:8000/analytics-dashboard.html"
echo "   - إعدادات الأمان: http://localhost:8000/security-settings.html"
echo "   - الذكاء الاصطناعي: http://localhost:8000/ai-dashboard.html"
echo ""
echo "📱 لتشغيل تطبيق الموبايل:"
echo "   cd mobile-app && npm install && npm start"
echo ""
echo "🛑 لإيقاف الخادم: اضغط Ctrl+C"
echo "=================================================="

# تشغيل الخادم مع إعادة التحميل التلقائي
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
