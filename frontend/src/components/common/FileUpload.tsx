import React, { useState, useRef } from 'react'

// أنواع الملفات المحددة مسبقاً
const PREDEFINED_FILE_TYPES = [
  { value: 'id_card', label: 'بطاقة الهوية' },
  { value: 'passport', label: 'جواز السفر' },
  { value: 'residency', label: 'الإقامة' },
  { value: 'personal_photo', label: 'الصورة الشخصية' },
  { value: 'work_permit', label: 'رخصة العمل' },
  { value: 'rent_receipt', label: 'إيصال الإيجار' },
  { value: 'salary_certificate', label: 'شهادة راتب' },
  { value: 'bank_statement', label: 'كشف حساب بنكي' },
  { value: 'medical_certificate', label: 'شهادة طبية' },
  { value: 'educational_certificate', label: 'شهادة تعليمية' },
  { value: 'contract', label: 'عقد' },
  { value: 'other', label: 'أخرى' }
]

interface FileUploadProps {
  onFileSubmit: (data: {
    file: File
    fileType: string
    customType?: string
    entityId?: string | number
  }[] | {
    file: File
    fileType: string
    customType?: string
    entityId?: string | number
  }) => void
  entityId?: string | number
  accept?: string
  maxSize?: number // بالـ MB
  className?: string
  disabled?: boolean
}

interface UploadedFile {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  id: string
  fileType: string
  customType?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSubmit,
  entityId,
  accept = ".jpg,.jpeg,.png,.pdf",
  maxSize = 10,
  className = "",
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedFileType, setSelectedFileType] = useState<string>('')
  const [customFileType, setCustomFileType] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // التحقق من حجم الملف
    if (file.size > maxSize * 1024 * 1024) {
      return `حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت`
    }

    // التحقق من نوع الملف - قبول الصور والـ PDF فقط
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      return `نوع الملف غير مدعوم. الملفات المدعومة: ${allowedTypes.join(', ')}`
    }

    return null
  }

  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = validateFile(file)
      if (error) {
        alert(`خطأ في الملف: ${error}`)
        continue
      }
      validFiles.push(file)
    }
    if (validFiles.length === 0) return
    setSelectedFiles(validFiles)
    setShowForm(true)
    setSelectedFileType('')
    setCustomFileType('')
  }

  const handleSubmit = () => {
    if (selectedFiles.length === 0 || !selectedFileType) {
      alert('يرجى اختيار الملفات ونوع الملف')
      return
    }
    if (selectedFileType === 'other' && !customFileType.trim()) {
      alert('يرجى إدخال نوع الملف المخصص')
      return
    }
    // إرسال البيانات
    const submitData = selectedFiles.map((file: File) => ({
      file,
      fileType: selectedFileType === 'other' ? customFileType : selectedFileType,
      ...(selectedFileType === 'other' && { customType: customFileType }),
      ...(entityId && { entityId })
    }))
    onFileSubmit(submitData)
    // محاكاة رفع الملفات
    selectedFiles.forEach((selectedFile: File) => {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const uploadedFile: UploadedFile = {
        file: selectedFile,
        progress: 0,
        status: 'uploading',
        id: fileId,
        fileType: selectedFileType === 'other' ? customFileType : selectedFileType,
        ...(selectedFileType === 'other' && { customType: customFileType })
      }
      setUploadedFiles((prev: UploadedFile[]) => [...prev, uploadedFile])
      // محاكاة تقدم الرفع
      const interval = setInterval(() => {
        setUploadedFiles((prev: UploadedFile[]) => 
          prev.map((f: UploadedFile) => 
            f.id === fileId 
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f
          )
        )
      }, 200)
      // إنهاء الرفع بعد 2 ثانية
      setTimeout(() => {
        clearInterval(interval)
        setUploadedFiles((prev: UploadedFile[]) => 
          prev.map((f: UploadedFile) => 
            f.id === fileId 
              ? { ...f, progress: 100, status: 'completed' }
              : f
          )
        )
      }, 2000)
    })
    // إعادة تعيين النموذج
    setSelectedFiles([])
    setShowForm(false)
    setSelectedFileType('')
    setCustomFileType('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancel = () => {
    setSelectedFiles([])
    setShowForm(false)
    setSelectedFileType('')
    setCustomFileType('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    handleFileSelection(files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files)
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev: UploadedFile[]) => prev.filter((f: UploadedFile) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`w-full ${className}`}>
      {/* نموذج تحديد نوع الملف */}
      {showForm && selectedFiles.length > 0 && (
        <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">تفاصيل الملفات المختارة</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">الملفات المختارة:</p>
            <ul className="list-disc ml-6">
              {selectedFiles.map((file: File, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-gray-500">({formatFileSize(file.size)})</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الملف *
            </label>
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">اختر نوع الملف</option>
              {PREDEFINED_FILE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {selectedFileType === 'other' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الملف المخصص *
              </label>
              <input
                type="text"
                value={customFileType}
                onChange={(e) => setCustomFileType(e.target.value)}
                placeholder="أدخل نوع الملف"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!selectedFileType || (selectedFileType === 'other' && !customFileType.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              رفع الملف
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* منطقة رفع الملفات */}
      {!showForm && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
            multiple
          />

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <p className="text-lg font-medium text-gray-900 mb-2">
              اسحب الملفات هنا أو انقر للاختيار
            </p>
            
            <p className="text-sm text-gray-500 mb-4">
              الملفات المدعومة: الصور (JPG, PNG) والـ PDF فقط
            </p>
            
            <p className="text-xs text-gray-400">
              الحد الأقصى لحجم الملف: {maxSize} ميجابايت
            </p>
          </div>
        </div>
      )}

      {/* قائمة الملفات المرفوعة */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">الملفات المرفوعة:</h4>
          {uploadedFiles.map((uploadedFile) => (
            <div key={uploadedFile.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(uploadedFile.file.size)}</span>
                    <span>•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {PREDEFINED_FILE_TYPES.find(t => t.value === uploadedFile.fileType)?.label || uploadedFile.customType || uploadedFile.fileType}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {uploadedFile.status === 'completed' && (
                    <span className="text-green-500">✓</span>
                  )}
                  {uploadedFile.status === 'error' && (
                    <span className="text-red-500">✗</span>
                  )}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* شريط التقدم */}
              {uploadedFile.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadedFile.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload
