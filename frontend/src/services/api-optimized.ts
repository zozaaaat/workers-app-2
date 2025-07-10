/**
 * Enhanced API Service with React Query Integration
 * خدمة API محسّنة مع تكامل React Query
 */

import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';

// Helper for toast notifications - will be replaced with actual implementation
const toast = {
  success: (message: string) => console.log('SUCCESS:', message),
  error: (message: string) => console.error('ERROR:', message),
};

// إعداد عميل Axios مع التحسينات
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000, // 10 ثواني timeout
});

// Interceptors للتعامل مع الأخطاء والتحميل
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Query Keys - مفاتيح للاستعلامات
export const queryKeys = {
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    notifications: ['dashboard', 'notifications'] as const,
    expiringDocs: ['dashboard', 'expiring-docs'] as const,
  },
  workers: {
    all: ['workers'] as const,
    list: (filters?: any) => ['workers', 'list', filters] as const,
    detail: (id: number) => ['workers', 'detail', id] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: (filters?: any) => ['companies', 'list', filters] as const,
    detail: (id: number) => ['companies', 'detail', id] as const,
  },
} as const;

// Dashboard API Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const { data } = await api.get('/api/v1/dashboard/stats');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000, // 10 دقائق (بدلاً من cacheTime)
    refetchOnWindowFocus: false,
  });
};

export const useRecentNotifications = (limit: number = 10) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.notifications, limit],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/dashboard/notifications?limit=${limit}`);
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // دقيقتان
    refetchInterval: 5 * 60 * 1000, // تحديث كل 5 دقائق
  });
};

export const useExpiringDocuments = (daysAhead: number = 30) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.expiringDocs, daysAhead],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/dashboard/expiring-documents?days_ahead=${daysAhead}`);
      return data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 دقيقة
  });
};

// Workers API Hooks with Optimizations
export const useWorkersOptimized = (
  skip: number = 0,
  limit: number = 20,
  companyId?: number,
  search?: string
) => {
  return useQuery({
    queryKey: queryKeys.workers.list({ skip, limit, companyId, search }),
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
        ...(companyId && { company_id: companyId.toString() }),
        ...(search && { search }),
      });
      
      const { data } = await api.get(`/api/v1/dashboard/workers-optimized?${params}`);
      return data.data;
    },
    staleTime: 30 * 1000, // 30 ثانية
    placeholderData: (previousData) => previousData, // الاحتفاظ بالبيانات السابقة أثناء التحميل
  });
};

// Companies API Hooks
export const useCompanies = (skip: number = 0, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.companies.list({ skip, limit }),
    queryFn: async () => {
      const { data } = await api.get(`/companies?skip=${skip}&limit=${limit}`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

// Mutations with Optimistic Updates
export const useCreateWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workerData: any) => {
      const { data } = await api.post('/workers', workerData);
      return data;
    },
    onSuccess: () => {
      // إلغاء وإعادة تحميل البيانات المتعلقة بالعمال
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('تم إضافة العامل بنجاح');
    },
    onError: (error: any) => {
      toast.error(`خطأ في إضافة العامل: ${error.response?.data?.detail || error.message}`);
    },
  });
};

export const useUpdateWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/workers/${id}`, data);
      return response.data;
    },
    onSuccess: (data: any, variables: { id: number; data: any }) => {
      // تحديث محدد للعامل في الكاش
      queryClient.setQueryData(
        queryKeys.workers.detail(variables.id),
        data
      );
      
      // إلغاء استعلامات القوائم
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      
      toast.success('تم تحديث بيانات العامل بنجاح');
    },
    onError: (error: any) => {
      toast.error(`خطأ في تحديث العامل: ${error.response?.data?.detail || error.message}`);
    },
  });
};

export const useDeleteWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/workers/${id}`);
      return id;
    },
    onSuccess: (deletedId: number) => {
      // إزالة العامل من جميع الاستعلامات
      queryClient.removeQueries({ queryKey: queryKeys.workers.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      
      toast.success('تم حذف العامل بنجاح');
    },
    onError: (error: any) => {
      toast.error(`خطأ في حذف العامل: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// Cache Management Functions
export const invalidateDashboardCache = () => {
  return api.post('/api/v1/dashboard/cache/invalidate');
};

export const useInvalidateCache = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: invalidateDashboardCache,
    onSuccess: () => {
      // إلغاء جميع استعلامات لوحة التحكم
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.expiringDocs });
      
      toast.success('تم تحديث البيانات بنجاح');
    },
  });
};

// Performance Monitoring Hook
export const usePerformanceInfo = () => {
  return useQuery({
    queryKey: ['performance', 'info'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/dashboard/performance-info');
      return data.data;
    },
    staleTime: 30 * 1000, // 30 ثانية
    refetchInterval: 60 * 1000, // تحديث كل دقيقة
    enabled: import.meta.env.DEV, // فقط في بيئة التطوير
  });
};

// Query Client Configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق افتراضي
      gcTime: 10 * 60 * 1000, // 10 دقائق افتراضي (بدلاً من cacheTime)
      retry: (failureCount: number, error: any) => {
        // عدم إعادة المحاولة للأخطاء 4xx
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default api;
