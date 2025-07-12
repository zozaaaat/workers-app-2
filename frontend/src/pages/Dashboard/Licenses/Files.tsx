import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileUpload } from '../../../components/common'
import { documentsService } from '../../../services'
import { Document, DocumentType, DocumentStatus, DocumentTypeEnum, DocumentStatusEnum } from '../../../types'
import { formatFileSize, translateDocumentType } from '../../../utils/formatters'

interface FileTypeFilter {
  label: string
  value: DocumentType | 'all'
  count: number
}

const LicenseFiles: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [files, setFiles] = useState<Document[]>([])
  const [filteredFiles, setFilteredFiles] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])
  const [selectedFileType, setSelectedFileType] = useState<DocumentType | 'all'>('all')
  const [fileTypeFilters, setFileTypeFilters] = useState<FileTypeFilter[]>([])

  // أنواع الوثائق الرسمية للتراخيص
  const officialDocumentTypes: DocumentType[] = [
    DocumentTypeEnum.LICENSE,
    DocumentTypeEnum.PASSPORT,
    DocumentTypeEnum.NATIONAL_ID,
    DocumentTypeEnum.WORK_PERMIT,
    DocumentTypeEnum.HEALTH_CERTIFICATE
  ]

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const filesData = await documentsService.getByEntity('license', parseInt(id))
        
        setFiles(filesData)
        setFilteredFiles(filesData)
        
        // إنشاء مرشحات أنواع الملفات
        const typeCounts = filesData.reduce((acc: Record<string, number>, file: Document) => {
          acc[file.file_type] = (acc[file.file_type] || 0) + 1
          return acc
        }, {})

        const filters: FileTypeFilter[] = [
          { label: 'جميع الملفات', value: 'all', count: filesData.length },
          ...Object.entries(typeCounts).map(([type, count]) => ({
            label: translateDocumentType(type as DocumentType),
            value: type as DocumentType,
            count
          }))
        ]
        
        setFileTypeFilters(filters)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  useEffect(() => {
    // تصفية الملفات حسب النوع المحدد
    if (selectedFileType === 'all') {
      setFilteredFiles(files)
    } else {
      setFilteredFiles(files.filter((file: Document) => file.file_type === selectedFileType))
    }
  }, [files, selectedFileType])

  const handleFileUpload = async (
    data: {
      file: File
      fileType: string
      customType?: string
      entityId?: string | number
    } | Array<{
      file: File
      fileType: string
      customType?: string
      entityId?: string | number
    }>
  ) => {
    setUploading(true)
    try {
      const filesArray: Array<{
        file: File
        fileType: string
        customType?: string
        entityId?: string | number
      }> = Array.isArray(data) ? data : [data]
      const uploadedFiles: Document[] = []
      for (const fileData of filesArray) {
        const uploadData = {
          file: fileData.file,
          file_type: fileData.fileType as DocumentType,
          custom_type_name: fileData.customType,
          entity_type: 'license' as const,
          entity_id: id ? parseInt(id) : undefined,
          title: `${translateDocumentType(fileData.fileType as DocumentType)} - ترخيص ${id}`,
          uploaded_by: 1 // TODO: الحصول على ID المستخدم الحالي
        }
        const newFile: Document = await documentsService.upload(fileData.file, uploadData)
        uploadedFiles.push(newFile)
      }
      setFiles((prev: Document[]) => [...prev, ...uploadedFiles])
      // تحديث الفلاتر
      setFileTypeFilters((prev: FileTypeFilter[]) => {
        let updated = [...prev]
        for (const newFile of uploadedFiles) {
          updated = updated.map((filter: FileTypeFilter) => {
            if (filter.value === 'all') {
              return { ...filter, count: filter.count + 1 }
            }
            if (filter.value === newFile.file_type) {
              return { ...filter, count: filter.count + 1 }
            }
            return filter
          })
        }
        return updated
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('فشل في رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return

    try {
      await documentsService.delete(fileId)
      setFiles((prev: Document[]) => prev.filter((file: Document) => file.id !== fileId))
      setSelectedFiles((prev: number[]) => prev.filter((id: number) => id !== fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('فشل في حذف الملف')
    }
  }

  const handleSelectFile = (fileId: number) => {
    setSelectedFiles((prev: number[]) => 
      prev.includes(fileId) 
        ? prev.filter((id: number) => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredFiles.map((file: Document) => file.id))
    }
  }

  const handleDownloadSelected = async () => {
    if (selectedFiles.length === 0) return

    try {
      for (const fileId of selectedFiles) {
        const blob = await documentsService.download(fileId)
        const file = files.find((f: Document) => f.id === fileId)
        if (file) {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = file.filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }
    } catch (error) {
      console.error('Error downloading files:', error)
      alert('فشل في تحميل الملفات')
    }
  }

  // الحصول على الوثيقة الرسمية الحالية لنوع محدد
  const getCurrentOfficialDocument = (docType: DocumentType): Document | undefined => {
    const doc = files.find((f: Document) => f.file_type === docType && f.status === DocumentStatusEnum.ACTIVE)
    return doc
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/licenses')} className="btn-secondary">
          ← رجوع
        </button>
        <h1 className="text-3xl font-bold text-gray-900">ملفات الترخيص #{id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المحتوى الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          {/* رفع ملفات متعددة */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">رفع ملفات جديدة</h2>
            <FileUpload
              entityId={id}
              onFileSubmit={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10}
              disabled={uploading}
              className="mb-4"
            />
            {uploading && (
              <div className="text-blue-600 text-center">جاري رفع الملف...</div>
            )}
          </div>

          {/* أدوات التحكم */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* فلتر نوع الملف */}
              <div className="flex flex-wrap gap-2">
                {fileTypeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFileType(filter.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedFileType === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              {/* أدوات التحديد المتعدد */}
              {filteredFiles.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {selectedFiles.length === filteredFiles.length ? 'إلغاء التحديد' : 'تحديد الكل'}
                  </button>
                  {selectedFiles.length > 0 && (
                    <button
                      onClick={handleDownloadSelected}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      تحميل المحدد ({selectedFiles.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* قائمة الملفات */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">الملفات المرفوعة</h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredFiles.length} من أصل {files.length} ملف
              </p>
            </div>
            
            <div className="p-6">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">
                    {selectedFileType === 'all' ? 'لا توجد ملفات مرفوعة' : `لا توجد ملفات من نوع ${translateDocumentType(selectedFileType as DocumentType)}`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFiles.map((file: Document) => (
                    <div key={file.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleSelectFile(file.id)}
                        className="mr-3"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900 truncate">{file.filename}</h3>
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                            {translateDocumentType(file.file_type)}
                          </span>
                          {file.is_verified && (
                            <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
                              موثق
                            </span>
                          )}
                          {file.status === DocumentStatusEnum.ACTIVE && (
                            <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs rounded-full">
                              نشط
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatFileSize(file.file_size || 0)}</span>
                          {file.created_at && (
                            <span>رُفع في {new Date(file.created_at).toLocaleDateString('ar-SA')}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => documentsService.download(file.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="تحميل"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="حذف"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* الوثائق الرسمية الحالية */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">الوثائق الرسمية الحالية</h2>
            <div className="space-y-3">
              {officialDocumentTypes.map((docType) => {
                const doc = getCurrentOfficialDocument(docType)
                return (
                  <div key={docType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {translateDocumentType(docType)}
                      </span>
                      {doc ? (
                        <div className="text-xs text-gray-600 mt-1">
                          <div className="truncate">{doc.filename}</div>
                          <div>النسخة الحالية</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-1">لا يوجد ملف حالي</div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {doc ? (
                        <span className="inline-block w-3 h-3 bg-green-400 rounded-full" title="متوفر"></span>
                      ) : (
                        <span className="inline-block w-3 h-3 bg-gray-300 rounded-full" title="غير متوفر"></span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* إحصائيات الملفات */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الملفات</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">إجمالي الملفات:</span>
                <span className="font-medium">{files.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">المحددة:</span>
                <span className="font-medium">{selectedFiles.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">الموثقة:</span>
                <span className="font-medium">{files.filter((f: Document) => f.is_verified).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LicenseFiles
