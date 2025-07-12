import axios from 'axios'

const API_BASE_URL = 'http://localhost:8001/api/v1'

// إعداد axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// إضافة التوكن للطلبات
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// تعريف أنواع البيانات
interface LoginResponse {
  user: {
    id: number
    name: string
    username: string
    email: string
    company_id?: number
    roles?: string[]
    permissions?: string[]
  }
  token: string
}

interface User {
  id: number
  name: string
  username: string
  email: string
  company_id?: number
  roles?: string[]
  permissions?: string[]
}

// خدمة المصادقة
const authService = {
  // تسجيل الدخول
  login: async (username: string, password: string, companyId?: number): Promise<LoginResponse> => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    
    if (companyId) {
      formData.append('company_id', companyId.toString())
    }

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    // حفظ التوكن
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    
    return response.data
  },

  // تسجيل الخروج
  logout: async (): Promise<void> => {
    localStorage.removeItem('token')
    await api.post('/auth/logout')
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      return null
    }
  },

  // التحقق من صحة التوكن
  verifyToken: async (): Promise<boolean> => {
    try {
      await api.get('/auth/verify')
      return true
    } catch (error) {
      return false
    }
  },

  // تحديث كلمة المرور
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
  },
}

// تصدير الخدمات
export { authService, api }
export default authService
