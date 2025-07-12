// TypeScript Type Definitions
// User & Authentication Types
export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  name?: string
  company_id?: number
  role?: string
  roles?: string[]
  permissions?: string[]
  is_active?: boolean
  is_superuser?: boolean
  created_at?: string
  updated_at?: string
  roleData?: {
    name: string
    permissions: string[]
  }
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token?: string
  token_type: string
  user: User
}

// Company & Employee Types
export interface Company {
  id: number
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Employee {
  id: number
  name: string
  full_name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  position?: string
  company_id: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// Task & Project Types
export interface Task {
  id: number
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  assigned_to?: number
  company_id: number
  created_at?: string
  updated_at?: string
  due_date?: string
}

// Document & License Types
export interface Document {
  id: number
  name: string
  filename?: string
  file_path: string
  file_type?: string
  file_size?: number
  upload_date?: string
  created_at?: string
  status?: DocumentStatus
  is_verified?: boolean
  company_id?: number
  employee_id?: number
}

export interface License {
  id: number
  name: string
  type: string
  issue_date?: string
  expiry_date?: string
  status: 'active' | 'expired' | 'pending'
  company_id: number
}

// API Response Types
export interface ListResponse<T> {
  data: T[]
  items?: T[]
  total?: number
  page?: number
  per_page?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Statistics & Overview Types
export interface OverviewStats {
  total_companies: number
  total_employees: number
  active_employees?: number
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
  active_licenses?: number
  expiring_licenses?: number
  recent_documents?: number
}

export interface ExpiryAlert {
  id: number
  type: 'license' | 'document'
  name: string
  title?: string
  entity_type?: string
  entity_name?: string
  expiry_date: string
  days_remaining: number
  days_until_expiry?: number
  alert_level?: string
  is_expired?: boolean
}

export interface RecentFile {
  id: number
  name: string
  filename?: string
  type: string
  file_type?: string
  upload_date: string
  uploaded_at?: string
  entity_type?: string
  entity_name?: string
  company_name?: string
}

// Utility Types
export type DocumentType = 'license' | 'permit' | 'certificate' | 'contract' | 'other' | 
                           'LICENSE' | 'PASSPORT' | 'NATIONAL_ID' | 'WORK_PERMIT' | 'HEALTH_CERTIFICATE' |
                           'EMPLOYMENT_CONTRACT' | 'EDUCATION_CERTIFICATE' | 'EXPERIENCE_CERTIFICATE'
export type DocumentStatus = 'active' | 'expired' | 'pending' | 'cancelled'

// DocumentType enum-like object for compatibility
export const DocumentTypeEnum = {
  LICENSE: 'LICENSE' as DocumentType,
  PASSPORT: 'PASSPORT' as DocumentType,
  NATIONAL_ID: 'NATIONAL_ID' as DocumentType,
  WORK_PERMIT: 'WORK_PERMIT' as DocumentType,
  HEALTH_CERTIFICATE: 'HEALTH_CERTIFICATE' as DocumentType,
  EMPLOYMENT_CONTRACT: 'EMPLOYMENT_CONTRACT' as DocumentType,
  EDUCATION_CERTIFICATE: 'EDUCATION_CERTIFICATE' as DocumentType,
  EXPERIENCE_CERTIFICATE: 'EXPERIENCE_CERTIFICATE' as DocumentType,
}

// DocumentStatus enum-like object
export const DocumentStatusEnum = {
  ACTIVE: 'active' as DocumentStatus,
  EXPIRED: 'expired' as DocumentStatus,
  PENDING: 'pending' as DocumentStatus,
  CANCELLED: 'cancelled' as DocumentStatus,
}

// Form Types for Components
export interface FileTypeFilter {
  label: string
  value: DocumentType
  count: number
}

// Worker Types for workers service
export interface Worker {
  id: number
  name: string
  email?: string
  phone?: string
  position?: string
  company_id: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateWorkerData {
  name: string
  email?: string
  phone?: string
  position?: string
  company_id: number
}

export interface UpdateWorkerData {
  id: number
  name?: string
  email?: string
  phone?: string
  position?: string
  is_active?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
