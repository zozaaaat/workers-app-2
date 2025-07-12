import React, { useState, useEffect, useRef } from 'react'

// أنواع الوثائق المحددة مسبقاً للشركة
const COMPANY_DOCUMENT_TYPES = [
  { value: 'commercial_license', label: 'الرخصة التجارية', category: 'legal' },
  { value: 'rent_receipt', label: 'إيصال الإيجار', category: 'financial' },
  { value: 'tax_file', label: 'الملف الضريبي', category: 'financial' },
  { value: 'chamber_membership', label: 'عضوية الغرفة التجارية', category: 'legal' },
  { value: 'municipality_license', label: 'ترخيص البلدية', category: 'legal' },
  { value: 'civil_defense_license', label: 'ترخيص الدفاع المدني', category: 'safety' },
  { value: 'labor_office_license', label: 'ترخيص مكتب العمل', category: 'hr' },
  { value: 'social_insurance', label: 'التأمينات الاجتماعية', category: 'hr' },
  { value: 'bank_account', label: 'حساب بنكي', category: 'financial' },
  { value: 'vat_certificate', label: 'شهادة ضريبة القيمة المضافة', category: 'financial' },
  { value: 'insurance_policy', label: 'وثيقة التأمين', category: 'operational' },
  { value: 'other', label: 'أخرى', category: 'other' }
]

interface CompanyDocument {
  id: number
  name: string
  type: string
  category: 'legal' | 'financial' | 'operational' | 'hr' | 'safety' | 'other'
  upload_date: string
  file_path: string
  size: number
  description: string
  customType?: string
  status: 'uploading' | 'completed' | 'error'
  progress?: number
}

const CompanyDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<CompanyDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  
  // Upload form states
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('')
  const [customDocumentType, setCustomDocumentType] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // TODO: جلب وثائق الشركة من API
    setLoading(false)
  }, [])

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return `حجم الملف يجب أن يكون أقل من 10 ميجابايت`
    }

    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']
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
    setShowUploadForm(true)
    setSelectedDocumentType('')
    setCustomDocumentType('')
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedDocumentType) {
      alert('يرجى اختيار الملفات ونوع الوثيقة')
      return
    }
    if (selectedDocumentType === 'other' && !customDocumentType.trim()) {
      alert('يرجى إدخال نوع الوثيقة المخصص')
      return
    }

    setUploading(true)
    try {
      const uploadedDocs: CompanyDocument[] = []
      
      for (const file of selectedFiles) {
        const docType = COMPANY_DOCUMENT_TYPES.find(t => t.value === selectedDocumentType)
        const category = docType?.category || 'other'
        
        const newDoc: CompanyDocument = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: selectedDocumentType === 'other' ? customDocumentType : selectedDocumentType,
          category: category as any,
          upload_date: new Date().toLocaleDateString('ar-SA'),
          file_path: URL.createObjectURL(file),
          size: file.size,
          description: docType?.label || customDocumentType || 'وثيقة شركة',
          customType: selectedDocumentType === 'other' ? customDocumentType : undefined,
          status: 'uploading',
          progress: 0
        }
        
        uploadedDocs.push(newDoc)
        setDocuments(prev => [...prev, newDoc])

        // محاكاة رفع الملف
        const uploadProgress = setInterval(() => {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, progress: Math.min((doc.progress || 0) + 10, 100) }
              : doc
          ))
        }, 200)

        // إنهاء الرفع بعد 2 ثانية
        setTimeout(() => {
          clearInterval(uploadProgress)
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, status: 'completed', progress: 100 }
              : doc
          ))
        }, 2000)
      }

    } catch (error) {
      console.error('Error uploading documents:', error)
      alert('فشل في رفع الوثائق')
    } finally {
      setUploading(false)
      setShowUploadForm(false)
      setSelectedFiles([])
      setSelectedDocumentType('')
      setCustomDocumentType('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCancel = () => {
    setShowUploadForm(false)
    setSelectedFiles([])
    setSelectedDocumentType('')
    setCustomDocumentType('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    handleFileSelection(files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files)
  }

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory
    return matchesSearch && matchesCategory
  })

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
        <h1 className="text-3xl font-bold text-gray-900">وثائق الشركة</h1>
        <button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="btn-primary"
        >
          {showUploadForm ? 'إلغاء الرفع' : 'رفع وثيقة جديدة'}
        </button>
      </div>

      {/* نموذج رفع الوثائق */}
      {showUploadForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">رفع وثائق جديدة</h2>
          
          {/* منطقة رفع الملفات */}
          {selectedFiles.length === 0 ? (
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
                hover:border-blue-400 hover:bg-blue-50
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleInputChange}
                className="hidden"
                multiple
              />

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <p className="text-lg font-medium text-gray-900 mb-2">
                  اسحب الملفات هنا أو انقر للاختيار
                </p>
                
                <p className="text-sm text-gray-500 mb-2">
                  الملفات المدعومة: PDF, DOC, DOCX, JPG, PNG
                </p>
                
                <p className="text-xs text-gray-400">
                  الحد الأقصى لحجم الملف: 10 ميجابايت
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">تفاصيل الملفات المختارة</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">الملفات المختارة:</p>
                <ul className="list-disc ml-6 space-y-1">
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
                  نوع الوثيقة *
                </label>
                <select
                  value={selectedDocumentType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDocumentType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">اختر نوع الوثيقة</option>
                  {COMPANY_DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDocumentType === 'other' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الوثيقة المخصص *
                  </label>
                  <input
                    type="text"
                    value={customDocumentType}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomDocumentType(e.target.value)}
                    placeholder="أدخل نوع الوثيقة"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={!selectedDocumentType || (selectedDocumentType === 'other' && !customDocumentType.trim()) || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'جاري الرفع...' : 'رفع الوثائق'}
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
        </div>
      )}

      {/* أدوات البحث والتصفية */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="البحث في الوثائق..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="input flex-1"
        />
        <select
          value={filterCategory}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
          className="input w-full md:w-48"
        >
          <option value="all">جميع التصنيفات</option>
          <option value="legal">قانونية</option>
          <option value="financial">مالية</option>
          <option value="operational">تشغيلية</option>
          <option value="hr">موارد بشرية</option>
          <option value="safety">سلامة</option>
          <option value="other">أخرى</option>
        </select>
      </div>

      {/* عرض الوثائق */}
      <div className="card">
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد وثائق مرفوعة حالياً
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc: CompanyDocument) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate">{doc.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    doc.category === 'legal' ? 'bg-blue-100 text-blue-700' :
                    doc.category === 'financial' ? 'bg-green-100 text-green-700' :
                    doc.category === 'operational' ? 'bg-purple-100 text-purple-700' :
                    doc.category === 'hr' ? 'bg-orange-100 text-orange-700' :
                    doc.category === 'safety' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {doc.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{doc.description}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>{doc.upload_date}</span>
                  <span>{formatFileSize(doc.size)}</span>
                </div>

                {/* شريط التقدم للملفات التي يتم رفعها */}
                {doc.status === 'uploading' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>جاري الرفع...</span>
                      <span>{doc.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${doc.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* حالة الرفع */}
                {doc.status === 'completed' && (
                  <div className="mb-3 flex items-center text-green-600 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    تم الرفع بنجاح
                  </div>
                )}

                {doc.status === 'error' && (
                  <div className="mb-3 flex items-center text-red-600 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    فشل في الرفع
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button 
                    className="btn btn-secondary text-xs flex-1"
                    disabled={doc.status === 'uploading'}
                  >
                    عرض
                  </button>
                  <button 
                    className="btn btn-secondary text-xs flex-1"
                    disabled={doc.status === 'uploading'}
                  >
                    تحميل
                  </button>
                  <button 
                    className="btn btn-danger text-xs"
                    disabled={doc.status === 'uploading'}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* إحصائيات الوثائق */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {documents.filter((d: CompanyDocument) => d.category === 'legal').length}
          </div>
          <div className="text-gray-600">قانونية</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {documents.filter((d: CompanyDocument) => d.category === 'financial').length}
          </div>
          <div className="text-gray-600">مالية</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {documents.filter((d: CompanyDocument) => d.category === 'operational').length}
          </div>
          <div className="text-gray-600">تشغيلية</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {documents.filter((d: CompanyDocument) => d.category === 'hr').length}
          </div>
          <div className="text-gray-600">موارد بشرية</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {documents.filter((d: CompanyDocument) => d.category === 'safety').length}
          </div>
          <div className="text-gray-600">سلامة</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-600">
            {documents.filter((d: CompanyDocument) => d.category === 'other').length}
          </div>
          <div className="text-gray-600">أخرى</div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDocuments
