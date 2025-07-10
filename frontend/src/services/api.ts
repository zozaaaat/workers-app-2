/**
 * Unified API Service
 * 
 * This service consolidates all API calls into organized modules
 * and provides a consistent interface for frontend components.
 */

import axios from 'axios';
import { API_URL } from '../api';
import type { 
  Worker, 
  Company,
  DashboardStats
} from '../types';

// API Response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Base API configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Workers API
export const workersApi = {
  // Get all workers (using public endpoint)
  getAll: async (): Promise<Worker[]> => {
    const response = await apiClient.get('/workers/public');
    return response.data;
  },
  
  // Get worker by ID
  getById: async (id: number): Promise<Worker> => {
    const response = await apiClient.get(`/workers/${id}`);
    return response.data;
  },
  
  // Create new worker (using public endpoint for testing)
  create: async (worker: Partial<Worker>): Promise<Worker> => {
    const response = await apiClient.post('/workers/public', worker);
    return response.data;
  },

  // Update worker
  update: async (id: number, worker: Partial<Worker>): Promise<Worker> => {
    const response = await apiClient.put(`/workers/${id}`, worker);
    return response.data;
  },

  // Delete worker
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/workers/${id}`);
  },

  // Get workers with upcoming permit expiration
  getUpcomingExpirations: async (days: number = 30): Promise<Worker[]> => {
    const response = await apiClient.get(`/workers/expiring?days=${days}`);
    return response.data;
  },

  // Get workers by company
  getByCompany: async (companyId: number): Promise<Worker[]> => {
    const response = await apiClient.get(`/workers/company/${companyId}`);
    return response.data;
  }
};

// Companies API
export const companiesApi = {
  // Get all companies
  getAll: async (): Promise<Company[]> => {
    const response = await apiClient.get('/companies');
    return response.data;
  },

  // Get company by ID
  getById: async (id: number): Promise<Company> => {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  },

  // Create new company
  create: async (company: Partial<Company>): Promise<Company> => {
    const response = await apiClient.post('/companies', company);
    return response.data;
  },

  // Update company
  update: async (id: number, company: Partial<Company>): Promise<Company> => {
    const response = await apiClient.put(`/companies/${id}`, company);
    return response.data;
  },

  // Delete company
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/companies/${id}`);
  }
};

// Documents API
export const documentsApi = {
  // Upload worker document
  uploadWorkerDocument: async (workerId: number, file: File, documentType: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    const response = await apiClient.post(`/workers/${workerId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload company document
  uploadCompanyDocument: async (companyId: number, file: File, documentType: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    const response = await apiClient.post(`/companies/${companyId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get worker documents
  getWorkerDocuments: async (workerId: number): Promise<any[]> => {
    const response = await apiClient.get(`/workers/${workerId}/documents`);
    return response.data;
  },

  // Get company documents
  getCompanyDocuments: async (companyId: number): Promise<any[]> => {
    const response = await apiClient.get(`/companies/${companyId}/documents`);
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId: number): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  }
};

// Analytics API
export const analyticsApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  // Get workers statistics
  getWorkersStats: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/workers');
    return response.data;
  },

  // Get companies statistics
  getCompaniesStats: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/companies');
    return response.data;
  },

  // Get monthly trends
  getMonthlyTrends: async (months: number = 6): Promise<any> => {
    const response = await apiClient.get(`/analytics/trends?months=${months}`);
    return response.data;
  }
};

// Attendance API
export const attendanceApi = {
  // Get all absences
  getAbsences: async (): Promise<any[]> => {
    const response = await apiClient.get('/absences');
    return response.data;
  },

  // Get all leaves
  getLeaves: async (): Promise<any[]> => {
    const response = await apiClient.get('/leaves');
    return response.data;
  },

  // Create absence record
  createAbsence: async (absence: any): Promise<any> => {
    const response = await apiClient.post('/absences', absence);
    return response.data;
  },

  // Create leave record
  createLeave: async (leave: any): Promise<any> => {
    const response = await apiClient.post('/leaves', leave);
    return response.data;
  }
};

// Notifications API
export const notificationsApi = {
  // Get all notifications
  getAll: async (): Promise<any[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  // Delete notification
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  }
};

// Auth API
export const authApi = {
  // Login
  login: async (credentials: { username: string; password: string }): Promise<any> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (userData: any): Promise<any> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<any> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
  }
};

// Reports API
export const reportsApi = {
  // Generate workers report
  generateWorkersReport: async (filters?: any): Promise<Blob> => {
    const response = await apiClient.get('/reports/workers', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Generate companies report
  generateCompaniesReport: async (filters?: any): Promise<Blob> => {
    const response = await apiClient.get('/reports/companies', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Generate financial report
  generateFinancialReport: async (filters?: any): Promise<Blob> => {
    const response = await apiClient.get('/reports/financial', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Export unified API object
export const api = {
  workers: workersApi,
  companies: companiesApi,
  documents: documentsApi,
  analytics: analyticsApi,
  attendance: attendanceApi,
  notifications: notificationsApi,
  auth: authApi,
  reports: reportsApi
};

export default api;
