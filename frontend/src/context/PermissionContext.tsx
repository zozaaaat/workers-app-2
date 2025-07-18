import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

// تعريف الصلاحيات المتاحة في النظام
export const PERMISSIONS = {
  // إدارة الموظفين
  EMPLOYEES_VIEW: 'employees.view',
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_EDIT: 'employees.edit',
  EMPLOYEES_DELETE: 'employees.delete',
  EMPLOYEES_ARCHIVE: 'employees.archive',
  
  // إدارة التراخيص
  LICENSES_VIEW: 'licenses.view',
  LICENSES_CREATE: 'licenses.create',
  LICENSES_EDIT: 'licenses.edit',
  LICENSES_DELETE: 'licenses.delete',
  LICENSES_ARCHIVE: 'licenses.archive',
  
  // إدارة الإجازات
  LEAVES_VIEW: 'leaves.view',
  LEAVES_CREATE: 'leaves.create',
  LEAVES_EDIT: 'leaves.edit',
  LEAVES_DELETE: 'leaves.delete',
  LEAVES_APPROVE: 'leaves.approve',
  LEAVES_REJECT: 'leaves.reject',
  
  // إدارة الاستقطاعات
  DEDUCTIONS_VIEW: 'deductions.view',
  DEDUCTIONS_CREATE: 'deductions.create',
  DEDUCTIONS_EDIT: 'deductions.edit',
  DEDUCTIONS_DELETE: 'deductions.delete',
  
  // إدارة الوثائق
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DOWNLOAD: 'documents.download',
  DOCUMENTS_DELETE: 'documents.delete',
  
  // إدارة التقارير
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_ADVANCED: 'reports.advanced',
  
  // إدارة المستخدمين
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_PERMISSIONS: 'users.permissions',
  
  // إدارة النظام
  SYSTEM_ADMIN: 'system.admin',
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_BACKUP: 'system.backup',
  
  // إدارة الإشعارات
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_CREATE: 'notifications.create',
  NOTIFICATIONS_DELETE: 'notifications.delete',
  
  // إدارة الشركة
  COMPANY_VIEW: 'company.view',
  COMPANY_EDIT: 'company.edit',
  COMPANY_DOCUMENTS: 'company.documents'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// تعريف الأدوار الافتراضية
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  HR_SPECIALIST: 'hr_specialist',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// تعريف الصلاحيات لكل دور
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // جميع الصلاحيات
  
  [ROLES.ADMIN]: [
    // إدارة الموظفين
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_EDIT,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.EMPLOYEES_ARCHIVE,
    
    // إدارة التراخيص
    PERMISSIONS.LICENSES_VIEW,
    PERMISSIONS.LICENSES_CREATE,
    PERMISSIONS.LICENSES_EDIT,
    PERMISSIONS.LICENSES_DELETE,
    PERMISSIONS.LICENSES_ARCHIVE,
    
    // إدارة الإجازات
    PERMISSIONS.LEAVES_VIEW,
    PERMISSIONS.LEAVES_CREATE,
    PERMISSIONS.LEAVES_EDIT,
    PERMISSIONS.LEAVES_DELETE,
    PERMISSIONS.LEAVES_APPROVE,
    PERMISSIONS.LEAVES_REJECT,
    
    // إدارة الاستقطاعات
    PERMISSIONS.DEDUCTIONS_VIEW,
    PERMISSIONS.DEDUCTIONS_CREATE,
    PERMISSIONS.DEDUCTIONS_EDIT,
    PERMISSIONS.DEDUCTIONS_DELETE,
    
    // إدارة الوثائق
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.DOCUMENTS_DELETE,
    
    // إدارة التقارير
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_ADVANCED,
    
    // إدارة المستخدمين
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    
    // إدارة الإشعارات
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_CREATE,
    PERMISSIONS.NOTIFICATIONS_DELETE,
    
    // إدارة الشركة
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_EDIT,
    PERMISSIONS.COMPANY_DOCUMENTS
  ],
  
  [ROLES.HR_MANAGER]: [
    // إدارة الموظفين (كاملة)
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_EDIT,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.EMPLOYEES_ARCHIVE,
    
    // إدارة التراخيص (كاملة)
    PERMISSIONS.LICENSES_VIEW,
    PERMISSIONS.LICENSES_CREATE,
    PERMISSIONS.LICENSES_EDIT,
    PERMISSIONS.LICENSES_DELETE,
    PERMISSIONS.LICENSES_ARCHIVE,
    
    // إدارة الإجازات (كاملة)
    PERMISSIONS.LEAVES_VIEW,
    PERMISSIONS.LEAVES_CREATE,
    PERMISSIONS.LEAVES_EDIT,
    PERMISSIONS.LEAVES_DELETE,
    PERMISSIONS.LEAVES_APPROVE,
    PERMISSIONS.LEAVES_REJECT,
    
    // إدارة الاستقطاعات
    PERMISSIONS.DEDUCTIONS_VIEW,
    PERMISSIONS.DEDUCTIONS_CREATE,
    PERMISSIONS.DEDUCTIONS_EDIT,
    PERMISSIONS.DEDUCTIONS_DELETE,
    
    // إدارة الوثائق
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.DOCUMENTS_DELETE,
    
    // إدارة التقارير
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_ADVANCED,
    
    // إدارة الإشعارات
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_CREATE,
    
    // الشركة (عرض فقط)
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_DOCUMENTS
  ],
  
  [ROLES.HR_SPECIALIST]: [
    // إدارة الموظفين (محدودة)
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_EDIT,
    
    // إدارة التراخيص (عرض وإنشاء فقط)
    PERMISSIONS.LICENSES_VIEW,
    PERMISSIONS.LICENSES_CREATE,
    PERMISSIONS.LICENSES_EDIT,
    
    // إدارة الإجازات (عرض وإنشاء)
    PERMISSIONS.LEAVES_VIEW,
    PERMISSIONS.LEAVES_CREATE,
    PERMISSIONS.LEAVES_EDIT,
    
    // إدارة الاستقطاعات (عرض وإنشاء)
    PERMISSIONS.DEDUCTIONS_VIEW,
    PERMISSIONS.DEDUCTIONS_CREATE,
    PERMISSIONS.DEDUCTIONS_EDIT,
    
    // إدارة الوثائق
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    
    // إدارة التقارير (أساسية)
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    
    // إدارة الإشعارات (عرض فقط)
    PERMISSIONS.NOTIFICATIONS_VIEW,
    
    // الشركة (عرض فقط)
    PERMISSIONS.COMPANY_VIEW
  ],
  
  [ROLES.EMPLOYEE]: [
    // الموظفين (عرض فقط للبيانات الخاصة)
    PERMISSIONS.EMPLOYEES_VIEW,
    
    // التراخيص (عرض فقط للبيانات الخاصة)
    PERMISSIONS.LICENSES_VIEW,
    
    // الإجازات (إنشاء وعرض للبيانات الخاصة)
    PERMISSIONS.LEAVES_VIEW,
    PERMISSIONS.LEAVES_CREATE,
    
    // الوثائق (عرض وتحميل للبيانات الخاصة)
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    
    // التقارير (عرض التقارير الخاصة فقط)
    PERMISSIONS.REPORTS_VIEW,
    
    // الإشعارات (عرض فقط)
    PERMISSIONS.NOTIFICATIONS_VIEW
  ],
  
  [ROLES.VIEWER]: [
    // عرض فقط للبيانات العامة
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.LICENSES_VIEW,
    PERMISSIONS.LEAVES_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.COMPANY_VIEW
  ]
}

// تعريف الصفحات والمميزات المتاحة لكل دور
export const PAGE_ACCESS: Record<string, Permission[]> = {
  '/dashboard': [PERMISSIONS.EMPLOYEES_VIEW], // لوحة المعلومات
  
  // صفحات الموظفين
  '/employees': [PERMISSIONS.EMPLOYEES_VIEW],
  '/employees/create': [PERMISSIONS.EMPLOYEES_CREATE],
  '/employees/edit': [PERMISSIONS.EMPLOYEES_EDIT],
  '/employees/delete': [PERMISSIONS.EMPLOYEES_DELETE],
  
  // صفحات التراخيص
  '/licenses': [PERMISSIONS.LICENSES_VIEW],
  '/licenses/create': [PERMISSIONS.LICENSES_CREATE],
  '/licenses/edit': [PERMISSIONS.LICENSES_EDIT],
  '/licenses/delete': [PERMISSIONS.LICENSES_DELETE],
  
  // صفحات الإجازات
  '/leaves': [PERMISSIONS.LEAVES_VIEW],
  '/leaves/create': [PERMISSIONS.LEAVES_CREATE],
  '/leaves/approve': [PERMISSIONS.LEAVES_APPROVE],
  
  // صفحات الاستقطاعات
  '/deductions': [PERMISSIONS.DEDUCTIONS_VIEW],
  '/deductions/create': [PERMISSIONS.DEDUCTIONS_CREATE],
  
  // صفحات الوثائق
  '/documents': [PERMISSIONS.DOCUMENTS_VIEW],
  '/documents/upload': [PERMISSIONS.DOCUMENTS_UPLOAD],
  
  // صفحات التقارير
  '/reports': [PERMISSIONS.REPORTS_VIEW],
  '/reports/advanced': [PERMISSIONS.REPORTS_ADVANCED],
  
  // صفحات إدارة المستخدمين
  '/users': [PERMISSIONS.USERS_VIEW],
  '/users/create': [PERMISSIONS.USERS_CREATE],
  '/users/permissions': [PERMISSIONS.USERS_PERMISSIONS],
  
  // صفحات إدارة النظام
  '/settings': [PERMISSIONS.SYSTEM_SETTINGS],
  '/admin': [PERMISSIONS.SYSTEM_ADMIN],
  
  // صفحات الشركة
  '/company': [PERMISSIONS.COMPANY_VIEW],
  '/company/edit': [PERMISSIONS.COMPANY_EDIT],
  '/company/documents': [PERMISSIONS.COMPANY_DOCUMENTS]
}

// تعريف المميزات المتاحة لكل دور
export const FEATURE_ACCESS: Record<string, Permission[]> = {
  // مميزات الموظفين
  'employee_bulk_actions': [PERMISSIONS.EMPLOYEES_DELETE, PERMISSIONS.EMPLOYEES_ARCHIVE],
  'employee_export': [PERMISSIONS.EMPLOYEES_VIEW, PERMISSIONS.REPORTS_EXPORT],
  'employee_advanced_search': [PERMISSIONS.EMPLOYEES_VIEW],
  
  // مميزات التراخيص
  'license_bulk_actions': [PERMISSIONS.LICENSES_DELETE, PERMISSIONS.LICENSES_ARCHIVE],
  'license_renewal_alerts': [PERMISSIONS.LICENSES_EDIT],
  'license_export': [PERMISSIONS.LICENSES_VIEW, PERMISSIONS.REPORTS_EXPORT],
  
  // مميزات الإجازات
  'leave_approval_workflow': [PERMISSIONS.LEAVES_APPROVE, PERMISSIONS.LEAVES_REJECT],
  'leave_bulk_approval': [PERMISSIONS.LEAVES_APPROVE],
  'leave_advanced_reports': [PERMISSIONS.REPORTS_ADVANCED],
  
  // مميزات الوثائق
  'document_bulk_upload': [PERMISSIONS.DOCUMENTS_UPLOAD],
  'document_advanced_management': [PERMISSIONS.DOCUMENTS_DELETE],
  'document_version_control': [PERMISSIONS.DOCUMENTS_UPLOAD, PERMISSIONS.DOCUMENTS_DELETE],
  
  // مميزات التقارير
  'advanced_analytics': [PERMISSIONS.REPORTS_ADVANCED],
  'custom_reports': [PERMISSIONS.REPORTS_ADVANCED],
  'data_export': [PERMISSIONS.REPORTS_EXPORT],
  
  // مميزات النظام
  'system_backup': [PERMISSIONS.SYSTEM_BACKUP],
  'user_management': [PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT, PERMISSIONS.USERS_DELETE],
  'permission_management': [PERMISSIONS.USERS_PERMISSIONS],
  
  // مميزات الإشعارات
  'notification_management': [PERMISSIONS.NOTIFICATIONS_CREATE, PERMISSIONS.NOTIFICATIONS_DELETE],
  'notification_broadcast': [PERMISSIONS.NOTIFICATIONS_CREATE, PERMISSIONS.SYSTEM_ADMIN]
}

// واجهة سياق الصلاحيات المحدثة
interface PermissionContextType {
  permissions: string[]
  hasPermission: (permission: string | string[]) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  hasRole: (role: string | string[]) => boolean
  canAccess: (resource: string, action: string) => boolean
  canAccessPage: (pagePath: string) => boolean
  canUseFeature: (featureName: string) => boolean
  getRolePermissions: (role: Role) => Permission[]
  isManager: () => boolean
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
  canEditLicenses: () => boolean
  canAddEmployees: () => boolean
  canApproveLeaves: () => boolean
  canManageUsers: () => boolean
  canAccessReports: () => boolean
  canManageDocuments: () => boolean
  isLoading: boolean
  userRole: string | null
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

interface PermissionProviderProps {
  children: ReactNode
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[PermissionProvider] Rendered. Permissions:', permissions, 'User:', user, 'isAuthenticated:', isAuthenticated);
    if (!authLoading) {
      let userPermissions: string[] = [];
      if (isAuthenticated && user) {
        if (user.permissions && user.permissions.length > 0) {
          userPermissions = user.permissions;
        } else if (user.roleData && user.roleData.permissions) {
          userPermissions = user.roleData.permissions;
        } else if (user.role) {
          const rolePermissions = ROLE_PERMISSIONS[user.role as Role];
          if (rolePermissions) {
            userPermissions = rolePermissions;
          }
        }
      }
      setPermissions(userPermissions);
      setIsLoading(false);
    }
  }, [user, isAuthenticated, authLoading]);

  // ...existing code...
  const hasPermission = (permission: string | string[]): boolean => {
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p));
    }
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionsToCheck: string[]): boolean => {
    return permissionsToCheck.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionsToCheck: string[]): boolean => {
    return permissionsToCheck.every(permission => permissions.includes(permission));
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    const userRole = typeof user.role === 'string' ? user.role : user.roleData?.name || '';
    if (Array.isArray(role)) {
      return role.some(r => userRole === r);
    }
    return userRole === role;
  };

  const canAccess = (resource: string, action: string): boolean => {
    const permission = `${resource}.${action}`;
    return hasPermission(permission);
  };

  const canAccessPage = (pagePath: string): boolean => {
    const requiredPermissions = PAGE_ACCESS[pagePath];
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    return hasAnyPermission(requiredPermissions);
  };

  const canUseFeature = (featureName: string): boolean => {
    const requiredPermissions = FEATURE_ACCESS[featureName];
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    return hasAllPermissions(requiredPermissions);
  };

  const getRolePermissions = (role: Role): Permission[] => {
    return ROLE_PERMISSIONS[role] || [];
  };

  const isManager = (): boolean => {
    return hasRole([ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  };

  const isAdmin = (): boolean => {
    return hasRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  };

  const isSuperAdmin = (): boolean => {
    return hasRole(ROLES.SUPER_ADMIN);
  };

  const canEditLicenses = (): boolean => {
    return hasPermission(PERMISSIONS.LICENSES_EDIT);
  };

  const canAddEmployees = (): boolean => {
    return hasPermission(PERMISSIONS.EMPLOYEES_CREATE);
  };

  const canApproveLeaves = (): boolean => {
    return hasPermission(PERMISSIONS.LEAVES_APPROVE);
  };

  const canManageUsers = (): boolean => {
    return hasAnyPermission([
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_PERMISSIONS
    ]);
  };

  const canAccessReports = (): boolean => {
    return hasPermission(PERMISSIONS.REPORTS_VIEW);
  };

  const canManageDocuments = (): boolean => {
    return hasAnyPermission([
      PERMISSIONS.DOCUMENTS_UPLOAD,
      PERMISSIONS.DOCUMENTS_DELETE
    ]);
  };

  const getUserRole = (): string | null => {
    if (!user) return null;
    return typeof user.role === 'string' ? user.role : user.roleData?.name || null;
  };

  const value: PermissionContextType = {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canAccess,
    canAccessPage,
    canUseFeature,
    getRolePermissions,
    isManager,
    isAdmin,
    isSuperAdmin,
    canEditLicenses,
    canAddEmployees,
    canApproveLeaves,
    canManageUsers,
    canAccessReports,
    canManageDocuments,
    isLoading,
    userRole: getUserRole()
  };

  return React.createElement(PermissionContext.Provider, { value }, children);
};

// Hook to use PermissionContext
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};