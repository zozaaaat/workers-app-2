# نظام الصلاحيات المبني على الأدوار - دليل الاستخدام

## نظرة عامة

تم تطوير نظام شامل للصلاحيات مبني على الأدوار في `PermissionContext.tsx` يوفر تحكماً دقيقاً في الوصول للصفحات والمميزات حسب دور المستخدم المسجل.

## الأدوار المتاحة

### 1. **المدير العام للنظام (SUPER_ADMIN)**
- جميع الصلاحيات في النظام
- إدارة كاملة لجميع المكونات

### 2. **المدير العام (ADMIN)**
- إدارة الموظفين والتراخيص والإجازات
- إدارة المستخدمين (عدا صلاحيات النظام)
- الوصول للتقارير المتقدمة
- إدارة وثائق الشركة

### 3. **مدير الموارد البشرية (HR_MANAGER)**
- إدارة كاملة للموظفين والتراخيص
- اعتماد ورفض الإجازات
- إدارة الاستقطاعات والوثائق
- إنشاء التقارير المتقدمة
- **يمكنه تعديل التراخيص وإضافة الموظفين**

### 4. **أخصائي الموارد البشرية (HR_SPECIALIST)**
- إدارة محدودة للموظفين (إنشاء وتعديل فقط)
- تعديل وإنشاء التراخيص (بدون حذف)
- إدارة الإجازات (بدون اعتماد)
- تقارير أساسية فقط

### 5. **الموظف (EMPLOYEE)**
- عرض البيانات الشخصية فقط
- إنشاء طلبات الإجازة
- رفع وتحميل الوثائق الشخصية
- عرض التقارير الشخصية

### 6. **المشاهد (VIEWER)**
- عرض البيانات العامة فقط
- بدون صلاحيات التعديل أو الإنشاء

## الصلاحيات الأساسية المطلوبة

### تعديل التراخيص
```typescript
// فقط للمديرين ومدراء الموارد البشرية
canEditLicenses() // HR_MANAGER, ADMIN, SUPER_ADMIN
```

### إضافة الموظفين
```typescript
// فقط للمديرين ومدراء وأخصائيي الموارد البشرية
canAddEmployees() // HR_SPECIALIST, HR_MANAGER, ADMIN, SUPER_ADMIN
```

## طرق الاستخدام

### 1. **التحقق من الصلاحيات الأساسية**

```typescript
import { usePermissions, PERMISSIONS } from '../context/PermissionContext'

const MyComponent = () => {
  const { hasPermission, hasRole } = usePermissions()
  
  // التحقق من صلاحية معينة
  const canEdit = hasPermission(PERMISSIONS.LICENSES_EDIT)
  
  // التحقق من دور معين
  const isManager = hasRole(['hr_manager', 'admin', 'super_admin'])
  
  return (
    <div>
      {canEdit && <button>تعديل الترخيص</button>}
      {isManager && <div>محتوى خاص بالمديرين</div>}
    </div>
  )
}
```

### 2. **استخدام Hooks المخصصة**

```typescript
import { 
  useCanEditLicenses, 
  useCanAddEmployees, 
  useIsManager 
} from '../context/PermissionContext'

const EmployeeManagement = () => {
  const canEditLicenses = useCanEditLicenses()
  const canAddEmployees = useCanAddEmployees()
  const isManager = useIsManager()
  
  return (
    <div>
      {canAddEmployees && (
        <button>إضافة موظف جديد</button>
      )}
      
      {canEditLicenses && (
        <button>تعديل التراخيص</button>
      )}
      
      {isManager && (
        <div>لوحة تحكم المديرين</div>
      )}
    </div>
  )
}
```

### 3. **حماية المكونات بالصلاحيات**

```typescript
import { ProtectedComponent, PERMISSIONS } from '../context/PermissionContext'

const LicenseManagement = () => {
  return (
    <div>
      <h2>إدارة التراخيص</h2>
      
      {/* مكون محمي بصلاحية معينة */}
      <ProtectedComponent 
        permission={PERMISSIONS.LICENSES_EDIT}
        fallback={<div>ليس لديك صلاحية لتعديل التراخيص</div>}
      >
        <button>تعديل الترخيص</button>
      </ProtectedComponent>
      
      {/* مكون محمي بدور معين */}
      <ProtectedComponent 
        role={['hr_manager', 'admin']}
        fallback={<div>هذه الميزة متاحة للمديرين فقط</div>}
      >
        <div>إحصائيات متقدمة للتراخيص</div>
      </ProtectedComponent>
    </div>
  )
}
```

### 4. **التحقق من الوصول للصفحات**

```typescript
import { useCanAccessPage } from '../context/PermissionContext'

const Navigation = () => {
  const canAccessEmployees = useCanAccessPage('/employees')
  const canAccessLicensesCreate = useCanAccessPage('/licenses/create')
  const canAccessAdmin = useCanAccessPage('/admin')
  
  return (
    <nav>
      {canAccessEmployees && <Link to="/employees">الموظفون</Link>}
      {canAccessLicensesCreate && <Link to="/licenses/create">إنشاء ترخيص</Link>}
      {canAccessAdmin && <Link to="/admin">الإدارة</Link>}
    </nav>
  )
}
```

### 5. **التحقق من استخدام المميزات**

```typescript
import { useCanUseFeature } from '../context/PermissionContext'

const EmployeeList = () => {
  const canUseBulkActions = useCanUseFeature('employee_bulk_actions')
  const canUseAdvancedSearch = useCanUseFeature('employee_advanced_search')
  
  return (
    <div>
      <h2>قائمة الموظفين</h2>
      
      {canUseAdvancedSearch && (
        <AdvancedSearchComponent />
      )}
      
      {canUseBulkActions && (
        <BulkActionsToolbar />
      )}
      
      <EmployeeTable />
    </div>
  )
}
```

## أمثلة عملية للاستخدام

### إدارة الموظفين
```typescript
const EmployeePage = () => {
  const canAdd = useCanAddEmployees()
  const canEdit = useHasPermission(PERMISSIONS.EMPLOYEES_EDIT)
  const canDelete = useHasPermission(PERMISSIONS.EMPLOYEES_DELETE)
  const isManager = useIsManager()
  
  return (
    <div>
      {canAdd && <AddEmployeeButton />}
      
      <EmployeeList 
        showEditButton={canEdit}
        showDeleteButton={canDelete}
        showAdvancedFeatures={isManager}
      />
    </div>
  )
}
```

### إدارة التراخيص
```typescript
const LicensePage = () => {
  const canEditLicenses = useCanEditLicenses()
  const canCreateLicenses = useHasPermission(PERMISSIONS.LICENSES_CREATE)
  const canDeleteLicenses = useHasPermission(PERMISSIONS.LICENSES_DELETE)
  
  return (
    <div>
      {canCreateLicenses && <CreateLicenseButton />}
      
      <LicenseList 
        showEditButton={canEditLicenses}
        showDeleteButton={canDeleteLicenses}
      />
    </div>
  )
}
```

## المميزات المتقدمة

### 1. **التحكم في الوصول للصفحات**
- كل صفحة لها صلاحيات محددة في `PAGE_ACCESS`
- استخدام `canAccessPage()` للتحقق من الوصول

### 2. **التحكم في المميزات**
- كل ميزة لها صلاحيات محددة في `FEATURE_ACCESS`
- استخدام `canUseFeature()` للتحقق من الاستخدام

### 3. **نظام الصلاحيات المرن**
- يمكن الجمع بين صلاحيات متعددة
- يمكن التحقق من "أي من" أو "جميع" الصلاحيات

### 4. **Hooks سهلة الاستخدام**
- `useCanEditLicenses()`
- `useCanAddEmployees()`
- `useIsManager()`
- `useIsAdmin()`

## الإعداد والتكامل

### 1. **تضمين Provider في التطبيق**
```typescript
import { PermissionProvider } from './context/PermissionContext'

function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <Router>
          {/* مكونات التطبيق */}
        </Router>
      </PermissionProvider>
    </AuthProvider>
  )
}
```

### 2. **إضافة صلاحيات جديدة**
```typescript
// في PERMISSIONS
export const PERMISSIONS = {
  // ... الصلاحيات الموجودة
  NEW_FEATURE_VIEW: 'new_feature.view',
  NEW_FEATURE_EDIT: 'new_feature.edit'
}

// في ROLE_PERMISSIONS
[ROLES.HR_MANAGER]: [
  // ... الصلاحيات الموجودة
  PERMISSIONS.NEW_FEATURE_VIEW,
  PERMISSIONS.NEW_FEATURE_EDIT
]
```

## ملاحظات مهمة

1. **الأمان**: النظام يوفر طبقة الحماية في الواجهة فقط، يجب التأكد من الصلاحيات في الخادم أيضاً
2. **المرونة**: يمكن تخصيص الصلاحيات لكل مستخدم بشكل فردي
3. **الصيانة**: سهولة إضافة أدوار وصلاحيات جديدة
4. **الأداء**: استخدام React Context للحفاظ على الأداء
5. **التطوير**: نظام الـ Hooks يجعل الكود أكثر قابلية للقراءة والصيانة

هذا النظام يضمن أن:
- **فقط المديرين يمكنهم تعديل التراخيص**
- **فقط من لديه صلاحية يمكنه إضافة موظفين**
- **كل دور له وصول محدد للصفحات والمميزات**
