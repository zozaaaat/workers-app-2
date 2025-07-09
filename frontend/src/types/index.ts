/**
 * TypeScript Type Definitions
 * 
 * Centralized type definitions for the entire application
 */

// Base entity interface
export interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
}

// User types
export interface User extends BaseEntity {
  username: string;
  email?: string;
  full_name?: string;
  role?: 'admin' | 'manager' | 'user';
  is_active?: boolean;
  last_login?: string;
}

// Worker types
export interface Worker extends BaseEntity {
  name: string;
  phone?: string;
  email?: string;
  custom_id?: string;
  nationality?: string;
  worker_type?: 'عامل عادي' | 'فني' | 'مهندس' | 'مشرف' | 'عامل نظافة' | 'سائق';
  hire_date?: string;
  birth_date?: string;
  work_permit_start?: string;
  work_permit_end?: string;
  passport_number?: string;
  passport_expiry?: string;
  company_id?: number;
  company?: Company;
  salary?: number;
  status?: 'نشط' | 'معطل' | 'منتهي العقد' | 'في إجازة';
  notes?: string;
}

// Company types
export interface Company extends BaseEntity {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  license_number?: string;
  license_start?: string;
  license_end?: string;
  commercial_record?: string;
  tax_number?: string;
  status?: 'نشط' | 'معطل' | 'منتهي الترخيص';
  workers?: Worker[];
  workers_count?: number;
}

// Document types
export interface Document extends BaseEntity {
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: DocumentType;
  worker_id?: number;
  company_id?: number;
  license_id?: number;
  uploaded_by?: number;
}

export type DocumentType = 
  | 'passport'
  | 'work_permit'
  | 'id_card'
  | 'medical_certificate'
  | 'contract'
  | 'photo'
  | 'company_license'
  | 'commercial_record'
  | 'tax_certificate'
  | 'other';

// Attendance types
export interface Absence extends BaseEntity {
  worker_id: number;
  worker?: Worker;
  date: string;
  reason?: string;
  approved_by?: number;
  notes?: string;
}

export interface Leave extends BaseEntity {
  worker_id: number;
  worker?: Worker;
  start_date: string;
  end_date: string;
  leave_type: 'annual' | 'sick' | 'emergency' | 'maternity' | 'other';
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approval_date?: string;
  notes?: string;
}

// Notification types
export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  recipient_id?: number;
  recipient_role?: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  icon?: string;
  color?: string;
}

// License types
export interface License extends BaseEntity {
  license_number: string;
  license_type: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  status: 'active' | 'expired' | 'suspended';
  company_id?: number;
  worker_id?: number;
  documents?: Document[];
}

// Financial types
export interface Salary extends BaseEntity {
  worker_id: number;
  worker?: Worker;
  amount: number;
  pay_date: string;
  pay_period_start: string;
  pay_period_end: string;
  deductions?: number;
  bonuses?: number;
  net_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
}

export interface Deduction extends BaseEntity {
  worker_id: number;
  worker?: Worker;
  amount: number;
  deduction_type: string;
  description: string;
  date: string;
  approved_by?: number;
}

// Activity Log types
export interface ActivityLog extends BaseEntity {
  user_id: number;
  user?: User;
  action: string;
  entity_type: string;
  entity_id: number;
  description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

// Analytics types
export interface DashboardStats {
  workers: {
    total: number;
    active: number;
    inactive: number;
    this_month: number;
    upcoming_expirations: number;
  };
  companies: {
    total: number;
    active: number;
    inactive: number;
  };
  attendance: {
    absences_today: number;
    leaves_active: number;
    total_absences: number;
    total_leaves: number;
  };
  documents: {
    total: number;
    pending_review: number;
    expired: number;
  };
  financials: {
    total_salaries: number;
    pending_payments: number;
    total_deductions: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  details?: Record<string, any>;
}

// Form types
export interface WorkerFormData {
  name: string;
  phone?: string;
  email?: string;
  custom_id?: string;
  nationality?: string;
  worker_type?: string;
  hire_date?: string;
  birth_date?: string;
  work_permit_start?: string;
  work_permit_end?: string;
  passport_number?: string;
  passport_expiry?: string;
  company_id?: number;
  salary?: number;
  status?: string;
  notes?: string;
}

export interface CompanyFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  license_number?: string;
  license_start?: string;
  license_end?: string;
  commercial_record?: string;
  tax_number?: string;
  status?: string;
}

// Filter types
export interface WorkerFilters {
  company_id?: number;
  worker_type?: string;
  status?: string;
  nationality?: string;
  expiring_soon?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CompanyFilters {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// Permission types
export interface Permission extends BaseEntity {
  name: string;
  codename: string;
  description?: string;
  module: string;
}

export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: Permission[];
  is_active: boolean;
}

// Security types
export interface SecurityEvent extends BaseEntity {
  user_id?: number;
  event_type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'permission_change';
  ip_address: string;
  user_agent: string;
  success: boolean;
  details?: Record<string, any>;
}

// Dashboard statistics types
export interface DashboardStats {
  total_workers: number;
  active_workers: number;
  inactive_workers: number;
  total_companies: number;
  active_companies: number;
  inactive_companies: number;
  expiring_permits: number;
  expiring_licenses: number;
  recent_additions: number;
  pending_approvals?: number;
}


