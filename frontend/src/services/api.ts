import axios, { AxiosResponse } from 'axios';

// إعداد محور Axios الأساسي
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة رمز التوكن للطلبات إذا كان متوفراً
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الاستجابات والأخطاء
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إزالة التوكن وإعادة التوجيه لصفحة تسجيل الدخول
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// دوال مساعدة للطلبات
export const get = async <T>(url: string): Promise<T> => {
  const response = await api.get<T>(url);
  return response.data;
};

export const post = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.post<T>(url, data);
  return response.data;
};

export const put = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.put<T>(url, data);
  return response.data;
};

export const del = async <T>(url: string): Promise<T> => {
  const response = await api.delete<T>(url);
  return response.data;
};

export const uploadFile = async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data;
};

export default api;
