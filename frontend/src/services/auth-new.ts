// Auth service باستخدام fetch مباشرة
const API_BASE_URL = 'http://localhost:8000/api'

export const authServiceNew = {
  // تسجيل الدخول
  login: async (credentials: { username: string; password: string }) => {
    console.log(`🔄 Login attempt for: ${credentials.username}`)
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Login successful')
    return data
  },

  // جلب بيانات المستخدم الحالي
  getCurrentUser: async () => {
    console.log('🔄 Fetching current user')
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Current user fetched')
    return data
  },

  // تسجيل الخروج
  logout: async () => {
    console.log('🔄 Logging out')
    
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    console.log('✅ Logged out successfully')
    return true
  },

  // تغيير كلمة المرور
  changePassword: async (passwords: { current_password: string; new_password: string }) => {
    console.log('🔄 Changing password')
    
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwords),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    console.log('✅ Password changed successfully')
    return true
  }
}
