import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authServiceNew } from '../services/auth-new'
import { User, LoginResponse } from '../types'

// Export User type for use in other components
export type { User }
import toast from 'react-hot-toast'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string, companyId?: number) => Promise<boolean>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
  loading: boolean // للتوافق مع الكود السابق
}

export interface RegisterData {
  name: string
  email: string
  password: string
  username?: string
  phone?: string
  role?: string
  department?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    console.log('[AuthProvider] Rendered. State:', authState);
  });
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  // تحقق من المصادقة عند تحميل التطبيق
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authServiceNew.getCurrentUser()
          if (userData) {
            setAuthState((prev: AuthState) => ({
              ...prev,
              user: {
                ...userData,
                name: userData.name || userData.username || 'مستخدم',
                is_active: true
              },
              token,
              isAuthenticated: true,
              isLoading: false
            }))
          } else {
            // إذا كانت البيانات فارغة، أزل التوكن
            localStorage.removeItem('token')
            setAuthState((prev: AuthState) => ({
              ...prev,
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            }))
          }
        } catch (error) {
          localStorage.removeItem('token')
          setAuthState((prev: AuthState) => ({
            ...prev,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'فشل في التحقق من المصادقة'
          }))
        }
      } else {
        setAuthState((prev: AuthState) => ({
          ...prev,
          isLoading: false
        }))
      }
    }

    initAuth()
  }, [])

  // دالة تسجيل الدخول
  const login = async (username: string, password: string, companyId?: number): Promise<boolean> => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await authServiceNew.login({ username, password })
      // التقاط التوكن بأي اسم يرجعه الباكند
      const token = response.access_token || response.token || response.jwt || response.data?.access_token || response.data?.token || ''
      if (token) {
        localStorage.setItem('token', token)
      }
      // حفظ معرف الشركة إذا تم تمريره
      if (companyId) {
        localStorage.setItem('company_id', companyId.toString())
      }
      setAuthState((prev: AuthState) => ({
        ...prev,
        user: response.user ? {
          ...response.user,
          name: response.user.full_name || response.user.username || 'مستخدم',
          is_active: true
        } : {
          name: 'مستخدم',
          is_active: true
        },
        token,
        isAuthenticated: !!token,
        isLoading: false,
        error: null
      }))
      toast.success('تم تسجيل الدخول بنجاح')
      return !!token
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل في تسجيل الدخول'
      setAuthState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      toast.error(errorMessage)
      return false
    }
  }

  // دالة تسجيل الخروج
  const logout = async (): Promise<void> => {
    try {
      await authServiceNew.logout()
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error)
    } finally {
      localStorage.removeItem('token')
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      toast.success('تم تسجيل الخروج بنجاح')
    }
  }

  // دالة التسجيل (placeholder - سيتم إضافتها لاحقاً)
  const register = async (userData: RegisterData): Promise<void> => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // TODO: إضافة خدمة التسجيل
      console.log('Register function called with:', userData)
      // await authService.register(userData)
      toast.success('تم إنشاء الحساب بنجاح')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل في إنشاء الحساب'
      setAuthState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      toast.error(errorMessage)
      throw error
    }
  }

  // دالة تحديث الملف الشخصي (placeholder - سيتم إضافتها لاحقاً)
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // TODO: إضافة خدمة تحديث الملف الشخصي
      console.log('Update profile function called with:', userData)
      // const updatedUser = await authService.updateProfile(userData)
      setAuthState((prev: AuthState) => ({
        ...prev,
        // user: updatedUser,
        isLoading: false,
        error: null
      }))
      toast.success('تم تحديث الملف الشخصي بنجاح')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل في تحديث الملف الشخصي'
      setAuthState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      toast.error(errorMessage)
      throw error
    }
  }

  // دالة تحديث الرمز المميز (placeholder - سيتم إضافتها لاحقاً)
  const refreshToken = async (): Promise<void> => {
    try {
      // TODO: إضافة خدمة تحديث الرمز المميز
      // const response = await authService.refreshToken()
      // localStorage.setItem('token', response.token)
      // setAuthState((prev: AuthState) => ({
      //   ...prev,
      //   token: response.token,
      //   user: response.user || prev.user
      // }))
    } catch (error) {
      await logout()
      throw error
    }
  }

  // دالة مسح الأخطاء
  const clearError = (): void => {
    setAuthState((prev: AuthState) => ({ ...prev, error: null }))
  }

  // قيم السياق
  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    updateProfile,
    refreshToken,
    clearError,
    loading: authState.isLoading // للتوافق مع الكود السابق
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

// Hook لاستخدام AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
