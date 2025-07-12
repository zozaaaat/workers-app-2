import React from 'react'
import { useNavigate } from 'react-router-dom'

const LicensesArchive: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/licenses')} className="btn-secondary">
          ← رجوع
        </button>
        <h1 className="text-3xl font-bold text-gray-900">أرشيف التراخيص</h1>
      </div>
      
      <div className="card">
        <p className="text-gray-600">صفحة أرشيف التراخيص قيد التطوير...</p>
      </div>
    </div>
  )
}

export default LicensesArchive
