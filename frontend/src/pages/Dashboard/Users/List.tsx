import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  last_login?: string
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // TODO: جلب بيانات المستخدمين من API
    setLoading(false)
  }, [])

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير نظام'
      case 'manager':
        return 'مدير'
      case 'user':
        return 'مستخدم'
      default:
        return role
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <div className="flex gap-2">
          <Link to="/dashboard/users/add" className="btn-primary">
            إضافة مستخدم جديد
          </Link>
          <Link to="/dashboard/users/permissions" className="btn-secondary">
            إدارة الصلاحيات
          </Link>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="البحث في المستخدمين..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input max-w-md"
        />
      </div>

      {/* جدول المستخدمين */}
      <div className="card overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد مستخدمين مسجلين حالياً
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-cell">اسم المستخدم</th>
                  <th className="table-cell">الاسم الكامل</th>
                  <th className="table-cell">البريد الإلكتروني</th>
                  <th className="table-cell">الدور</th>
                  <th className="table-cell">الحالة</th>
                  <th className="table-cell">تاريخ التسجيل</th>
                  <th className="table-cell">آخر دخول</th>
                  <th className="table-cell">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200">
                    <td className="table-cell font-medium">{user.username}</td>
                    <td className="table-cell">{user.full_name}</td>
                    <td className="table-cell">{user.email}</td>
                    <td className="table-cell">{getRoleLabel(user.role)}</td>
                    <td className="table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                      >
                        {user.status === 'active' ? 'نشط' : 
                         user.status === 'inactive' ? 'غير نشط' : 'معلق'}
                      </span>
                    </td>
                    <td className="table-cell">{user.created_at}</td>
                    <td className="table-cell">{user.last_login || 'لم يدخل بعد'}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/users/edit/${user.id}`}
                          className="btn btn-secondary text-xs"
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => {
                            // TODO: تغيير حالة المستخدم
                            console.log('Toggle user status:', user.id)
                          }}
                          className="btn btn-warning text-xs"
                        >
                          {user.status === 'active' ? 'تعليق' : 'تفعيل'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* إحصائيات المستخدمين */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-gray-600">مديري النظام</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.role === 'manager').length}
          </div>
          <div className="text-gray-600">المديرين</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'user').length}
          </div>
          <div className="text-gray-600">المستخدمين</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="text-gray-600">النشطين</div>
        </div>
      </div>
    </div>
  )
}

export default UsersList
