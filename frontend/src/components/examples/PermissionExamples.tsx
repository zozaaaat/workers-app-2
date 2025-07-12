import React from 'react'
import { 
  usePermissions, 
  useCanEditLicenses, 
  useCanAddEmployees, 
  useIsManager,
  useIsAdmin,
  useCanAccessPage,
  useCanUseFeature,
  ProtectedComponent,
  PERMISSIONS 
} from '../../context/PermissionContext'

/**
 * مثال على كيفية استخدام نظام الصلاحيات المبني على الأدوار
 * 
 * هذا المكون يوضح كيفية:
 * 1. التحقق من صلاحيات المستخدم المختلفة
 * 2. إخفاء/إظهار المميزات حسب الدور
 * 3. التحكم في الوصول للصفحات والوظائف
 */

const PermissionExamples: React.FC = () => {
  const { 
    hasPermission, 
    hasRole, 
    userRole, 
    canAccessPage,
    canUseFeature 
  } = usePermissions()
  
  // استخدام الـ hooks المخصصة للتحقق من الصلاحيات
  const canEditLicenses = useCanEditLicenses()
  const canAddEmployees = useCanAddEmployees()
  const isManager = useIsManager()

  // استخدام المتغيرات لتجنب تحذيرات TypeScript
  console.log('Permission states:', { hasRole, canAccessPage, canUseFeature })
  const isAdmin = useIsAdmin()

  // التحقق من الوصول للصفحات
  const canAccessEmployeesPage = useCanAccessPage('/employees')
  const canAccessLicensesCreate = useCanAccessPage('/licenses/create')
  const canAccessAdminPanel = useCanAccessPage('/admin')

  // التحقق من استخدام المميزات
  const canUseBulkActions = useCanUseFeature('employee_bulk_actions')
  const canUseAdvancedReports = useCanUseFeature('advanced_analytics')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">أمثلة على استخدام نظام الصلاحيات</h1>
      
      {/* معلومات المستخدم الحالي */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">معلومات المستخدم الحالي</h2>
        <p><strong>الدور:</strong> {userRole || 'غير محدد'}</p>
        <p><strong>مدير:</strong> {isManager ? 'نعم' : 'لا'}</p>
        <p><strong>مدير عام:</strong> {isAdmin ? 'نعم' : 'لا'}</p>
      </div>

      {/* أمثلة على الصلاحيات الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">الصلاحيات الأساسية</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>تعديل التراخيص:</span>
              <span className={canEditLicenses ? 'text-green-600' : 'text-red-600'}>
                {canEditLicenses ? '✓ مسموح' : '✗ غير مسموح'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>إضافة موظفين:</span>
              <span className={canAddEmployees ? 'text-green-600' : 'text-red-600'}>
                {canAddEmployees ? '✓ مسموح' : '✗ غير مسموح'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>اعتماد الإجازات:</span>
              <span className={hasPermission(PERMISSIONS.LEAVES_APPROVE) ? 'text-green-600' : 'text-red-600'}>
                {hasPermission(PERMISSIONS.LEAVES_APPROVE) ? '✓ مسموح' : '✗ غير مسموح'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>إدارة المستخدمين:</span>
              <span className={hasPermission(PERMISSIONS.USERS_CREATE) ? 'text-green-600' : 'text-red-600'}>
                {hasPermission(PERMISSIONS.USERS_CREATE) ? '✓ مسموح' : '✗ غير مسموح'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">الوصول للصفحات</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>صفحة الموظفين:</span>
              <span className={canAccessEmployeesPage ? 'text-green-600' : 'text-red-600'}>
                {canAccessEmployeesPage ? '✓ مسموح' : '✗ غير مسموح'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>إنشاء ترخيص:</span>
              <span className={canAccessLicensesCreate ? 'text-green-600' : 'text-red-600'}>
                {canAccessLicensesCreate ? '✓ مسموح' : '✗ غير مسموح'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>لوحة الإدارة:</span>
              <span className={canAccessAdminPanel ? 'text-green-600' : 'text-red-600'}>
                {canAccessAdminPanel ? '✓ مسموح' : '✗ غير مسموح'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* أمثلة على المميزات المتقدمة */}
      <div className="bg-white p-4 border rounded-lg mb-6">
        <h3 className="font-semibold mb-3">المميزات المتقدمة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span>العمليات المجمعة للموظفين:</span>
            <span className={canUseBulkActions ? 'text-green-600' : 'text-red-600'}>
              {canUseBulkActions ? '✓ متاحة' : '✗ غير متاحة'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>التقارير المتقدمة:</span>
            <span className={canUseAdvancedReports ? 'text-green-600' : 'text-red-600'}>
              {canUseAdvancedReports ? '✓ متاحة' : '✗ غير متاحة'}
            </span>
          </div>
        </div>
      </div>

      {/* أمثلة على المكونات المحمية */}
      <div className="space-y-4">
        <h3 className="font-semibold">المكونات المحمية بالصلاحيات</h3>
        
        {/* مكون يظهر فقط للمديرين */}
        <ProtectedComponent 
          role={['hr_manager', 'admin', 'super_admin']}
          fallback={<div className="p-3 bg-gray-100 text-gray-600 rounded">هذا المحتوى متاح للمديرين فقط</div>}
        >
          <div className="p-3 bg-green-100 text-green-800 rounded">
            🎯 مرحباً بك كمدير! يمكنك الوصول لجميع المميزات الإدارية.
          </div>
        </ProtectedComponent>

        {/* مكون يظهر فقط لمن لديه صلاحية تعديل التراخيص */}
        <ProtectedComponent 
          permission={PERMISSIONS.LICENSES_EDIT}
          fallback={<div className="p-3 bg-gray-100 text-gray-600 rounded">تحتاج صلاحية تعديل التراخيص لرؤية هذا المحتوى</div>}
        >
          <div className="p-3 bg-blue-100 text-blue-800 rounded">
            📋 يمكنك تعديل وإدارة التراخيص في النظام.
          </div>
        </ProtectedComponent>

        {/* مكون يظهر فقط لمن لديه صلاحية إضافة موظفين */}
        <ProtectedComponent 
          permission={PERMISSIONS.EMPLOYEES_CREATE}
          fallback={<div className="p-3 bg-gray-100 text-gray-600 rounded">تحتاج صلاحية إضافة موظفين لرؤية هذا المحتوى</div>}
        >
          <div className="p-3 bg-purple-100 text-purple-800 rounded">
            👥 يمكنك إضافة موظفين جدد للنظام.
          </div>
        </ProtectedComponent>

        {/* مكون يظهر فقط لمدراء الموارد البشرية أو أعلى */}
        <ProtectedComponent 
          permission={[PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT]}
          requireAll={false}
          fallback={<div className="p-3 bg-gray-100 text-gray-600 rounded">تحتاج صلاحيات إدارة المستخدمين لرؤية هذا المحتوى</div>}
        >
          <div className="p-3 bg-orange-100 text-orange-800 rounded">
            ⚙️ يمكنك إدارة حسابات المستخدمين في النظام.
          </div>
        </ProtectedComponent>
      </div>

      {/* أزرار العمل المشروطة */}
      <div className="mt-6 flex flex-wrap gap-3">
        {canEditLicenses && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            تعديل التراخيص
          </button>
        )}
        
        {canAddEmployees && (
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            إضافة موظف جديد
          </button>
        )}
        
        {hasPermission(PERMISSIONS.LEAVES_APPROVE) && (
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            اعتماد الإجازات
          </button>
        )}
        
        {isAdmin && (
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            إعدادات النظام
          </button>
        )}
      </div>
    </div>
  )
}

export default PermissionExamples
