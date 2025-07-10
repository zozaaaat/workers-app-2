import axios from 'axios';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';

// إعدادات الـ API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// إنشاء instance مخصص من axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة interceptor للـ request (لإضافة token مثلاً)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// إضافة interceptor للـ response (للتعامل مع الأخطاء)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إذا كان الـ token منتهي الصلاحية
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// واجهة خدمة API موحدة
export class ApiService {
  // GET request
  static async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.get(endpoint, config);
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  // POST request
  static async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  // PUT request
  static async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  // DELETE request
  static async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(endpoint, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  // رفع ملف
  static async uploadFile<T = any>(endpoint: string, file: File, additionalData?: any): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    try {
      const response: AxiosResponse<T> = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`File upload to ${endpoint} failed:`, error);
      throw error;
    }
  }
}

// خدمات محددة للكيانات
export class WorkersService {
  static async getAll() {
    return ApiService.get('/workers');
  }

  static async getById(id: number) {
    return ApiService.get(`/workers/${id}`);
  }

  static async create(data: any) {
    return ApiService.post('/workers', data);
  }

  static async update(id: number, data: any) {
    return ApiService.put(`/workers/${id}`, data);
  }

  static async delete(id: number) {
    return ApiService.delete(`/workers/${id}`);
  }

  static async getByCompany(companyId: number) {
    return ApiService.get(`/workers/by-company/${companyId}`);
  }

  static async getByLicense(licenseId: number) {
    return ApiService.get(`/workers/by-license/${licenseId}`);
  }
}

export class CompaniesService {
  static async getAll() {
    return ApiService.get('/companies');
  }

  static async getById(id: number) {
    return ApiService.get(`/companies/${id}`);
  }

  static async create(data: any) {
    return ApiService.post('/companies', data);
  }

  static async update(id: number, data: any) {
    return ApiService.put(`/companies/${id}`, data);
  }

  static async delete(id: number) {
    return ApiService.delete(`/companies/${id}`);
  }
}

export class LicensesService {
  static async getAll() {
    return ApiService.get('/licenses');
  }

  static async getById(id: number) {
    return ApiService.get(`/licenses/${id}`);
  }

  static async create(data: any) {
    return ApiService.post('/licenses', data);
  }

  static async update(id: number, data: any) {
    return ApiService.put(`/licenses/${id}`, data);
  }

  static async delete(id: number) {
    return ApiService.delete(`/licenses/${id}`);
  }

  static async getByCompany(companyId: number) {
    return ApiService.get(`/licenses/by-company/${companyId}`);
  }
}

export class DocumentsService {
  static async uploadWorkerDocument(workerId: number, file: File, docType: string, description?: string) {
    return ApiService.uploadFile('/worker_documents/upload', file, {
      worker_id: workerId,
      doc_type: docType,
      description: description || ''
    });
  }

  static async getWorkerDocuments(workerId: number) {
    return ApiService.get(`/worker_documents/by_worker/${workerId}`);
  }

  static async deleteDocument(docId: number) {
    return ApiService.delete(`/worker_documents/${docId}`);
  }

  static async uploadCompanyDocument(companyId: number, file: File, docType: string, description?: string) {
    return ApiService.uploadFile('/company_documents/upload', file, {
      company_id: companyId,
      doc_type: docType,
      description: description || ''
    });
  }

  static async getCompanyDocuments(companyId: number) {
    return ApiService.get(`/company_documents/by_company/${companyId}`);
  }
}

export class NotificationsService {
  static async getAll() {
    return ApiService.get('/notifications');
  }

  static async create(data: any) {
    return ApiService.post('/notifications', data);
  }

  static async markAsRead(id: number) {
    return ApiService.put(`/notifications/${id}/read`);
  }

  static async delete(id: number) {
    return ApiService.delete(`/notifications/${id}`);
  }
}

export class AnalyticsService {
  static async getDashboardStats() {
    return ApiService.get('/analytics/dashboard');
  }

  static async getWorkerAnalytics() {
    return ApiService.get('/analytics/workers');
  }

  static async getCompanyAnalytics() {
    return ApiService.get('/analytics/companies');
  }

  static async getAIAnalytics() {
    return ApiService.get('/ai-analytics/insights');
  }
}

// خدمة الغيابات
export class AbsencesService {
  static async getAll() {
    return ApiService.get('/absences');
  }

  static async getById(id: number) {
    return ApiService.get(`/absences/${id}`);
  }

  static async create(data: any) {
    return ApiService.post('/absences', data);
  }

  static async update(id: number, data: any) {
    return ApiService.put(`/absences/${id}`, data);
  }

  static async delete(id: number) {
    return ApiService.delete(`/absences/${id}`);
  }
}

// خدمة الإجازات
export class LeavesService {
  static async getAll() {
    return ApiService.get('/leaves');
  }

  static async getById(id: number) {
    return ApiService.get(`/leaves/${id}`);
  }

  static async create(data: any) {
    return ApiService.post('/leaves', data);
  }

  static async update(id: number, data: any) {
    return ApiService.put(`/leaves/${id}`, data);
  }

  static async delete(id: number) {
    return ApiService.delete(`/leaves/${id}`);
  }
}

// خدمة المخالفات
export class ViolationsService {
  static async getAll() {
    return ApiService.get('/violations');
  }

  static async getById(id: number) {
    return ApiService.get(`/violations/${id}`);
  }

  static async create(data: any) {
    return ApiService.post('/violations', data);
  }

  static async update(id: number, data: any) {
    return ApiService.put(`/violations/${id}`, data);
  }

  static async delete(id: number) {
    return ApiService.delete(`/violations/${id}`);
  }
}

// خدمة الخصومات
export class DeductionsService {
  static async getAll() {
    return ApiService.get('/deductions');
  }

  static async getById(id: number) {
    return ApiService.get(`/deductions/${id}`);
  }

  static async create(data: any) {
    return ApiService.post('/deductions', data);
  }

  static async update(id: number, data: any) {
    return ApiService.put(`/deductions/${id}`, data);
  }

  static async delete(id: number) {
    return ApiService.delete(`/deductions/${id}`);
  }
}

// Hook مخصص لاستخدام API
export const useApi = () => {
  return {
    workers: WorkersService,
    companies: CompaniesService,
    licenses: LicensesService,
    documents: DocumentsService,
    notifications: NotificationsService,
    analytics: AnalyticsService,
    absences: AbsencesService,
    leaves: LeavesService,
    violations: ViolationsService,
    deductions: DeductionsService,
  };
};

export default ApiService;
