// تكوين الـ API
export const API_CONFIG = {
  baseURL: window.location.hostname === 'localhost' ? 'http://localhost:8000' : '/api',
  timeout: 10000,
  version: 'v1' // لإضافة /api/v1 أو /api حسب الحاجة
}

export const getApiUrl = (endpoint: string) => {
  const base = API_CONFIG.baseURL
  return `${base}/api/${endpoint}`
}
