// Mock auth service للتجربة بدون backend
export const mockAuthService = {
  login: async (credentials: any) => {
    // محاكاة تسجيل دخول ناجح
    return {
      user: {
        id: 1,
        name: 'مستخدم تجريبي',
        email: 'test@example.com',
        company_id: 1
      },
      token: 'mock-token-123'
    }
  },
  
  logout: async () => {
    return { success: true }
  }
}

export const mockCompaniesService = {
  getAll: async () => {
    return {
      items: [
        {
          id: 1,
          name: 'شركة التجارة المحدودة',
          description: 'شركة رائدة في مجال التجارة والتوزيع',
          logo: null,
          is_active: true,
          address: 'الرياض، المملكة العربية السعودية',
          phone: '+966501234567',
          email: 'info@trade-company.com'
        },
        {
          id: 2,
          name: 'مؤسسة البناء والتعمير',
          description: 'متخصصون في أعمال البناء والمقاولات',
          logo: null,
          is_active: true,
          address: 'جدة، المملكة العربية السعودية',
          phone: '+966507654321',
          email: 'contact@construction.com'
        },
        {
          id: 3,
          name: 'شركة التقنية المتقدمة',
          description: 'حلول تقنية مبتكرة للأعمال',
          logo: null,
          is_active: true,
          address: 'الدمام، المملكة العربية السعودية',
          phone: '+966551112233',
          email: 'info@tech-advanced.com'
        }
      ],
      total: 3,
      page: 1,
      per_page: 10
    }
  }
}
