import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { PermissionProvider } from '../context/PermissionContext'
import { Toaster } from 'react-hot-toast'

// الصفحات العامة
import CompanyGrid from '../pages/Landing/CompanyGrid'
import CompanyLogin from '../pages/Auth/CompanyLogin'

// صفحات الشركة
import CompanyDashboard from '../pages/Company/Dashboard'

// مكونات الحماية
import { ProtectedRoute, CompanyProtectedRoute } from '../components/common'

const AppRoutes: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <PermissionProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* الصفحة الرئيسية - اختيار الشركة */}
              <Route path="/" element={<CompanyGrid />} />

              {/* صفحة تسجيل الدخول العامة */}
              <Route path="/login" element={<Login />} />

              {/* تسجيل الدخول للشركة المحددة */}
              <Route path="/auth/company/:companyId/login" element={<CompanyLogin />} />

              {/* مسارات الشركة المحمية */}
              <Route path="/company/:companyId/*" element={
                <ProtectedRoute>
                  <CompanyProtectedRoute>
                    <CompanyRoutes />
                  </CompanyProtectedRoute>
                </ProtectedRoute>
              } />

              {/* صفحة 404 مخصصة */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            
            {/* نظام الإشعارات */}
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  fontFamily: 'Cairo, sans-serif',
                  direction: 'rtl'
                },
                success: {
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
          </div>
        </PermissionProvider>
      </AuthProvider>
    </Router>
  )
}
import Login from '../pages/Login'
import NotFoundPage from '../pages/NotFoundPage'

// مسارات الشركة الفرعية (مبسطة مؤقتاً)
const CompanyRoutes: React.FC = () => {
  return (
    <Routes>
      {/* لوحة التحكم */}
      <Route path="dashboard" element={<CompanyDashboard />} />
      <Route path="" element={<Navigate to="dashboard" replace />} />
      
      {/* إعادة توجيه المسارات غير المعروفة للوحة التحكم */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
