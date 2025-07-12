import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const EditLicense: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  
  // Similar structure to Add but with data fetching
  useEffect(() => {
    console.log('Fetching license with ID:', id)
  }, [id])

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/licenses')} className="btn-secondary">
          ← رجوع
        </button>
        <h1 className="text-3xl font-bold text-gray-900">تعديل الترخيص</h1>
      </div>
      
      <div className="card">
        <p className="text-gray-600">صفحة تعديل الترخيص قيد التطوير...</p>
      </div>
    </div>
  )
}

export default EditLicense
