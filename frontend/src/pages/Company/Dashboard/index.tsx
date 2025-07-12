import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { Company } from '../../../types'
import { companiesServiceNew } from '../../../services/companies-new'
import DynamicSidebar from '../../../components/layout/DynamicSidebar'
import CompanyStats from '../../../components/Company/CompanyStats'
import QuickActions from '../../../components/Company/QuickActions'

const CompanyDashboard: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // دالة مساعدة للحصول على الدور الأساسي للمستخدم
  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return 'مستخدم'
    return user.roles[0] // أول دور في المصفوفة
  }

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        navigate('/')
        return
      }

      try {
        setLoading(true)
        const companyData = await companiesServiceNew.getById(parseInt(companyId))
        setCompany(companyData)
        
        // التحقق من أن المستخدم مصرح له بالوصول لهذه الشركة
        const storedCompanyId = localStorage.getItem('company_id')
        if (storedCompanyId !== companyId) {
          throw new Error('غير مصرح بالوصول لهذه الشركة')
        }
        
      } catch (err: any) {
        setError(err.message || 'حدث خطأ في جلب بيانات الشركة')
        console.error('Error fetching company:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [companyId, navigate])

  const handleLogout = async () => {
    await logout()
    localStorage.removeItem('company_id')
    navigate('/')
  }

  const handleSwitchCompany = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في الوصول</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={handleSwitchCompany}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              اختيار شركة أخرى
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* الشريط الجانبي الديناميكي */}
      <DynamicSidebar 
        company={company}
        user={user}
        onLogout={handleLogout}
        onSwitchCompany={handleSwitchCompany}
      />

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* شريط العلوي */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  لوحة تحكم {company.name}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  مرحباً {user?.name}, أهلاً بك في نظام إدارة العمال
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* معلومات الشركة */}
                <div className="flex items-center space-x-2">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={`شعار ${company.name}`}
                      className="h-10 w-10 object-contain rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {company.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{company.name}</p>
                    <p className="text-xs text-gray-500">{getUserRole()}</p>
                  </div>
                </div>

                {/* أزرار العمليات */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSwitchCompany}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    تغيير الشركة
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* إحصائيات الشركة */}
            <div className="mb-8">
              <CompanyStats companyId={company.id} />
            </div>

            {/* الإجراءات السريعة */}
            <div className="mb-8">
              <QuickActions companyId={company.id} userRole={getUserRole()} />
            </div>

            {/* المحتوى الديناميكي حسب الصفحة */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  نظرة عامة على الأنشطة
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* العمال الجدد */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">العمال الجدد</div>
                        <div className="text-sm text-gray-500">هذا الشهر</div>
                      </div>
                    </div>
                  </div>

                  {/* التراخيص المنتهية */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">تراخيص منتهية</div>
                        <div className="text-sm text-gray-500">تحتاج تجديد</div>
                      </div>
                    </div>
                  </div>

                  {/* المهام المعلقة */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">مهام معلقة</div>
                        <div className="text-sm text-gray-500">تحتاج متابعة</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CompanyDashboard
