import { api } from './auth'
import { Company, ListResponse } from '../types'

export const companiesService = {
  // جلب جميع الشركات
  getAll: async (page: number = 1, pageSize: number = 20): Promise<ListResponse<Company>> => {
    const response = await api.get(`/companies?page=${page}&page_size=${pageSize}`)
    return response.data
  },

  // جلب شركة بالمعرف
  getById: async (id: number): Promise<Company> => {
    const response = await api.get(`/companies/${id}`)
    return response.data
  },

  // إنشاء شركة جديدة
  create: async (company: Partial<Company>): Promise<Company> => {
    const response = await api.post('/companies', company)
    return response.data
  },

  // تحديث شركة
  update: async (id: number, company: Partial<Company>): Promise<Company> => {
    const response = await api.put(`/companies/${id}`, company)
    return response.data
  },

  // حذف شركة
  delete: async (id: number): Promise<void> => {
    await api.delete(`/companies/${id}`)
  },

  // البحث في الشركات
  search: async (query: string, filters?: any): Promise<ListResponse<Company>> => {
    const params = new URLSearchParams({ search: query, ...filters })
    const response = await api.get(`/companies/search?${params}`)
    return response.data
  },
}
