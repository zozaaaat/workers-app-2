import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../common/NotificationBell'

interface TopbarProps {
  onMenuToggle?: () => void
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // TODO: تنفيذ البحث في النظام
    if (query.length > 2) {
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
  }

  const quickActions = [
    { label: 'إضافة عامل جديد', icon: '👤', path: '/dashboard/employees/add' },
    { label: 'إضافة ترخيص', icon: '📄', path: '/dashboard/licenses/add' },
    { label: 'عرض التقارير', icon: '📊', path: '/dashboard/reports' },
    { label: 'إدارة المستخدمين', icon: '⚙️', path: '/dashboard/users' }
  ]

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 relative z-10">
      {/* الجانب الأيسر - القائمة والبحث */}
      <div className="flex items-center gap-4 flex-1">
        {/* زر القائمة للموبايل */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="فتح القائمة"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* شريط البحث */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="البحث في النظام..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* نتائج البحث */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="p-3">
                <p className="text-sm text-gray-500 mb-2">نتائج البحث عن: "{searchQuery}"</p>
                <div className="space-y-2">
                  <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <p className="text-sm font-medium">أحمد محمد علي</p>
                    <p className="text-xs text-gray-500">عامل - قسم البناء</p>
                  </div>
                  <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <p className="text-sm font-medium">ترخيص البناء رقم 123</p>
                    <p className="text-xs text-gray-500">ترخيص - ينتهي في 2025/08/15</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* الجانب الأوسط - الإجراءات السريعة */}
      <div className="hidden md:flex items-center gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={action.label}
          >
            <span>{action.icon}</span>
            <span className="hidden lg:inline">{action.label}</span>
          </button>
        ))}
      </div>

      {/* الجانب الأيمن - الإشعارات والمستخدم */}
      <div className="flex items-center gap-4">
        {/* الإشعارات */}
        <NotificationBell />

        {/* معلومات المستخدم */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'المدير العام'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'مدير النظام'}</p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'أ'}
              </span>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* قائمة المستخدم */}
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <a
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>👤</span>
                الملف الشخصي
              </a>
              <a
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>⚙️</span>
                الإعدادات
              </a>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <span>🚪</span>
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>

      {/* خلفية لإغلاق القوائم */}
      {(showUserMenu || showSearchResults) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowUserMenu(false)
            setShowSearchResults(false)
          }}
        />
      )}
    </header>
  )
}

export default Topbar
