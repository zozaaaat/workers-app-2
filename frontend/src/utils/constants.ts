// Application constants
export const APP_NAME = 'نظام إدارة العمال'
export const APP_VERSION = '1.0.0'

export const API_ENDPOINTS = {
  AUTH: '/auth',
  EMPLOYEES: '/employees',
  COMPANIES: '/companies',
  DOCUMENTS: '/documents',
  LICENSES: '/licenses',
  TASKS: '/tasks'
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  HR_SPECIALIST: 'hr_specialist',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer'
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
}

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']
}
