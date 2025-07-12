import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface License {
  id: number
  name: string
  type: 'work_permit' | 'residence' | 'professional' | 'safety' | 'other'
  issue_date: string
  expiry_date: string
  issuing_authority: string
  status: 'active' | 'expired' | 'renewal_pending' | 'suspended'
  company_name?: string
  employee_count?: number
}

const LicensesList: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    // TODO: جلب بيانات التراخيص من API
    setLoading(false)
  }, [])

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.issuing_authority.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || license.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'work_permit':
        return 'تصريح عمل'
      case 'residence':
        return 'إقامة'
      case 'professional':
        return 'مهني'
      case 'safety':
        return 'سلامة'
      case 'other':
        return 'أخرى'
      default:
        return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط'
      case 'expired':
        return 'منتهي الصلاحية'
      case 'renewal_pending':
        return 'في انتظار التجديد'
      case 'suspended':
        return 'معلق'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'renewal_pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">إدارة التراخيص</h1>
        <Link
          to="/dashboard/licenses/add"
          className="btn-primary"
        >
          إضافة ترخيص جديد
        </Link>
      </div>

      {/* أدوات التصفية والبحث */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="البحث في التراخيص..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input flex-1"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-full md:w-48"
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="expired">منتهي الصلاحية</option>
          <option value="renewal_pending">في انتظار التجديد</option>
          <option value="suspended">معلق</option>
        </select>
      </div>

      {/* القائمة العلوية */}
      <div className="mb-4 flex gap-4">
        <Link to="/dashboard/licenses" className="btn-primary">
          جميع التراخيص
        </Link>
        <Link to="/dashboard/licenses/archive" className="btn-secondary">
          الأرشيف
        </Link>
      </div>

      {/* تنبيهات التراخيص المنتهية الصلاحية قريباً */}
      {filteredLicenses.filter(license => isExpiringSoon(license.expiry_date)).length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="text-orange-800 font-semibold mb-2">تحذير: تراخيص تنتهي صلاحيتها قريباً</h3>
          <ul className="text-orange-700">
            {filteredLicenses
              .filter(license => isExpiringSoon(license.expiry_date))
              .map(license => (
                <li key={license.id} className="mb-1">
                  {license.name} - ينتهي في {license.expiry_date}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* جدول التراخيص */}
      <div className="card overflow-hidden">
        {filteredLicenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد تراخيص مسجلة حالياً
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-cell">اسم الترخيص</th>
                  <th className="table-cell">النوع</th>
                  <th className="table-cell">جهة الإصدار</th>
                  <th className="table-cell">تاريخ الإصدار</th>
                  <th className="table-cell">تاريخ انتهاء الصلاحية</th>
                  <th className="table-cell">الحالة</th>
                  <th className="table-cell">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map((license) => (
                  <tr key={license.id} className="border-b border-gray-200">
                    <td className="table-cell font-medium">
                      {license.name}
                      {isExpiringSoon(license.expiry_date) && (
                        <span className="ml-2 text-orange-500 text-xs">⚠️</span>
                      )}
                    </td>
                    <td className="table-cell">{getTypeLabel(license.type)}</td>
                    <td className="table-cell">{license.issuing_authority}</td>
                    <td className="table-cell">{license.issue_date}</td>
                    <td className="table-cell">{license.expiry_date}</td>
                    <td className="table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}
                      >
                        {getStatusLabel(license.status)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/licenses/edit/${license.id}`}
                          className="btn btn-secondary text-xs"
                        >
                          تعديل
                        </Link>
                        <Link
                          to={`/dashboard/licenses/${license.id}/files`}
                          className="btn btn-secondary text-xs"
                        >
                          الملفات
                        </Link>
                        {license.status === 'expired' && (
                          <button
                            onClick={() => {
                              // TODO: تجديد الترخيص
                              console.log('Renew license:', license.id)
                            }}
                            className="btn btn-primary text-xs"
                          >
                            تجديد
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* إحصائيات التراخيص */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {licenses.filter(l => l.status === 'active').length}
          </div>
          <div className="text-gray-600">تراخيص نشطة</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {licenses.filter(l => l.status === 'expired').length}
          </div>
          <div className="text-gray-600">منتهية الصلاحية</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {licenses.filter(l => l.status === 'renewal_pending').length}
          </div>
          <div className="text-gray-600">في انتظار التجديد</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {licenses.filter(l => isExpiringSoon(l.expiry_date)).length}
          </div>
          <div className="text-gray-600">تنتهي قريباً</div>
        </div>
      </div>
    </div>
  )
}

export default LicensesList
