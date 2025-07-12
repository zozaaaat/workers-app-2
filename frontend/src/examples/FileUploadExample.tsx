import React, { useState } from 'react'
import FileUpload from '../components/common/FileUpload'

// مثال على استخدام مكون FileUpload المحدث
const FileUploadExample: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  const handleFileSubmit = (data: {
    file: File
    fileType: string
    customType?: string
    entityId?: string | number
  }) => {
    console.log('بيانات الملف المرفوع:', data)
    
    // هنا يمكنك إرسال البيانات إلى الخادم
    // مثال:
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('file_type', data.fileType)
    if (data.customType) {
      formData.append('custom_type', data.customType)
    }
    if (data.entityId) {
      formData.append('entity_id', data.entityId.toString())
    }

    // محاكاة رفع الملف
    setTimeout(() => {
      setUploadedFiles(prev => [...prev, {
        id: Date.now(),
        fileName: data.file.name,
        fileType: data.fileType,
        customType: data.customType,
        size: data.file.size,
        uploadDate: new Date().toISOString()
      }])
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">رفع الملفات</h1>
      
      <div className="space-y-6">
        {/* مكون رفع الملفات */}
        <FileUpload
          onFileSubmit={handleFileSubmit}
          entityId="123" // معرف الكيان المرتبط (موظف، شركة، إلخ)
          maxSize={5} // 5 ميجابايت
          className="mb-6"
        />

        {/* عرض الملفات المرفوعة */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">الملفات المحفوظة</h2>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-sm text-gray-500">
                        النوع: {file.customType || file.fileType} • 
                        الحجم: {(file.size / 1024 / 1024).toFixed(2)} ميجابايت • 
                        التاريخ: {new Date(file.uploadDate).toLocaleDateString('ar')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        تحميل
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUploadExample
