# خطة إكمال المتطلبات المتبقية

## المرحلة 1: الصفحة الرئيسية وبطاقات الشركات ⭐ (أولوية عالية)

### 1.1 إنشاء صفحة الهبوط
```typescript
// src/pages/Landing/CompanyGrid.tsx
- عرض جميع الشركات كبطاقات
- كل بطاقة تحتوي: شعار، اسم، وصف
- زر "دخول" لكل شركة
```

### 1.2 ربط كل بطاقة بصفحة دخول مخصصة
```typescript
// src/pages/Auth/CompanyLogin.tsx
- استقبال company_id من URL
- نموذج تسجيل دخول مخصص للشركة
- التحقق من انتماء المستخدم للشركة
```

## المرحلة 2: نظام تسجيل الدخول المنفصل 🔐 (أولوية عالية)

### 2.1 تعديل AuthContext
```typescript
// إضافة company_id للسياق
interface AuthState {
  user: User | null
  company: Company | null // جديد
  isAuthenticated: boolean
}
```

### 2.2 تعديل API endpoints
```typescript
// POST /auth/company/{company_id}/login
// التحقق من انتماء المستخدم للشركة
```

## المرحلة 3: الشريط الجانبي الديناميكي 📋 (أولوية متوسطة)

### 3.1 مكون Sidebar محدث
```typescript
// src/components/Layout/DynamicSidebar.tsx
- قوائم فرعية منسدلة
- أيقونات تتغير عند الفتح/الإغلاق
- animation smooth
```

### 3.2 بنية القوائم الهرمية
```typescript
interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType
  children?: MenuItem[]
  requiredPermission?: string
}
```

## المرحلة 4: نظام الصلاحيات المرن 🎯 (أولوية متوسطة)

### 4.1 قائمة الصلاحيات المفصلة
```typescript
// src/types/permissions.ts
export const DETAILED_PERMISSIONS = [
  { id: 'employees.view', name: 'عرض الموظفين', category: 'employees' },
  { id: 'employees.add', name: 'إضافة موظف', category: 'employees' },
  { id: 'employees.edit', name: 'تعديل موظف', category: 'employees' },
  { id: 'employees.delete', name: 'حذف موظف', category: 'employees' },
  { id: 'files.upload', name: 'رفع ملفات', category: 'files' },
  // ... المزيد
]
```

### 4.2 واجهة اختيار الصلاحيات
```typescript
// src/components/Users/PermissionSelector.tsx
- checkboxes مجمعة حسب الفئة
- "تحديد الكل" لكل فئة
- بحث في الصلاحيات
```

## المرحلة 5: تحسينات الواجهة 🎨 (أولوية منخفضة)

### 5.1 شريط أدوات مخصص
```typescript
// src/components/Layout/RoleBasedToolbar.tsx
- أزرار مختلفة حسب الدور
- اختصارات سريعة
- إحصائيات مباشرة
```

### 5.2 تبسيط الواجهة
- تقليل عدد الألوان المستخدمة
- توحيد spacing وfonts
- إخفاء المعلومات غير الضرورية

## الجدول الزمني المقترح ⏰

| المرحلة | الوقت المتوقع | الأولوية |
|---------|---------------|-----------|
| صفحة الشركات | 2-3 أيام | ⭐⭐⭐ |
| تسجيل دخول منفصل | 3-4 أيام | ⭐⭐⭐ |
| الشريط الديناميكي | 2 أيام | ⭐⭐ |
| الصلاحيات المرنة | 3-4 أيام | ⭐⭐ |
| تحسينات الواجهة | 1-2 أيام | ⭐ |

**المجموع**: 11-15 يوم عمل

## ملاحظات مهمة ⚠️

1. **قاعدة البيانات**: تحتاج تعديل لربط Users بـ Companies
2. **الأمان**: نظام التحقق من الشركة في كل API call
3. **الاختبار**: كل ميزة تحتاج اختبار مع أدوار مختلفة
4. **الأداء**: تحسين استعلامات قاعدة البيانات للشركات

## الخلاصة 📝

المشروع الحالي **قوي في الأساسيات** (65% مكتمل) لكن يحتاج:
- **التركيز على Multi-tenancy** (نظام الشركات المنفصل)
- **تحسين UX** (الشريط الديناميكي والواجهة)
- **مرونة أكثر** (الصلاحيات المخصصة)

الأولوية للمراحل 1 و 2 لأنها الأساس لباقي المتطلبات.
