import { api } from './auth'
import { OverviewStats, ExpiryAlert, RecentFile } from '../types'

export const overviewService = {
  // جلب إحصائيات لوحة التحكم
  getStats: async (): Promise<OverviewStats> => {
    const response = await api.get('/overview/stats')
    return response.data
  },

  // جلب التنبيهات القادمة
  getExpiryAlerts: async (limit: number = 5): Promise<ExpiryAlert[]> => {
    const response = await api.get(`/overview/expiry-alerts?limit=${limit}`)
    return response.data
  },

  // جلب الملفات المرفوعة حديثاً
  getRecentFiles: async (limit: number = 5): Promise<RecentFile[]> => {
    const response = await api.get(`/overview/recent-files?limit=${limit}`)
    return response.data
  },
}
