import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { usePermissions } from '../../context/PermissionContext'
import { Company } from '../../types'
import { User } from '../../context/AuthContext'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  permission?: string
  badge?: number
  submenu?: MenuItem[]
}

interface DynamicSidebarProps {
  company: Company
  user: User | null
  onLogout: () => void
  onSwitchCompany: () => void
}

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  company,
  user,
  onLogout,
  onSwitchCompany
}) => {
  const location = useLocation()
  const { canAccessPage, canUseFeature } = usePermissions()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // قائمة العناصر الأساسية
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
        </svg>
      ),
      path: `/company/${company.id}/dashboard`,
      permission: 'dashboard'
    },
    {
      id: 'employees',
      label: 'إدارة العمال',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      path: `/company/${company.id}/employees`,
      permission: 'employees',
      submenu: [
        {
          id: 'employees-list',
          label: 'قائمة العمال',
          icon: <div className="w-2 h-2 bg-current rounded-full"></div>,
          path: `/company/${company.id}/employees`,
          permission: 'employees.view'
        },
        {
          id: 'employees-add',
          label: 'إضافة عامل',
          icon: <div className="w-2 h-2 bg-current rounded-full"></div>,
          path: `/company/${company.id}/employees/add`,
          permission: 'employees.create'
        },
        {
          id: 'employees-import',
          label: 'استيراد العمال',
          icon: <div className="w-2 h-2 bg-current rounded-full"></div>,
          path: `/company/${company.id}/employees/import`,
          permission: 'employees.import'
        }
      ]
    },
    {
      id: 'licenses',
      label: 'إدارة التراخيص',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: `/company/${company.id}/licenses`,
      permission: 'licenses',
      submenu: [
        {
          id: 'licenses-list',
          label: 'قائمة التراخيص',
          icon: <div className="w-2 h-2 bg-current rounded-full"></div>,
          path: `/company/${company.id}/licenses`,
          permission: 'licenses.view'
        },
        {
          id: 'licenses-expiring',
          label: 'التراخيص المنتهية',
          icon: <div className="w-2 h-2 bg-current rounded-full"></div>,
          path: `/company/${company.id}/licenses/expiring`,
          permission: 'licenses.view'
        }
      ]
    },
    {
      id: 'tasks',
      label: 'إدارة المهام',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      path: `/company/${company.id}/tasks`,
      permission: 'tasks'
    },
    {
      id: 'documents',
      label: 'إدارة الوثائق',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      path: `/company/${company.id}/documents`,
      permission: 'documents'
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: `/company/${company.id}/reports`,
      permission: 'reports'
    }
  ]

  // إضافة عناصر الإدارة للمدراء
  if (canAccessPage('users') || canAccessPage('permissions') || canAccessPage('companies')) {
    menuItems.push({
      id: 'admin',
      label: 'الإدارة',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: `/company/${company.id}/admin`,
      permission: 'admin',
      submenu: [
        ...(canAccessPage('users') ? [{
          id: 'admin-users',
          label: 'إدارة المستخدمين',
          icon: <div className="w-2 h-2 bg-current rounded-full"></div>,
          path: `/company/${company.id}/admin/users`,
          permission: 'users.view'
        }] : []),
        ...(canAccessPage('permissions') ? [{
          id: 'admin-permissions',
          label: 'إدارة الصلاحيات',
          icon: <div className="w-2 h-2 bg-current rounded-full"></div>,
          path: `/company/${company.id}/admin/permissions`,
          permission: 'permissions.view'
        }] : []),
        ...(canAccessPage('companies') ? [{
          id: 'admin-company-settings',
          label: 'إعدادات الشركة',
          icon: <div className="w-2 h-2 bg-current rounded-full"></div>,
          path: `/company/${company.id}/admin/settings`,
          permission: 'companies.edit'
        }] : [])
      ]
    })
  }

  const toggleSubmenu = (menuId: string) => {
    setOpenSubmenu(openSubmenu === menuId ? null : menuId)
  }

  const isActiveLink = (path: string) => {
    return location.pathname === path
  }

  const hasPermission = (permission?: string) => {
    if (!permission) return true
    return canAccessPage(permission) || canUseFeature(permission)
  }

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission))

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* رأس الشريط الجانبي */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`شعار ${company.name}`}
                  className="h-8 w-8 object-contain rounded"
                />
              ) : (
                <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {company.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <div className="text-sm font-medium truncate">{company.name}</div>
                <div className="text-xs text-gray-400">{typeof user?.role === 'string' ? user?.role : 'مستخدم'}</div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-700 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* عناصر القائمة */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <div key={item.id}>
            {/* العنصر الرئيسي */}
            <div>
              {item.submenu ? (
                <button
                  onClick={() => toggleSubmenu(item.id)}
                  className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    openSubmenu === item.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="ml-3">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-right">{item.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          openSubmenu === item.id ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive || isActiveLink(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <span className="ml-3">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="flex-1 text-right">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 bg-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )}
            </div>

            {/* القائمة الفرعية */}
            {item.submenu && openSubmenu === item.id && !isCollapsed && (
              <div className="mr-6 mt-1 space-y-1">
                {item.submenu
                  .filter(subItem => hasPermission(subItem.permission))
                  .map((subItem) => (
                    <NavLink
                      key={subItem.id}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `flex items-center px-2 py-2 text-sm rounded-md transition-colors ${
                          isActive || isActiveLink(subItem.path)
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`
                      }
                    >
                      <span className="ml-2">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </NavLink>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* أزرار السفل */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {!isCollapsed && (
          <>
            <button
              onClick={onSwitchCompany}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>تغيير الشركة</span>
            </button>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-red-700 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>تسجيل الخروج</span>
            </button>
          </>
        )}
        
        {isCollapsed && (
          <div className="space-y-2">
            <button
              onClick={onSwitchCompany}
              className="w-full p-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
              title="تغيير الشركة"
            >
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            
            <button
              onClick={onLogout}
              className="w-full p-2 text-gray-300 rounded-md hover:bg-red-700 hover:text-white transition-colors"
              title="تسجيل الخروج"
            >
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DynamicSidebar
