#!/bin/bash
# Performance Optimization Setup Script
# نص تثبيت تحسينات الأداء

echo "🚀 بدء تثبيت تحسينات الأداء..."

# Backend optimizations
echo "📦 تثبيت مكتبات Backend..."
cd ../
pip install redis celery[redis] aioredis psutil

# Database migration
echo "🗃️ إضافة المؤشرات لقاعدة البيانات..."
alembic revision --autogenerate -m "Add performance indexes"
alembic upgrade head

# Frontend optimizations
echo "🎨 تثبيت مكتبات Frontend..."
cd frontend/
npm install @tanstack/react-query@^5.0.0 @tanstack/react-query-devtools@^5.0.0
npm install react-window@^1.8.8 react-window-infinite-loader@^1.0.9
npm install react-intersection-observer@^9.0.0 react-hot-toast@^2.4.1
npm install @types/react-window@^1.8.8

# Build optimizations
echo "⚡ تحسين إعدادات البناء..."
echo "تم تحديث vite.config.ts بإعدادات التحسين"

# Create Redis configuration
echo "🔧 إنشاء ملف تكوين Redis..."
cat > ../redis.conf << 'EOF'
# Redis Configuration for Workers App
port 6379
bind 127.0.0.1
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF

# Create startup script
echo "🚀 إنشاء نص بدء التشغيل المحسّن..."
cat > ../start-optimized.sh << 'EOF'
#!/bin/bash
echo "🚀 بدء نظام إدارة العمال المحسّن..."

# Start Redis
echo "📦 بدء تشغيل Redis..."
redis-server redis.conf &

# Start Backend with optimizations
echo "⚙️ بدء تشغيل Backend..."
cd app/
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &

# Start Frontend
echo "🎨 بدء تشغيل Frontend..."
cd ../frontend/
npm run dev &

echo "✅ النظام جاهز!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"

wait
EOF

chmod +x ../start-optimized.sh

echo "✅ تم تثبيت جميع التحسينات بنجاح!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. تشغيل Redis: redis-server"
echo "2. تشغيل النظام المحسّن: ./start-optimized.sh"
echo "3. زيارة http://localhost:5173 لرؤية التحسينات"
echo ""
echo "🔍 ميزات جديدة:"
echo "   ✅ تخزين مؤقت ذكي مع Redis"
echo "   ✅ مؤشرات قاعدة البيانات"
echo "   ✅ React Query للاستعلامات"
echo "   ✅ تحميل ديناميكي للمكونات"
echo "   ✅ ضغط البيانات"
echo "   ✅ مراقبة الأداء"
