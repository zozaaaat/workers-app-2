import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface ArchivedEmployee {
  id: number
  name: string
  position: string
  department: string
  hire_date: string
  termination_date: string
  termination_reason: string
  status: 'terminated' | 'resigned' | 'retired'
}

const EmployeesArchive: React.FC = () => {
  const [employees, setEmployees] = useState<ArchivedEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // TODO: جلب بيانات العمال المؤرشفين من API
    setLoading(false)
  }, [])

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'terminated':
        return 'فُصل'
      case 'resigned':
        return 'استقال'
      case 'retired':
        return 'تقاعد'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'terminated':
        return 'bg-red-100 text-red-800'
      case 'resigned':
        return 'bg-yellow-100 text-yellow-800'
      case 'retired':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
        <h1 className="text-3xl font-bold text-gray-900">أرشيف العمال</h1>
        <Link
          to="/dashboard/employees"
          className="btn-secondary"
        >
          العودة للعمال النشطين
        </Link>
      </div>

      {/* شريط البحث */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="البحث في الأرشيف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input max-w-md"
        />
      </div>

      {/* جدول العمال المؤرشفين */}
      <div className="card overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد عمال في الأرشيف حالياً
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-cell">الاسم</th>
                  <th className="table-cell">المنصب</th>
                  <th className="table-cell">القسم</th>
                  <th className="table-cell">تاريخ التوظيف</th>
                  <th className="table-cell">تاريخ انتهاء الخدمة</th>
                  <th className="table-cell">سبب انتهاء الخدمة</th>
                  <th className="table-cell">الحالة</th>
                  <th className="table-cell">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-200">
                    <td className="table-cell font-medium">{employee.name}</td>
                    <td className="table-cell">{employee.position}</td>
                    <td className="table-cell">{employee.department}</td>
                    <td className="table-cell">{employee.hire_date}</td>
                    <td className="table-cell">{employee.termination_date}</td>
                    <td className="table-cell">{employee.termination_reason}</td>
                    <td className="table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}
                      >
                        {getStatusLabel(employee.status)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // TODO: إعادة تفعيل العامل
                            console.log('Reactivate employee:', employee.id)
                          }}
                          className="btn btn-primary text-xs"
                        >
                          إعادة تفعيل
                        </button>
                        <Link
                          to={`/dashboard/employees/${employee.id}/files`}
                          className="btn btn-secondary text-xs"
                        >
                          الملفات
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* إحصائيات الأرشيف */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {employees.filter(e => e.status === 'terminated').length}
          </div>
          <div className="text-gray-600">عمال مفصولين</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {employees.filter(e => e.status === 'resigned').length}
          </div>
          <div className="text-gray-600">عمال مستقيلين</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {employees.filter(e => e.status === 'retired').length}
          </div>
          <div className="text-gray-600">عمال متقاعدين</div>
        </div>
      </div>
    </div>
  )
}

export default EmployeesArchive
