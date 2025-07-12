import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface LicenseForm {
  name: string
  type: 'work_permit' | 'residence' | 'professional' | 'safety' | 'other'
  issue_date: string
  expiry_date: string
  issuing_authority: string
  license_number: string
  description: string
  company_name: string
  employee_count: number
  renewal_period: number
  fees: number
  status: 'active' | 'expired' | 'renewal_pending' | 'suspended'
}

const AddLicense: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LicenseForm>({
    name: '',
    type: 'work_permit',
    issue_date: '',
    expiry_date: '',
    issuing_authority: '',
    license_number: '',
    description: '',
    company_name: '',
    employee_count: 0,
    renewal_period: 12,
    fees: 0,
    status: 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // TODO: إرسال البيانات إلى API
      console.log('License data:', formData)
      navigate('/dashboard/licenses')
    } catch (error) {
      console.error('Error adding license:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/licenses')}
          className="btn-secondary"
        >
          ← رجوع
        </button>
        <h1 className="text-3xl font-bold text-gray-900">إضافة ترخيص جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* المعلومات الأساسية */}
          <div>
            <label className="form-label">اسم الترخيص *</label>
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
            <label className="form-label">نوع الترخيص *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="work_permit">تصريح عمل</option>
              <option value="residence">إقامة</option>
              <option value="professional">مهني</option>
              <option value="safety">سلامة</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div>
            <label className="form-label">رقم الترخيص *</label>
            <input
              type="text"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="form-label">جهة الإصدار *</label>
            <input
              type="text"
              name="issuing_authority"
              value={formData.issuing_authority}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* التواريخ */}
          <div>
            <label className="form-label">تاريخ الإصدار *</label>
            <input
              type="date"
              name="issue_date"
              value={formData.issue_date}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="form-label">تاريخ انتهاء الصلاحية *</label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* معلومات إضافية */}
          <div>
            <label className="form-label">اسم الشركة</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="form-label">عدد العمال المشمولين</label>
            <input
              type="number"
              name="employee_count"
              value={formData.employee_count}
              onChange={handleChange}
              className="input"
              min="0"
            />
          </div>

          <div>
            <label className="form-label">فترة التجديد (بالأشهر)</label>
            <input
              type="number"
              name="renewal_period"
              value={formData.renewal_period}
              onChange={handleChange}
              className="input"
              min="1"
            />
          </div>

          <div>
            <label className="form-label">الرسوم</label>
            <input
              type="number"
              name="fees"
              value={formData.fees}
              onChange={handleChange}
              className="input"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="form-label">حالة الترخيص *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="active">نشط</option>
              <option value="expired">منتهي الصلاحية</option>
              <option value="renewal_pending">في انتظار التجديد</option>
              <option value="suspended">معلق</option>
            </select>
          </div>

          {/* الوصف */}
          <div className="md:col-span-2">
            <label className="form-label">وصف الترخيص</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input h-24"
              rows={3}
              placeholder="أدخل وصفاً تفصيلياً للترخيص..."
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الترخيص'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/licenses')}
            className="btn-secondary"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddLicense
