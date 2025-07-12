# نظام إدارة العمال والرخص

نظام شامل لإدارة العمال والرخص والوثائق مع واجهة حديثة وميزات متقدمة.

## 🚀 المميزات

- **إدارة العمال**: تسجيل وإدارة بيانات العمال بالكامل
- **إدارة الرخص**: تتبع الرخص مع تنبيهات انتهاء الصلاحية
- **إدارة الوثائق**: رفع وإدارة المستندات والملفات
- **نظام الصلاحيات**: إدارة متقدمة للمستخدمين والأدوار
- **التقارير**: تقارير مفصلة وتحليلات ذكية
- **واجهة حديثة**: تصميم متجاوب وسهل الاستخدام

## 🏗️ هيكل المشروع

```
workers-app/
├── backend/          # FastAPI Backend
│   ├── app/
│   │   ├── core/     # الإعدادات والأمان
│   │   ├── models/   # نماذج قاعدة البيانات
│   │   ├── schemas/  # مخططات البيانات
│   │   ├── routers/  # API Routes
│   │   ├── crud/     # عمليات قاعدة البيانات
│   │   ├── services/ # الخدمات
│   │   └── utils/    # الأدوات المساعدة
│   └── requirements.txt
├── frontend/         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🛠️ التثبيت والتشغيل

### متطلبات النظام
- Python 3.8+
- Node.js 16+
- npm أو yarn

### تثبيت الباك إند

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### تثبيت الفرونت إند

```bash
cd frontend
npm install
npm run dev
```

## 📝 التوثيق

- **API Documentation**: `http://localhost:8000/docs`
- **Frontend**: `http://localhost:3000`

## 🤝 المساهمة

نرحب بالمساهمات! يرجى قراءة دليل المساهمة قبل البدء.

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).
