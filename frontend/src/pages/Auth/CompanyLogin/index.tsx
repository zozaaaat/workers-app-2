import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { Company } from '../../../types'
import { companiesServiceNew } from '../../../services/companies-new'

interface CompanyLoginProps {
  company?: Company
}

const CompanyLogin: React.FC<CompanyLoginProps> = () => {
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingCompany, setLoadingCompany] = useState(true)

  React.useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        navigate('/')
        return
      }

      try {
        setLoadingCompany(true)
        const companyData = await companiesServiceNew.getById(parseInt(companyId))
        setCompany(companyData)
        
        if (!companyData.is_active) {
          setError('هذه الشركة غير نشطة حالياً')
        }
      } catch (err) {
        setError('الشركة غير موجودة')
        console.error('Error fetching company:', err)
      } finally {
        setLoadingCompany(false)
      }
    }

    fetchCompany()
  }, [companyId, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      setError('يرجى ملء جميع الحقول')
      return
    }

    if (!company) {
      setError('بيانات الشركة غير متاحة')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // تسجيل الدخول مع معرف الشركة
      await login(formData.username, formData.password, company.id)
      
      // إعادة التوجيه لنظام الشركة
      navigate(`/company/${company.id}/dashboard`)
      
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  if (loadingCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات الشركة...</p>
        </div>
      </div>
    )
  }

  if (!company || !company.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {!company ? 'الشركة غير موجودة' : 'الشركة غير نشطة'}
          </h2>
          <p className="text-gray-600 mb-6">
            {!company 
              ? 'الشركة المطلوبة غير موجودة في النظام'
              : 'هذه الشركة غير متاحة حالياً. يرجى المحاولة لاحقاً'
            }
          </p>
          <button
            onClick={handleBackToHome}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* معلومات الشركة */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`شعار ${company.name}`}
                className="h-12 w-12 object-contain rounded-full"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {company.name.charAt(0)}
              </span>
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {company.name}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            تسجيل الدخول لنظام إدارة العمال
          </p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل اسم المستخدم"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل كلمة المرور"
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !formData.username || !formData.password}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* روابط إضافية */}
        <div className="text-center space-y-2">
          <button
            onClick={handleBackToHome}
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            العودة لاختيار شركة أخرى
          </button>
          
          <div className="text-xs text-gray-500">
            نسيت كلمة المرور؟ تواصل مع إدارة الشركة
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyLogin
