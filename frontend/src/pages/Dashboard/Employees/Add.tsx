import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface EmployeeForm {
  name: string
  email: string
  phone: string
  position: string
  department: string
  hire_date: string
  salary: number
  national_id: string
  address: string
  emergency_contact: string
  emergency_phone: string
}

const AddEmployee: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EmployeeForm>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hire_date: '',
    salary: 0,
    national_id: '',
    address: '',
    emergency_contact: '',
    emergency_phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // TODO: إرسال البيانات إلى API
      console.log('Employee data:', formData)
      navigate('/dashboard/employees')
    } catch (error) {
      console.error('Error adding employee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/employees')}
          className="btn-secondary"
        >
          ← رجوع
        </button>
        <h1 className="text-3xl font-bold text-gray-900">إضافة عامل جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* المعلومات الأساسية */}
          <div>
            <label className="form-label">الاسم الكامل *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="form-label">رقم الهاتف *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="form-label">رقم الهوية الوطنية</label>
            <input
              type="text"
              name="national_id"
              value={formData.national_id}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* معلومات العمل */}
          <div>
            <label className="form-label">المنصب *</label>
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">اختر المنصب</option>
              <option value="manager">مدير</option>
              <option value="supervisor">مشرف</option>
              <option value="worker">عامل</option>
              <option value="technician">فني</option>
              <option value="security">أمن</option>
            </select>
          </div>

          <div>
            <label className="form-label">القسم *</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">اختر القسم</option>
              <option value="administration">الإدارة</option>
              <option value="construction">البناء</option>
              <option value="maintenance">الصيانة</option>
              <option value="security">الأمن</option>
              <option value="cleaning">النظافة</option>
            </select>
          </div>

          <div>
            <label className="form-label">تاريخ التوظيف *</label>
            <input
              type="date"
              name="hire_date"
              value={formData.hire_date}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="form-label">الراتب</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="input"
              min="0"
            />
          </div>

          {/* معلومات الطوارئ */}
          <div>
            <label className="form-label">جهة الاتصال في الطوارئ</label>
            <input
              type="text"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="form-label">رقم هاتف الطوارئ</label>
            <input
              type="tel"
              name="emergency_phone"
              value={formData.emergency_phone}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* العنوان */}
          <div className="md:col-span-2">
            <label className="form-label">العنوان</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input h-24"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ العامل'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/employees')}
            className="btn-secondary"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddEmployee
