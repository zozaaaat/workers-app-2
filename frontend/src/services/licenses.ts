import { api } from './auth'
import { License, ListResponse } from '../types'

export const licensesService = {
  // جلب جميع الرخص
  getAll: async (page: number = 1, pageSize: number = 20): Promise<ListResponse<License>> => {
    const response = await api.get(`/licenses?page=${page}&page_size=${pageSize}`)
    return response.data
  },

  // جلب رخصة بالمعرف
  getById: async (id: number): Promise<License> => {
    const response = await api.get(`/licenses/${id}`)
    return response.data
  },

  // إنشاء رخصة جديدة
  create: async (license: Partial<License>): Promise<License> => {
    const response = await api.post('/licenses', license)
    return response.data
  },

  // تحديث رخصة
  update: async (id: number, license: Partial<License>): Promise<License> => {
    const response = await api.put(`/licenses/${id}`, license)
    return response.data
  },

  // حذف رخصة
  delete: async (id: number): Promise<void> => {
    await api.delete(`/licenses/${id}`)
  },

  // البحث في الرخص
  search: async (query: string, filters?: any): Promise<ListResponse<License>> => {
    const params = new URLSearchParams({ search: query, ...filters })
    const response = await api.get(`/licenses/search?${params}`)
    return response.data
  },

  // جلب الرخص المنتهية قريباً
  getExpiringSoon: async (days: number = 30): Promise<License[]> => {
    const response = await api.get(`/licenses/expiring-soon?days=${days}`)
    return response.data
  },
}
