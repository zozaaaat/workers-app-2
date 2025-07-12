import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../../context/PermissionContext'

interface QuickActionsProps {
  companyId: number
  userRole?: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  path: string
  permission?: string
  color: string
  bgColor: string
}

const QuickActions: React.FC<QuickActionsProps> = ({ companyId }) => {
  const navigate = useNavigate()
  const { canAccessPage, canUseFeature } = usePermissions()

  const quickActions: QuickAction[] = [
    {
      id: 'add-employee',
      title: 'إضافة عامل جديد',
      description: 'إضافة عامل جديد إلى قاعدة البيانات',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      path: `/company/${companyId}/employees/add`,
      permission: 'employees.create',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 'import-employees',
      title: 'استيراد عمال',
      description: 'استيراد قائمة العمال من ملف Excel',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      path: `/company/${companyId}/employees/import`,
      permission: 'employees.import',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      id: 'add-license',
      title: 'إضافة ترخيص',
      description: 'إضافة ترخيص جديد للشركة',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: `/company/${companyId}/licenses/add`,
      permission: 'licenses.create',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      id: 'create-task',
      title: 'إنشاء مهمة',
      description: 'إنشاء مهمة جديدة للمتابعة',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      path: `/company/${companyId}/tasks/add`,
      permission: 'tasks.create',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100'
    },
    {
      id: 'view-reports',
      title: 'التقارير',
      description: 'عرض التقارير والإحصائيات',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: `/company/${companyId}/reports`,
      permission: 'reports.view',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100'
    },
    {
      id: 'manage-users',
      title: 'إدارة المستخدمين',
      description: 'إدارة مستخدمي النظام والصلاحيات',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      path: `/company/${companyId}/admin/users`,
      permission: 'users.view',
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    }
  ]

  const handleActionClick = (action: QuickAction) => {
    navigate(action.path)
  }

  const hasPermission = (permission?: string) => {
    if (!permission) return true
    return canAccessPage(permission) || canUseFeature(permission)
  }

  const filteredActions = quickActions.filter(action => hasPermission(action.permission))

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">الإجراءات السريعة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`${action.bgColor} p-6 rounded-lg border border-transparent transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-right`}
          >
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 ${action.color}`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${action.color}`}>
                  {action.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {action.description}
                </p>
              </div>
              <div className={`flex-shrink-0 ${action.color}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredActions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🔒</div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            لا توجد إجراءات متاحة
          </h3>
          <p className="text-sm text-gray-500">
            لا توجد صلاحيات كافية لعرض الإجراءات السريعة
          </p>
        </div>
      )}
    </div>
  )
}

export default QuickActions
