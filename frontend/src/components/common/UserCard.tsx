import React from 'react'

interface User {
  id: number
  name: string
  email?: string
  phone?: string
  role: string
  department?: string
  avatar?: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: string
  joinDate: string
}

interface UserCardProps {
  user: User
  onClick?: (user: User) => void
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onToggleStatus?: (user: User) => void
  showActions?: boolean
  compact?: boolean
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onClick,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true,
  compact = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط'
      case 'inactive':
        return 'غير نشط'
      case 'suspended':
        return 'معلق'
      default:
        return status
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'مدير':
        return '👑'
      case 'manager':
      case 'مدير قسم':
        return '👨‍💼'
      case 'supervisor':
      case 'مشرف':
        return '👷‍♂️'
      case 'employee':
      case 'موظف':
        return '👤'
      default:
        return '👤'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (compact) {
    return (
      <div 
        className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${
          onClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => onClick && onClick(user)}
      >
        {/* الصورة الشخصية */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {getInitials(user.name)}
              </span>
            </div>
          )}
        </div>

        {/* المعلومات */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </h3>
            <span className="text-sm">{getRoleIcon(user.role)}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">{user.role}</p>
        </div>

        {/* الحالة */}
        <div className="flex-shrink-0">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
            {getStatusLabel(user.status)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      {/* رأس البطاقة */}
      <div 
        className={`p-6 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={() => onClick && onClick(user)}
      >
        <div className="flex items-start gap-4">
          {/* الصورة الشخصية */}
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
          </div>

          {/* المعلومات الأساسية */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.name}
              </h3>
              <span className="text-lg">{getRoleIcon(user.role)}</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{user.role}</p>
            
            {user.department && (
              <p className="text-sm text-gray-500 mb-2">
                <span className="inline-block w-4">🏢</span>
                {user.department}
              </p>
            )}

            {user.email && (
              <p className="text-sm text-gray-500 mb-1">
                <span className="inline-block w-4">📧</span>
                {user.email}
              </p>
            )}

            {user.phone && (
              <p className="text-sm text-gray-500">
                <span className="inline-block w-4">📱</span>
                {user.phone}
              </p>
            )}
          </div>

          {/* الحالة */}
          <div className="flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
              {getStatusLabel(user.status)}
            </span>
          </div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="px-6 pb-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
          <span>انضم في: {user.joinDate}</span>
          {user.lastLogin && (
            <span>آخر دخول: {user.lastLogin}</span>
          )}
        </div>
      </div>

      {/* أزرار الإجراءات */}
      {showActions && (
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(user)
                }}
                className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                تعديل
              </button>
            )}
            
            {onToggleStatus && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStatus(user)
                }}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  user.status === 'active'
                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {user.status === 'active' ? 'إيقاف' : 'تفعيل'}
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
                    onDelete(user)
                  }
                }}
                className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                حذف
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserCard
