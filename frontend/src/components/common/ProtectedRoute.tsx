import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { canAccessPage, canUseFeature } = usePermissions()

  // في حالة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    )
  }

  // في حالة عدم تسجيل الدخول
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // في حالة وجود صلاحية مطلوبة
  if (requiredPermission) {
    const hasPermission = canAccessPage(requiredPermission) || canUseFeature(requiredPermission)
    
    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح بالوصول</h2>
            <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
          </div>
        </div>
      )
    }
  }

  // في حالة وجود صلاحية
  return <>{children}</>
}

export default ProtectedRoute
