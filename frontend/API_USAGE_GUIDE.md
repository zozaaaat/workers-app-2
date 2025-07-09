# 🚀 دليل استخدام الخدمات الجديدة

## 📋 نظرة عامة

تم إنشاء خدمة API موحدة وبسيطة لتسهيل التطوير وتقليل التكرار في الكود.

## 🔧 كيفية الاستخدام

### 1. استيراد الخدمة

```typescript
import { api } from '../services/api';
```

### 2. أمثلة عملية

#### العمال (Workers)
```typescript
// الحصول على جميع العمال
const workers = await api.workers.getAll();

// الحصول على عامل محدد
const worker = await api.workers.getById(1);

// إنشاء عامل جديد
const newWorker = await api.workers.create({
  name: 'أحمد محمد',
  phone: '0501234567',
  worker_type: 'فني',
  company_id: 1
});

// تحديث عامل
await api.workers.update(1, { salary: 5000 });

// حذف عامل
await api.workers.delete(1);

// البحث عن العمال منتهيي الصلاحية
const expiring = await api.workers.getUpcomingExpirations(30);
```

#### الشركات (Companies)
```typescript
// الحصول على جميع الشركات
const companies = await api.companies.getAll();

// إنشاء شركة جديدة
const newCompany = await api.companies.create({
  name: 'شركة البناء المتطور',
  phone: '0112345678',
  email: 'info@company.com'
});
```

#### المستندات (Documents)
```typescript
// رفع مستند لعامل
await api.documents.uploadWorkerDocument(
  workerId, 
  file, 
  'passport'
);

// رفع مستند لشركة
await api.documents.uploadCompanyDocument(
  companyId, 
  file, 
  'license'
);

// الحصول على مستندات عامل
const docs = await api.documents.getWorkerDocuments(workerId);
```

#### الإشعارات (Notifications)
```typescript
// الحصول على جميع الإشعارات
const notifications = await api.notifications.getAll();

// تمييز إشعار كمقروء
await api.notifications.markAsRead(notificationId);
```

### 3. استخدام في المكونات

```typescript
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const data = await api.workers.getAll();
      setWorkers(data);
    } catch (err) {
      setError('فشل في تحميل البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorker = async (workerData) => {
    try {
      await api.workers.create(workerData);
      await loadWorkers(); // إعادة تحميل القائمة
    } catch (err) {
      setError('فشل في إنشاء العامل');
    }
  };

  if (loading) return <div>جارٍ التحميل...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {/* عرض قائمة العمال */}
      {workers.map(worker => (
        <div key={worker.id}>{worker.name}</div>
      ))}
    </div>
  );
};

export default WorkersPage;
```

## 🛠️ الوظائف المساعدة

### 1. استيراد الوظائف المساعدة
```typescript
import utils from '../utils';
```

### 2. أمثلة الاستخدام

#### التواريخ
```typescript
// تنسيق التاريخ
const displayDate = utils.date.formatDateArabic(worker.hire_date);
// النتيجة: "15 يناير 2023"

// فحص انتهاء الصلاحية
const isExpiring = utils.date.isExpiringSoon(worker.work_permit_end, 30);
// النتيجة: true إذا كان سينتهي خلال 30 يوم

// حساب الأيام المتبقية
const daysLeft = utils.date.getDaysUntilExpiration(worker.work_permit_end);
// النتيجة: 25 (يوم)
```

#### النصوص
```typescript
// تنسيق رقم الهاتف
const formattedPhone = utils.string.formatPhone('0501234567');
// النتيجة: "0501 234 567"

// الحصول على الأحرف الأولى
const initials = utils.string.getInitials('أحمد محمد علي');
// النتيجة: "أم"

// التحقق من البريد الإلكتروني
const isValid = utils.string.isValidEmail('test@example.com');
// النتيجة: true
```

#### الأرقام
```typescript
// تنسيق العملة
const salary = utils.number.formatCurrency(5000, 'SAR');
// النتيجة: "٥٬٠٠٠٫٠٠ ر.س."

// تنسيق الأرقام
const formatted = utils.number.formatNumber(1234567);
// النتيجة: "١٬٢٣٤٬٥٦٧"

// حساب النسبة المئوية
const percentage = utils.number.calculatePercentage(25, 100);
// النتيجة: 25
```

## 🎨 الثوابت

### 1. استيراد الثوابت
```typescript
import { WORKER_TYPES, ROUTES, COLORS } from '../constants';
```

### 2. أمثلة الاستخدام

```typescript
// أنواع العمال
const workerTypeOptions = WORKER_TYPES.map(type => ({
  value: type,
  label: type
}));

// المسارات
const profileUrl = ROUTES.WORKER_PROFILE(workerId);

// الألوان
const statusColor = COLORS.SUCCESS; // "#10B981"
```

## 🔍 معالجة الأخطاء

```typescript
const handleApiCall = async () => {
  try {
    const result = await api.workers.getAll();
    // نجح الطلب
  } catch (error) {
    if (error.response?.status === 401) {
      // غير مصرح - إعادة توجيه للتسجيل
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      // غير موجود
      setError('البيانات غير موجودة');
    } else {
      // خطأ عام
      setError('حدث خطأ في الخادم');
    }
  }
};
```

## 📱 مثال شامل - صفحة العمال

```typescript
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import utils from '../utils';
import { WORKER_TYPES, ROUTES } from '../constants';

const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const data = await api.workers.getAll();
      setWorkers(data);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    return utils.color.getStatusColor(status);
  };

  if (loading) {
    return <div className="text-center py-8">جارٍ التحميل...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">إدارة العمال</h1>
      
      {/* شريط البحث */}
      <input
        type="text"
        placeholder="البحث عن عامل..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 border rounded-lg mb-6"
      />

      {/* قائمة العمال */}
      <div className="grid gap-4">
        {filteredWorkers.map(worker => (
          <div key={worker.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{worker.name}</h3>
                <p className="text-gray-600">{worker.worker_type}</p>
                <p className="text-sm text-gray-500">
                  {utils.string.formatPhone(worker.phone)}
                </p>
              </div>
              <div className="text-right">
                <span 
                  className="px-3 py-1 rounded-full text-sm text-white"
                  style={{ backgroundColor: getStatusColor(worker.status) }}
                >
                  {worker.status}
                </span>
                {worker.work_permit_end && (
                  <p className="text-sm mt-2">
                    انتهاء الترخيص: {utils.date.formatDateArabic(worker.work_permit_end)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkersPage;
```

## 📋 قائمة مرجعية للتطوير

### ✅ عند إنشاء مكون جديد:
1. استخدم `api` للطلبات
2. استخدم `utils` للوظائف المساعدة
3. استخدم الثوابت من `constants`
4. اتبع نمط معالجة الأخطاء الموحد

### ✅ عند تحديث مكون موجود:
1. استبدل axios المباشر بـ `api`
2. استبدل الوظائف المخصصة بـ `utils`
3. استبدل القيم الثابتة بالثوابت
4. أضف معالجة أخطاء مناسبة

هذا الدليل يوفر أساساً قوياً لتطوير فعال ومنظم! 🚀
