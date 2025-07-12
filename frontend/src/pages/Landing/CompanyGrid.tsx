import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Company } from '../../types'
import { companiesServiceNew } from '../../services/companies-new'
// import { mockCompaniesService } from '../../services/mock-auth'

interface CompanyCardProps {
  company: Company
  onLogin: (companyId: number) => void
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onLogin }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* شعار الشركة */}
      <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        {company.logo ? (
          <img
            src={company.logo}
            alt={`شعار ${company.name}`}
            className="h-16 w-16 object-contain rounded-full bg-white p-2"
          />
        ) : (
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {company.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* معلومات الشركة */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
          {company.name}
        </h3>
        
        {company.description && (
          <p className="text-gray-600 text-sm mb-4 text-center line-clamp-2">
            {company.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {company.email && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{company.email}</span>
            </div>
          )}
          
          {company.phone && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{company.phone}</span>
            </div>
          )}

          {company.address && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{company.address}</span>
            </div>
          )}
        </div>

        {/* حالة الشركة */}
        <div className="flex items-center justify-center mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            company.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ml-1 ${
              company.is_active ? 'bg-green-400' : 'bg-red-400'
            }`}></span>
            {company.is_active ? 'نشط' : 'غير نشط'}
          </span>
        </div>

        {/* زر الدخول */}
        <button
          onClick={() => onLogin(company.id)}
          disabled={!company.is_active}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            company.is_active
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {company.is_active ? 'دخول النظام' : 'الشركة غير متاحة'}
        </button>
      </div>
    </div>
  )
}

const CompanyGrid: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const response = await companiesServiceNew.getAll()
        setCompanies(((response.items ?? response.data ?? []) as Company[]).filter(company => company.is_active))
      } catch (err) {
        setError('حدث خطأ في جلب بيانات الشركات')
        console.error('Error fetching companies:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const handleCompanyLogin = (companyId: number) => {
    navigate(`/auth/company/${companyId}/login`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الشركات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في التحميل</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              نظام إدارة العمال
            </h1>
            <p className="text-lg text-gray-600">
              اختر الشركة للدخول إلى النظام
            </p>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {companies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              لا توجد شركات متاحة
            </h3>
            <p className="text-gray-500">
              لا توجد شركات نشطة في النظام حالياً
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                الشركات المتاحة ({companies.length})
              </h2>
              <p className="text-gray-600">
                انقر على بطاقة الشركة للدخول إلى نظامها
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onLogin={handleCompanyLogin}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 نظام إدارة العمال. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CompanyGrid
