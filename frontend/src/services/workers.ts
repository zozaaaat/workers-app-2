import { get, post, put, del } from './api';
import {
  Worker,
  CreateWorkerData,
  UpdateWorkerData,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export const workersApi = {
  // جلب جميع العمال مع إمكانية التصفية والترقيم
  getAll: async (params?: {
    page?: number;
    size?: number;
    company_id?: number;
    department?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Worker>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return get<PaginatedResponse<Worker>>(`/workers?${queryParams.toString()}`);
  },

  // جلب عامل واحد بالمعرف
  getById: async (id: number): Promise<Worker> => {
    return get<Worker>(`/workers/${id}`);
  },

  // إنشاء عامل جديد
  create: async (data: CreateWorkerData): Promise<ApiResponse<Worker>> => {
    return post<ApiResponse<Worker>>('/workers', data);
  },

  // تحديث عامل موجود
  update: async (id: number, data: UpdateWorkerData): Promise<ApiResponse<Worker>> => {
    return put<ApiResponse<Worker>>(`/workers/${id}`, data);
  },

  // حذف عامل
  delete: async (id: number): Promise<ApiResponse<null>> => {
    return del<ApiResponse<null>>(`/workers/${id}`);
  },

  // جلب العمال حسب الشركة
  getByCompany: async (companyId: number): Promise<Worker[]> => {
    return get<Worker[]>(`/companies/${companyId}/workers`);
  },

  // جلب العمال حسب القسم
  getByDepartment: async (department: string): Promise<Worker[]> => {
    return get<Worker[]>(`/workers/department/${department}`);
  },

  // البحث في العمال
  search: async (query: string): Promise<Worker[]> => {
    return get<Worker[]>(`/workers/search?q=${encodeURIComponent(query)}`);
  },

  // تصدير العمال إلى CSV
  exportToCsv: async (params?: any): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return get<Blob>(`/workers/export?${queryParams.toString()}`);
  },

  // تحديث حالة العامل
  updateStatus: async (id: number, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<Worker>> => {
    return put<ApiResponse<Worker>>(`/workers/${id}/status`, { status });
  },
};
