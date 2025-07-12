import React, { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface CompanyProtectedRouteProps {
  children: React.ReactNode
}

const CompanyProtectedRoute: React.FC<CompanyProtectedRouteProps> = ({ children }) => {
  const { companyId } = useParams<{ companyId: string }>()
  const { user, isAuthenticated } = useAuth()
  const [isValidCompany, setIsValidCompany] = useState<boolean | null>(null)

  useEffect(() => {
    const checkCompanyAccess = () => {
      if (!isAuthenticated || !user) {
        setIsValidCompany(false)
        return
      }

      if (!companyId) {
        setIsValidCompany(false)
        return
      }

      // التحقق من أن المستخدم مصرح له بالوصول لهذه الشركة
      const storedCompanyId = localStorage.getItem('company_id')
      if (storedCompanyId === companyId) {
        setIsValidCompany(true)
      } else {
        setIsValidCompany(false)
      }
    }

    checkCompanyAccess()
  }, [companyId, isAuthenticated, user])

  // في حالة التحميل
  if (isValidCompany === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    )
  }

  // في حالة عدم وجود صلاحية للوصول
  if (!isValidCompany) {
    return <Navigate to="/" replace />
  }

  // في حالة وجود صلاحية
  return <>{children}</>
}

export default CompanyProtectedRoute
