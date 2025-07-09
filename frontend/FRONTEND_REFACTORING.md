# Frontend Refactoring Plan

## 🎯 الهدف
إعادة تنظيم وتبسيط هيكل Frontend لجعله أكثر وضوحاً وسهولة في الصيانة

## 📁 الهيكل الجديد المقترح

```
src/
├── components/           # المكونات القابلة لإعادة الاستخدام
│   ├── ui/              # مكونات UI الأساسية
│   ├── forms/           # نماذج الإدخال
│   ├── tables/          # جداول البيانات
│   ├── charts/          # الرسوم البيانية
│   └── layout/          # مكونات التخطيط
├── pages/               # صفحات التطبيق
│   ├── dashboard/       # صفحات لوحة التحكم
│   ├── workers/         # إدارة العمال
│   ├── companies/       # إدارة الشركات
│   ├── licenses/        # إدارة التراخيص
│   ├── documents/       # إدارة المستندات
│   ├── reports/         # التقارير
│   └── settings/        # الإعدادات
├── services/            # خدمات API
├── hooks/               # Custom React Hooks
├── utils/               # وظائف مساعدة
├── types/               # TypeScript Types
└── constants/           # الثوابت
```

## 🔄 التغييرات المطلوبة

### 1. دمج ملفات Dashboard المتعددة
- [ ] دمج DashboardPage.tsx, DashboardPageClean.tsx, DashboardPageFixed.tsx, DashboardPageSimplified.tsx
- [ ] إنشاء مكون واحد محسن

### 2. إعادة تنظيم المكونات
- [ ] نقل المكونات إلى مجلدات مناسبة
- [ ] إنشاء مكونات UI قابلة لإعادة الاستخدام

### 3. تبسيط الصفحات
- [ ] دمج الصفحات المتشابهة
- [ ] توحيد أنماط التصميم

### 4. تحسين الخدمات
- [ ] دمج api.ts و api_notifications.ts
- [ ] إنشاء خدمات منظمة لكل module
