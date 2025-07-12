// تنسيق التواريخ
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'منذ قليل'
  } else if (diffInHours < 24) {
    return `منذ ${diffInHours} ساعة`
  } else if (diffInHours < 48) {
    return 'منذ يوم'
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `منذ ${diffInDays} يوم`
  }
}

// تنسيق الأرقام
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-SA').format(num)
}

// تنسيق حجم الملف
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت'
  
  const k = 1024
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ترجمة حالات الموظفين
export const translateEmployeeStatus = (status: string): string => {
  const translations: Record<string, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    terminated: 'منتهي الخدمة',
    suspended: 'موقوف',
    on_leave: 'في إجازة',
  }
  return translations[status] || status
}

// ترجمة حالات الرخص
export const translateLicenseStatus = (status: string): string => {
  const translations: Record<string, string> = {
    active: 'نشطة',
    expired: 'منتهية',
    suspended: 'موقوفة',
    cancelled: 'ملغية',
    pending_renewal: 'في انتظار التجديد',
    under_review: 'قيد المراجعة',
  }
  return translations[status] || status
}

// ترجمة أنواع الوثائق
export const translateDocumentType = (type: string): string => {
  const translations: Record<string, string> = {
    national_id: 'الهوية الوطنية',
    passport: 'جواز السفر',
    birth_certificate: 'شهادة الميلاد',
    marriage_certificate: 'عقد الزواج',
    education_certificate: 'الشهادة التعليمية',
    experience_certificate: 'شهادة الخبرة',
    employment_contract: 'عقد العمل',
    job_offer: 'عرض العمل',
    resignation_letter: 'خطاب الاستقالة',
    performance_review: 'تقييم الأداء',
    salary_certificate: 'شهادة الراتب',
    iqama: 'الإقامة',
    work_permit: 'رخصة العمل',
    visa: 'التأشيرة',
    license: 'الرخصة',
    permit: 'التصريح',
    bank_statement: 'كشف حساب بنكي',
    salary_slip: 'قسيمة الراتب',
    tax_document: 'مستند ضريبي',
    invoice: 'فاتورة',
    receipt: 'إيصال',
    medical_report: 'تقرير طبي',
    health_certificate: 'شهادة صحية',
    vaccination_record: 'سجل التطعيمات',
    company_registration: 'سجل تجاري',
    commercial_register: 'السجل التجاري',
    tax_certificate: 'شهادة ضريبية',
    business_license: 'رخصة تجارية',
    other: 'أخرى',
  }
  return translations[type] || type
}

// ترجمة أنواع الكيانات
export const translateEntityType = (type: string): string => {
  const translations: Record<string, string> = {
    user: 'مستخدم',
    employee: 'موظف',
    company: 'شركة',
    license: 'رخصة',
    leave: 'إجازة',
    deduction: 'استقطاع',
    performance: 'أداء',
    training: 'تدريب',
    reward: 'مكافأة',
    absence: 'غياب',
    medical: 'طبي',
  }
  return translations[type] || type
}

// ألوان مستوى التنبيه
export const getAlertColor = (level: string): string => {
  const colors: Record<string, string> = {
    critical: 'text-red-600 bg-red-50 border-red-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  }
  return colors[level] || colors.info
}

// ألوان أولوية المهام
export const getTaskPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-green-600 bg-green-50',
  }
  return colors[priority] || colors.low
}

// ترجمة أولوية المهام
export const translateTaskPriority = (priority: string): string => {
  const translations: Record<string, string> = {
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة',
  }
  return translations[priority] || priority
}

// ترجمة حالة المهام
export const translateTaskStatus = (status: string): string => {
  const translations: Record<string, string> = {
    pending: 'في الانتظار',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتملة',
  }
  return translations[status] || status
}

// تحديد لون حالة المهام
export const getTaskStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'text-gray-600 bg-gray-50',
    in_progress: 'text-blue-600 bg-blue-50',
    completed: 'text-green-600 bg-green-50',
  }
  return colors[status] || colors.pending
}
