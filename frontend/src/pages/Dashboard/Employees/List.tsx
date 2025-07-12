import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Employee {
  id: number
  name: string
  email?: string
  phone?: string
  position: string
  department: string
  hire_date: string
  status: 'active' | 'inactive' | 'suspended'
}

const EmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // TODO: جلب بيانات العمال من API
    setLoading(false)
  }, [])

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold text-gray-900">إدارة العمال</h1>
        <Link
          to="/dashboard/employees/add"
          className="btn-primary"
        >
          إضافة عامل جديد
        </Link>
      </div>

      {/* شريط البحث */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="البحث في العمال..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input max-w-md"
        />
      </div>

      {/* القائمة العلوية */}
      <div className="mb-4 flex gap-4">
        <Link to="/dashboard/employees" className="btn-primary">
          جميع العمال
        </Link>
        <Link to="/dashboard/employees/archive" className="btn-secondary">
          الأرشيف
        </Link>
      </div>

      {/* جدول العمال */}
      <div className="card overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد عمال مسجلين حالياً
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
                    <td className="table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : employee.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.status === 'active' ? 'نشط' : 
                         employee.status === 'inactive' ? 'غير نشط' : 'معلق'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/employees/edit/${employee.id}`}
                          className="btn btn-secondary text-xs"
                        >
                          تعديل
                        </Link>
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
    </div>
  )
}

export default EmployeesList
