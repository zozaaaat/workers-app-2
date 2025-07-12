import { api } from './auth'
import { Document, ListResponse } from '../types'

export const documentsService = {
  // جلب جميع الوثائق
  getAll: async (page: number = 1, pageSize: number = 20): Promise<ListResponse<Document>> => {
    const response = await api.get(`/documents?page=${page}&page_size=${pageSize}`)
    return response.data
  },

  // جلب وثيقة بالمعرف
  getById: async (id: number): Promise<Document> => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },

  // رفع وثيقة جديدة
  upload: async (file: File, metadata: any): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key])
    })

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // تحديث وثيقة
  update: async (id: number, document: Partial<Document>): Promise<Document> => {
    const response = await api.put(`/documents/${id}`, document)
    return response.data
  },

  // حذف وثيقة
  delete: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`)
  },

  // البحث في الوثائق
  search: async (query: string, filters?: any): Promise<ListResponse<Document>> => {
    const params = new URLSearchParams({ search: query, ...filters })
    const response = await api.get(`/documents/search?${params}`)
    return response.data
  },

  // جلب الوثائق حسب الكيان
  getByEntity: async (entityType: string, entityId: number): Promise<Document[]> => {
    const response = await api.get(`/documents/entity/${entityType}/${entityId}`)
    return response.data
  },

  // تحميل وثيقة
  download: async (id: number): Promise<Blob> => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    })
    return response.data
  },
}
