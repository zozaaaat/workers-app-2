import { get, post, put, del as deleteRequest } from './api'
import { Task, ListResponse } from '../types'

export const tasksService = {
  // جلب مهام المستخدم الحالي
  getMyTasks: async (): Promise<Task[]> => {
    return await get<Task[]>('/tasks/my-tasks')
  },

  // جلب جميع المهام
  getAll: async (page: number = 1, pageSize: number = 20): Promise<ListResponse<Task>> => {
    return await get<ListResponse<Task>>(`/tasks?page=${page}&page_size=${pageSize}`)
  },

  // جلب مهمة بالمعرف
  getById: async (id: number): Promise<Task> => {
    return await get<Task>(`/tasks/${id}`)
  },

  // إنشاء مهمة جديدة
  create: async (task: Partial<Task>): Promise<Task> => {
    return await post<Task>('/tasks', task)
  },

  // تحديث مهمة
  update: async (id: number, task: Partial<Task>): Promise<Task> => {
    return await put<Task>(`/tasks/${id}`, task)
  },

  // حذف مهمة
  delete: async (id: number): Promise<void> => {
    await deleteRequest<void>(`/tasks/${id}`)
  },

  // تحديث حالة المهمة
  updateStatus: async (id: number, status: string): Promise<Task> => {
    return await put<Task>(`/tasks/${id}/status`, { status })
  },
}
