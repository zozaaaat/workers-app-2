// Companies service باستخدام fetch مباشرة
import { Company, ListResponse } from '../types'

const API_BASE_URL = 'http://localhost:8000/api'

export const companiesServiceNew = {
  // جلب جميع الشركات
  getAll: async (page: number = 1, pageSize: number = 20): Promise<ListResponse<Company>> => {
    console.log(`🔄 Fetching companies from: ${API_BASE_URL}/companies?page=${page}&page_size=${pageSize}`)
    
    const response = await fetch(`${API_BASE_URL}/companies?page=${page}&page_size=${pageSize}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Companies fetched successfully:', data)
    return data
  },

  // جلب شركة بالمعرف
  getById: async (id: number): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  },
}
