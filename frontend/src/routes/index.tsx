import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/Login'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard/Overview'

// صفحات العمال
import EmployeesList from '../pages/Dashboard/Employees/List'
import EmployeesAdd from '../pages/Dashboard/Employees/Add'
import EmployeesEdit from '../pages/Dashboard/Employees/Edit'
import EmployeesArchive from '../pages/Dashboard/Employees/Archive'
import EmployeesFiles from '../pages/Dashboard/Employees/Files'

// صفحات الرخص
import LicensesList from '../pages/Dashboard/Licenses/List'
import LicensesAdd from '../pages/Dashboard/Licenses/Add'
import LicensesEdit from '../pages/Dashboard/Licenses/Edit'
import LicensesArchive from '../pages/Dashboard/Licenses/Archive'
import LicensesFiles from '../pages/Dashboard/Licenses/Files'

// صفحات الإجازات
import LeavesList from '../pages/Dashboard/Leaves/List'
import LeavesAdd from '../pages/Dashboard/Leaves/Add'

// صفحات الخصومات
import DeductionsList from '../pages/Dashboard/Deductions/List'
import DeductionsAdd from '../pages/Dashboard/Deductions/Add'

// صفحات الوثائق
import CompanyDocuments from '../pages/Dashboard/Documents/CompanyDocuments'

// صفحات التقارير
import Reports from '../pages/Dashboard/Reports/Reports'

// صفحات المستخدمين
import UsersList from '../pages/Dashboard/Users/List'
import UsersAdd from '../pages/Dashboard/Users/Add'
import UsersPermissions from '../pages/Dashboard/Users/Permissions'

// مكون الحماية للمسارات
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// مكون التوجيه العام للتطبيق
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* المسارات العامة */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        } 
      />

      {/* مسارات لوحة التحكم المحمية */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* مسارات العمال */}
      <Route 
        path="/dashboard/employees" 
        element={
          <ProtectedRoute>
            <EmployeesList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/employees/add" 
        element={
          <ProtectedRoute>
            <EmployeesAdd />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/employees/edit/:id" 
        element={
          <ProtectedRoute>
            <EmployeesEdit />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/employees/archive" 
        element={
          <ProtectedRoute>
            <EmployeesArchive />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/employees/:id/files" 
        element={
          <ProtectedRoute>
            <EmployeesFiles />
          </ProtectedRoute>
        } 
      />

      {/* مسارات الرخص */}
      <Route 
        path="/dashboard/licenses" 
        element={
          <ProtectedRoute>
            <LicensesList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/licenses/add" 
        element={
          <ProtectedRoute>
            <LicensesAdd />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/licenses/edit/:id" 
        element={
          <ProtectedRoute>
            <LicensesEdit />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/licenses/archive" 
        element={
          <ProtectedRoute>
            <LicensesArchive />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/licenses/:id/files" 
        element={
          <ProtectedRoute>
            <LicensesFiles />
          </ProtectedRoute>
        } 
      />

      {/* مسارات الإجازات */}
      <Route 
        path="/dashboard/leaves" 
        element={
          <ProtectedRoute>
            <LeavesList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/leaves/add" 
        element={
          <ProtectedRoute>
            <LeavesAdd />
          </ProtectedRoute>
        } 
      />

      {/* مسارات الخصومات */}
      <Route 
        path="/dashboard/deductions" 
        element={
          <ProtectedRoute>
            <DeductionsList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/deductions/add" 
        element={
          <ProtectedRoute>
            <DeductionsAdd />
          </ProtectedRoute>
        } 
      />

      {/* مسارات الوثائق */}
      <Route 
        path="/dashboard/documents" 
        element={
          <ProtectedRoute>
            <CompanyDocuments />
          </ProtectedRoute>
        } 
      />

      {/* مسارات التقارير */}
      <Route 
        path="/dashboard/reports" 
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } 
      />

      {/* مسارات المستخدمين */}
      <Route 
        path="/dashboard/users" 
        element={
          <ProtectedRoute>
            <UsersList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/users/add" 
        element={
          <ProtectedRoute>
            <UsersAdd />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/users/permissions" 
        element={
          <ProtectedRoute>
            <UsersPermissions />
          </ProtectedRoute>
        } 
      />

      {/* مسار افتراضي */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
