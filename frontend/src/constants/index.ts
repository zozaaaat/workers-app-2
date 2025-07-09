/**
 * Application Constants
 * 
 * Centralized constants used throughout the application
 */

// API Constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password'
  },

  // Workers
  WORKERS: {
    BASE: '/workers',
    BY_ID: (id: number) => `/workers/${id}`,
    BY_COMPANY: (companyId: number) => `/workers/company/${companyId}`,
    EXPIRING: '/workers/expiring',
    SEARCH: '/workers/search',
    EXPORT: '/workers/export'
  },

  // Companies
  COMPANIES: {
    BASE: '/companies',
    BY_ID: (id: number) => `/companies/${id}`,
    SEARCH: '/companies/search',
    EXPORT: '/companies/export'
  },

  // Documents
  DOCUMENTS: {
    WORKER: (workerId: number) => `/workers/${workerId}/documents`,
    COMPANY: (companyId: number) => `/companies/${companyId}/documents`,
    LICENSE: (licenseId: number) => `/licenses/${licenseId}/documents`,
    BY_ID: (id: number) => `/documents/${id}`,
    DOWNLOAD: (id: number) => `/documents/${id}/download`
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: number) => `/notifications/${id}`,
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read'
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    WORKERS: '/analytics/workers',
    COMPANIES: '/analytics/companies',
    TRENDS: '/analytics/trends',
    REPORTS: '/analytics/reports'
  },

  // Attendance
  ATTENDANCE: {
    ABSENCES: '/absences',
    LEAVES: '/leaves',
    ABSENCE_BY_ID: (id: number) => `/absences/${id}`,
    LEAVE_BY_ID: (id: number) => `/leaves/${id}`
  },

  // Reports
  REPORTS: {
    WORKERS: '/reports/workers',
    COMPANIES: '/reports/companies',
    FINANCIAL: '/reports/financial',
    ATTENDANCE: '/reports/attendance',
    CUSTOM: '/reports/custom'
  }
};

// Application Routes
export const ROUTES = {
  // Authentication
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard
  DASHBOARD: '/',
  ANALYTICS: '/analytics',

  // Workers
  WORKERS: '/workers',
  WORKER_PROFILE: (id: number) => `/workers/${id}`,
  ADD_WORKER: '/workers/add',
  EDIT_WORKER: (id: number) => `/workers/${id}/edit`,

  // Companies
  COMPANIES: '/companies',
  COMPANY_PROFILE: (id: number) => `/companies/${id}`,
  ADD_COMPANY: '/companies/add',
  EDIT_COMPANY: (id: number) => `/companies/${id}/edit`,

  // Documents
  WORKER_DOCUMENTS: (workerId: number) => `/workers/${workerId}/documents`,
  COMPANY_DOCUMENTS: (companyId: number) => `/companies/${companyId}/documents`,
  LICENSE_DOCUMENTS: '/licenses/documents',

  // Reports
  REPORTS: '/reports',
  WORKERS_REPORT: '/reports/workers',
  COMPANIES_REPORT: '/reports/companies',
  FINANCIAL_REPORT: '/reports/financial',

  // Settings
  SETTINGS: '/settings',
  PROFILE: '/profile',
  USERS: '/users',
  PERMISSIONS: '/permissions',

  // Other
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized'
};

// Worker Types
export const WORKER_TYPES = [
  'عامل عادي',
  'فني',
  'مهندس',
  'مشرف',
  'عامل نظافة',
  'سائق',
  'محاسب',
  'إداري',
  'أمن',
  'طباخ'
] as const;

// Worker Statuses
export const WORKER_STATUSES = [
  'نشط',
  'معطل',
  'منتهي العقد',
  'في إجازة',
  'تحت التجربة',
  'مفصول'
] as const;

// Company Statuses
export const COMPANY_STATUSES = [
  'نشط',
  'معطل',
  'منتهي الترخيص',
  'معلق',
  'تحت المراجعة'
] as const;

// Nationalities (Common ones in Saudi Arabia)
export const NATIONALITIES = [
  'سعودي',
  'مصري',
  'سوداني',
  'يمني',
  'سوري',
  'فلسطيني',
  'أردني',
  'لبناني',
  'عراقي',
  'باكستاني',
  'هندي',
  'بنغلاديشي',
  'فلبيني',
  'إثيوبي',
  'إريتري',
  'نيبالي',
  'سريلانكي',
  'تركي',
  'أفغاني',
  'أخرى'
] as const;

// Document Types
export const DOCUMENT_TYPES = {
  WORKER: [
    'passport',
    'work_permit',
    'id_card',
    'medical_certificate',
    'contract',
    'photo',
    'visa',
    'insurance',
    'qualification',
    'experience',
    'other'
  ],
  COMPANY: [
    'company_license',
    'commercial_record',
    'tax_certificate',
    'chamber_membership',
    'insurance_policy',
    'contracts',
    'other'
  ],
  LICENSE: [
    'license_document',
    'renewal_application',
    'supporting_documents',
    'payment_receipt',
    'other'
  ]
} as const;

// Leave Types
export const LEAVE_TYPES = [
  'annual',
  'sick',
  'emergency',
  'maternity',
  'paternity',
  'hajj',
  'unpaid',
  'other'
] as const;

// Leave Statuses
export const LEAVE_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'cancelled'
] as const;

// Notification Types
export const NOTIFICATION_TYPES = [
  'info',
  'warning',
  'error',
  'success'
] as const;

// File Upload Constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  ALLOWED_EXTENSIONS: [
    '.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx'
  ]
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd',
  LONG: 'dd MMMM yyyy',
  SHORT: 'dd/MM/yy'
};

// Colors
export const COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  
  // Status Colors
  ACTIVE: '#10B981',
  INACTIVE: '#EF4444',
  PENDING: '#F59E0B',
  EXPIRED: '#EF4444',
  
  // Chart Colors
  CHART: [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ]
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  SETTINGS: 'user_settings',
  LAST_VISITED: 'last_visited_page'
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^05\d{8}$/,
  SAUDI_ID: /^\d{10}$/,
  PASSPORT: /^[A-Z]\d{8}$/,
  LICENSE_NUMBER: /^\d{10,15}$/,
  TAX_NUMBER: /^\d{15}$/
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED: 'هذا الحقل مطلوب',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  INVALID_PHONE: 'رقم الهاتف غير صحيح',
  INVALID_ID: 'رقم الهوية غير صحيح',
  PASSWORDS_NOT_MATCH: 'كلمات المرور غير متطابقة',
  FILE_TOO_LARGE: 'حجم الملف كبير جداً',
  INVALID_FILE_TYPE: 'نوع الملف غير مدعوم',
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  UNAUTHORIZED: 'غير مصرح لك بالوصول',
  NOT_FOUND: 'المورد غير موجود',
  SERVER_ERROR: 'خطأ في الخادم'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'تم إنشاء السجل بنجاح',
  UPDATED: 'تم تحديث السجل بنجاح',
  DELETED: 'تم حذف السجل بنجاح',
  UPLOADED: 'تم رفع الملف بنجاح',
  SAVED: 'تم حفظ البيانات بنجاح',
  SENT: 'تم إرسال البيانات بنجاح'
};

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING: 'جارٍ التحميل...',
  SAVING: 'جارٍ الحفظ...',
  UPLOADING: 'جارٍ الرفع...',
  PROCESSING: 'جارٍ المعالجة...',
  DELETING: 'جارٍ الحذف...'
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'نظام إدارة العمال',
  VERSION: '2.0.0',
  DESCRIPTION: 'نظام متكامل لإدارة العمال والشركات',
  COPYRIGHT: '© 2025 جميع الحقوق محفوظة',
  CONTACT_EMAIL: 'support@workers-system.com',
  PHONE: '+966 11 123 4567'
};

// Export default object with all constants
export default {
  API_ENDPOINTS,
  ROUTES,
  WORKER_TYPES,
  WORKER_STATUSES,
  COMPANY_STATUSES,
  NATIONALITIES,
  DOCUMENT_TYPES,
  LEAVE_TYPES,
  LEAVE_STATUSES,
  NOTIFICATION_TYPES,
  FILE_UPLOAD,
  PAGINATION,
  DATE_FORMATS,
  COLORS,
  STORAGE_KEYS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  APP_CONFIG
};
