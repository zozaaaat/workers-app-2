import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileUpload } from '../../../components/common'
import { documentsService, employeesService } from '../../../services'
import { Document, Employee, DocumentType, DocumentTypeEnum } from '../../../types'
import { 
  formatFileSize, 
  formatRelativeTime, 
  translateDocumentType
} from '../../../utils'

const EmployeeFiles: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [files, setFiles] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filterType, setFilterType] = useState<string>('')
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])

  // جلب بيانات الموظف والملفات
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      try {
        const [employeeData, filesData] = await Promise.all([
          employeesService.getById(Number(id)),
          documentsService.getByEntity('employee', Number(id))
        ])
        setEmployee(employeeData)
        setFiles(filesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // تصفية الملفات
  const filteredFiles = files.filter(file => 
    !filterType || file.file_type === filterType
  )

  // رفع ملف جديد
  const handleFileSubmit = async (submitData: {
    file: File
    fileType: string
    customType?: string
    entityId?: string | number
  }[] | {
    file: File
    fileType: string
    customType?: string
    entityId?: string | number
  }) => {
    if (!id) return
    
    setUploading(true)
    try {
      const dataArray = Array.isArray(submitData) ? submitData : [submitData]
      
      for (const item of dataArray) {
        const newDocument = await documentsService.upload(item.file, {
          document_type: item.fileType,
          entity_type: 'employee',
          entity_id: Number(id),
          ...(item.customType && { custom_type_name: item.customType })
        })
        setFiles(prev => [...prev, newDocument])
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
    }
  }

  // حذف ملف
  const handleDeleteFile = async (fileId: number) => {
    try {
      await documentsService.delete(fileId)
      setFiles(prev => prev.filter(file => file.id !== fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  // تحميل ملف
  const handleDownloadFile = (file: Document) => {
    const link = document.createElement('a')
    link.href = `/api/documents/${file.id}/download`
    link.download = file.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // تحميل متعدد
  const handleBulkDownload = () => {
    selectedFiles.forEach(fileId => {
      const file = files.find(f => f.id === fileId)
      if (file) {
        handleDownloadFile(file)
      }
    })
  }

  // حذف متعدد
  const handleBulkDelete = async () => {
    if (window.confirm(`هل أنت متأكد من حذف ${selectedFiles.length} ملف؟`)) {
      for (const fileId of selectedFiles) {
        await handleDeleteFile(fileId)
      }
      setSelectedFiles([])
    }
  }

  // أيقونة الملف
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const iconClass = "w-5 h-5"
    
    switch (extension) {
      case 'pdf':
        return <span className={`${iconClass} text-red-500`}>📄</span>
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <span className={`${iconClass} text-green-500`}>🖼️</span>
      case 'doc':
      case 'docx':
        return <span className={`${iconClass} text-blue-500`}>📝</span>
      default:
        return <span className={`${iconClass} text-gray-500`}>📄</span>
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          لم يتم العثور على الموظف
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ملفات الموظف: {employee.full_name || `${employee.first_name} ${employee.last_name}`}
          </h1>
          <p className="text-gray-600 mt-1">
            إدارة جميع المستندات والملفات المتعلقة بالموظف
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← رجوع
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">رفع ملف جديد</h2>
        <FileUpload 
          onFileSubmit={handleFileSubmit}
          entityId={id}
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          maxSize={10}
          disabled={uploading}
        />
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              ملفات الموظف ({files.length})
            </h2>
            <div className="flex items-center gap-3">
              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">جميع الأنواع</option>
                <option value="national_id">بطاقة هوية</option>
                <option value="passport">جواز سفر</option>
                <option value="employment_contract">عقد عمل</option>
                <option value="education_certificate">شهادة تعليمية</option>
                <option value="experience_certificate">شهادة خبرة</option>
                <option value="other">أخرى</option>
              </select>

              {/* Bulk Actions */}
              {selectedFiles.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDownload}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    تحميل المحدد ({selectedFiles.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    حذف المحدد
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredFiles.map((file) => (
            <div key={file.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(prev => [...prev, file.id])
                      } else {
                        setSelectedFiles(prev => prev.filter(id => id !== file.id))
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-shrink-0">
                    {getFileIcon(file.filename)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.filename}
                    </p>
                    <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                      <span>{translateDocumentType(file.file_type)}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.file_size || 0)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(file.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleDownloadFile(file)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="تحميل"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="حذف"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد ملفات</h3>
            <p className="mt-1 text-sm text-gray-500">ابدأ برفع ملف جديد للموظف</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {files.length}
          </div>
          <div className="text-gray-600">إجمالي الملفات</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {files.filter(f => f.file_type === DocumentTypeEnum.EMPLOYMENT_CONTRACT).length}
          </div>
          <div className="text-gray-600">عقود العمل</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {files.filter(f => f.file_type === DocumentTypeEnum.EDUCATION_CERTIFICATE).length}
          </div>
          <div className="text-gray-600">الشهادات التعليمية</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {files.filter(f => f.file_type === DocumentTypeEnum.EXPERIENCE_CERTIFICATE).length}
          </div>
          <div className="text-gray-600">شهادات الخبرة</div>
        </div>
      </div>

      {/* Files Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">نظرة عامة على الملفات</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">عدد الملفات</span>
            <span className="font-semibold">{files.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">آخر رفع</span>
            <span className="font-semibold">
              {files.length > 0 ? formatRelativeTime(Math.max(...files.map(f => new Date(f.created_at).getTime())).toString()) : 'لا يوجد'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">الحجم الإجمالي</span>
            <span className="font-semibold">
              {formatFileSize(files.reduce((total, file) => total + (file.file_size || 0), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeFiles
