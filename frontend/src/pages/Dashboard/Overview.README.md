# Overview Dashboard Component
# مكون لوحة التحكم الرئيسية

## نظرة عامة | Overview

تم تحديث مكون Overview.tsx ليكون لوحة تحكم شاملة ونظيفة تعرض إحصائيات النظام والأنشطة الحديثة.

The Overview.tsx component has been updated to be a comprehensive and clean dashboard displaying system statistics and recent activities.

## الميزات الجديدة | New Features

### 📊 إحصائيات رئيسية | Key Statistics
- **إجمالي الموظفين**: عدد الموظفين الكلي والنشط
- **الرخص النشطة**: عدد الرخص النشطة والتي ستنتهي قريباً  
- **الملفات المرفوعة**: عدد الملفات المرفوعة هذا الأسبوع
- **المهام المعلقة**: مهام المستخدم الحالي

### 🚨 تنبيهات الانتهاء | Expiry Alerts
- تنبيهات الرخص والوثائق التي ستنتهي قريباً
- مستويات تنبيه: حرج، تحذير، معلوماتي
- عرض عدد الأيام المتبقية أو حالة الانتهاء

### 📁 الملفات الحديثة | Recent Files  
- آخر 5 ملفات تم رفعها
- معلومات نوع الملف والكيان المرتبط
- توقيت الرفع النسبي (منذ ساعة، منذ يوم، إلخ)

### ✅ مهام المستخدم | User Tasks (للموظفين)
- مهام المستخدم الحالي إذا كان موظفاً
- أولوية المهام: عالية، متوسطة، منخفضة
- حالة المهام: في الانتظار، قيد التنفيذ، مكتملة
- الموعد النهائي للمهام

## التقنيات المستخدمة | Technologies Used

### React Hooks
```typescript
import { useOverviewData } from '../../hooks/useOverviewData'
```

### API Services
```typescript
import { 
  overviewService,
  tasksService 
} from '../../services'
```

### TypeScript Types
```typescript
import { 
  OverviewStats,
  ExpiryAlert, 
  RecentFile,
  Task 
} from '../../types'
```

### Utility Functions
```typescript
import {
  formatNumber,
  formatRelativeTime,
  translateDocumentType,
  translateEntityType,
  getAlertColor,
  getTaskPriorityColor,
  translateTaskPriority,
  translateTaskStatus,
  getTaskStatusColor,
} from '../../utils/formatters'
```

## هيكل المكون | Component Structure

```
Overview/
├── Loading State       # حالة التحميل مع skeleton
├── Error State         # حالة الخطأ مع إعادة المحاولة
├── Header             # العنوان والوصف
├── Statistics Cards   # بطاقات الإحصائيات الرئيسية
└── Content Grid       # المحتوى الأساسي
    ├── Expiry Alerts  # تنبيهات الانتهاء
    ├── Recent Files   # الملفات الحديثة
    └── User Tasks     # مهام المستخدم (حسب الدور)
```

## التصميم | Design

### نمط التصميم | Design Pattern
- **نظيف ومرتب**: تصميم بسيط مع مسافات كافية
- **متجاوب**: يتكيف مع جميع أحجام الشاشات
- **تفاعلي**: تأثيرات hover وانتقالات سلسة
- **إمكانية الوصول**: ألوان وتباين مناسب

### نظام الألوان | Color System
```css
/* إحصائيات */
أزرق: إجمالي الموظفين (bg-blue-50, text-blue-600)
أخضر: الرخص النشطة (bg-green-50, text-green-600)
بنفسجي: الملفات (bg-purple-50, text-purple-600)
برتقالي: المهام (bg-orange-50, text-orange-600)

/* التنبيهات */
أحمر: حرج (bg-red-50, text-red-600, border-red-200)
أصفر: تحذير (bg-yellow-50, text-yellow-600, border-yellow-200)
أزرق: معلوماتي (bg-blue-50, text-blue-600, border-blue-200)

/* المهام */
أحمر: أولوية عالية (bg-red-50, text-red-600)
أصفر: أولوية متوسطة (bg-yellow-50, text-yellow-600)
أخضر: أولوية منخفضة (bg-green-50, text-green-600)
```

### شبكة التخطيط | Grid Layout
```css
/* الإحصائيات */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

/* المحتوى الأساسي */
grid-cols-1 lg:grid-cols-2

/* المهام */
grid-cols-1 md:grid-cols-2 (داخل بطاقة المهام)
```

## حالات التحميل | Loading States

### Skeleton Loading
```typescript
if (loading) {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}
```

### Error Handling
```typescript
if (error) {
  return (
    <div className="text-center py-12">
      <div className="text-red-500 text-lg mb-4">⚠️ خطأ في تحميل البيانات</div>
      <p className="text-gray-600">{error}</p>
    </div>
  )
}
```

## استهلاك البيانات | Data Consumption

### useOverviewData Hook
```typescript
const { 
  stats,           // إحصائيات النظام
  expiryAlerts,    // تنبيهات الانتهاء
  recentFiles,     // الملفات الحديثة
  userTasks,       // مهام المستخدم
  loading,         // حالة التحميل
  error,           // رسائل الخطأ
  refetch          // إعادة تحميل البيانات
} = useOverviewData()
```

### API Endpoints المطلوبة
```
GET /api/overview/stats           - إحصائيات النظام
GET /api/overview/expiry-alerts   - تنبيهات الانتهاء
GET /api/overview/recent-files    - الملفات الحديثة
GET /api/tasks/my-tasks          - مهام المستخدم
```

## التوافق | Compatibility

### دعم الأدوار | Role Support
- **المديرون**: عرض جميع الإحصائيات والتنبيهات
- **الموظفون**: عرض الإحصائيات + مهامهم الشخصية
- **المشاهدون**: عرض الإحصائيات فقط

### الاستجابة | Responsiveness
- **الهاتف**: عمود واحد، مكدس عمودياً
- **التابلت**: عمودين للإحصائيات
- **سطح المكتب**: أربعة أعمدة للإحصائيات، عمودين للمحتوى

## تحسينات الأداء | Performance Optimizations

### تحميل متوازي | Parallel Loading
```typescript
const [statsData, alertsData, filesData, tasksData] = await Promise.allSettled([
  overviewService.getStats(),
  overviewService.getExpiryAlerts(5),
  overviewService.getRecentFiles(5),
  tasksService.getMyTasks(),
])
```

### تحديد البيانات | Data Limiting
- تنبيهات الانتهاء: أول 5 عناصر
- الملفات الحديثة: أول 5 ملفات
- مهام المستخدم: أول 6 مهام

### معالجة الأخطاء | Error Handling
- فشل جزئي: عرض البيانات المتاحة
- فشل كامل: رسالة خطأ مع إمكانية إعادة المحاولة
- حالات فارغة: رسائل ودية مع أيقونات

## الإضافات المستقبلية | Future Enhancements

### ميزات مقترحة
1. **تحديث تلقائي**: refresh كل 5 دقائق
2. **فلاتر تفاعلية**: تصفية البيانات حسب الفترة
3. **رسوم بيانية**: charts للاتجاهات
4. **تصدير البيانات**: تصدير الإحصائيات
5. **تخصيص لوحة التحكم**: إعادة ترتيب البطاقات

### تحسينات الأداء
1. **Virtual scrolling** للقوائم الطويلة
2. **Infinite loading** للبيانات
3. **Caching** للاستعلامات المتكررة
4. **Optimistic updates** للتفاعلات

## الاختبار | Testing

### اختبارات مقترحة
```typescript
// اختبار التحميل
test('shows loading state initially')

// اختبار البيانات
test('displays stats when data is loaded')

// اختبار الأخطاء
test('shows error message on fetch failure')

// اختبار التفاعل
test('shows user tasks for employees')

// اختبار الاستجابة
test('adapts layout on different screen sizes')
```

## التوثيق الفني | Technical Documentation

### المتطلبات | Requirements
- React 18+
- TypeScript 4+
- Tailwind CSS 3+
- Axios للـ API calls
- React Hooks للـ state management

### الاعتماديات | Dependencies
```json
{
  "react": "^18.0.0",
  "typescript": "^4.0.0", 
  "tailwindcss": "^3.0.0",
  "axios": "^1.0.0"
}
```
