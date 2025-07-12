import { api } from './auth'
import { Employee, ListResponse } from '../types'

export const employeesService = {
  // جلب جميع الموظفين
  getAll: async (page: number = 1, pageSize: number = 20): Promise<ListResponse<Employee>> => {
    const response = await api.get(`/employees?page=${page}&page_size=${pageSize}`)
    return response.data
  },

  // جلب موظف بالمعرف
  getById: async (id: number): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`)
    return response.data
  },

  // إنشاء موظف جديد
  create: async (employee: Partial<Employee>): Promise<Employee> => {
    const response = await api.post('/employees', employee)
    return response.data
  },

  // تحديث موظف
  update: async (id: number, employee: Partial<Employee>): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, employee)
    return response.data
  },

  // حذف موظف
  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`)
  },

  // البحث في الموظفين
  search: async (query: string, filters?: any): Promise<ListResponse<Employee>> => {
    const params = new URLSearchParams({ search: query, ...filters })
    const response = await api.get(`/employees/search?${params}`)
    return response.data
  },
}
