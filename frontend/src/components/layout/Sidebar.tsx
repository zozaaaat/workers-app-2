import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarItem {
  id: string
  label: string
  icon: string
  path?: string
  children?: SidebarItem[]
}

const Sidebar: React.FC = () => {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard'])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: '🏠',
      path: '/dashboard'
    },
    {
      id: 'employees',
      label: 'إدارة العمال',
      icon: '👥',
      children: [
        { id: 'employees-list', label: 'قائمة العمال', icon: '📋', path: '/dashboard/employees' },
        { id: 'employees-add', label: 'إضافة عامل', icon: '➕', path: '/dashboard/employees/add' },
        { id: 'employees-archive', label: 'الأرشيف', icon: '📦', path: '/dashboard/employees/archive' }
      ]
    },
    {
      id: 'licenses',
      label: 'إدارة التراخيص',
      icon: '📄',
      children: [
        { id: 'licenses-list', label: 'قائمة التراخيص', icon: '📋', path: '/dashboard/licenses' },
        { id: 'licenses-add', label: 'إضافة ترخيص', icon: '➕', path: '/dashboard/licenses/add' },
        { id: 'licenses-archive', label: 'الأرشيف', icon: '📦', path: '/dashboard/licenses/archive' }
      ]
    },
    {
      id: 'leaves',
      label: 'إدارة الإجازات',
      icon: '🏖️',
      children: [
        { id: 'leaves-list', label: 'قائمة الإجازات', icon: '📋', path: '/dashboard/leaves' },
        { id: 'leaves-add', label: 'إضافة إجازة', icon: '➕', path: '/dashboard/leaves/add' },
        { id: 'leaves-archive', label: 'الأرشيف', icon: '📦', path: '/dashboard/leaves/archive' }
      ]
    },
    {
      id: 'deductions',
      label: 'إدارة الخصومات',
      icon: '💰',
      children: [
        { id: 'deductions-list', label: 'قائمة الخصومات', icon: '📋', path: '/dashboard/deductions' },
        { id: 'deductions-add', label: 'إضافة خصم', icon: '➕', path: '/dashboard/deductions/add' },
        { id: 'deductions-archive', label: 'الأرشيف', icon: '📦', path: '/dashboard/deductions/archive' }
      ]
    },
    {
      id: 'documents',
      label: 'إدارة الوثائق',
      icon: '📁',
      path: '/dashboard/documents'
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: '📊',
      path: '/dashboard/reports'
    },
    {
      id: 'users',
      label: 'إدارة المستخدمين',
      icon: '👤',
      children: [
        { id: 'users-list', label: 'قائمة المستخدمين', icon: '📋', path: '/dashboard/users' },
        { id: 'users-add', label: 'إضافة مستخدم', icon: '➕', path: '/dashboard/users/add' },
        { id: 'users-permissions', label: 'الصلاحيات', icon: '🔐', path: '/dashboard/users/permissions' }
      ]
    }
  ]

  const isActiveLink = (path: string) => {
    return location.pathname === path
  }

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const isActive = item.path && isActiveLink(item.path)

    return (
      <div key={item.id} className="mb-1">
        {item.path ? (
          <Link
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            } ${level > 0 ? 'mr-6' : ''}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpanded(item.id)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 ${
              level > 0 ? 'mr-6' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
            {hasChildren && (
              <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            )}
          </button>
        )}

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white h-full w-64 border-r border-gray-200 flex flex-col">
      {/* الشعار */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">نظام العمال</h1>
            <p className="text-sm text-gray-500">إدارة شاملة</p>
          </div>
        </div>
      </div>

      {/* قائمة التنقل */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-2">
          {sidebarItems.map(item => renderSidebarItem(item))}
        </nav>
      </div>

      {/* معلومات المستخدم */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">أ</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">المدير العام</p>
            <p className="text-xs text-gray-500">متصل الآن</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            ⚙️
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
