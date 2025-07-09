/**
 * Optimized Dashboard Component with React Query
 * مكون لوحة التحكم المحسّن مع React Query
 */

import React, { memo, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../services/api-optimized';

// Lazy load dashboard sections for better performance
const DashboardStats = React.lazy(() => import('./dashboard/DashboardStats'));
const DashboardNotifications = React.lazy(() => import('./dashboard/DashboardNotifications'));
const DashboardQuickActions = React.lazy(() => import('./dashboard/DashboardQuickActions'));
const DashboardExpiringDocs = React.lazy(() => import('./dashboard/DashboardExpiringDocs'));

// Loading component
const LoadingCard = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
));

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">حدث خطأ في تحميل البيانات</h3>
          <p className="text-red-600 text-sm mt-1">يرجى تحديث الصفحة أو المحاولة لاحقاً</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance monitoring component
const PerformanceMonitor = memo(() => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
      <div>React Query DevTools: متاح</div>
      <div>البيئة: {process.env.NODE_ENV}</div>
    </div>
  );
});

// Main Dashboard component
const DashboardPageOptimized: React.FC = memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم المحسّنة</h1>
          <p className="text-gray-600">مرحباً بك في نظام إدارة العمال المحسّن</p>
        </div>

        {/* Stats Grid */}
        <ErrorBoundary>
          <Suspense fallback={<LoadingCard />}>
            <DashboardStats />
          </Suspense>
        </ErrorBoundary>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <Suspense fallback={<LoadingCard />}>
                <DashboardQuickActions />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Notifications */}
          <div>
            <ErrorBoundary>
              <Suspense fallback={<LoadingCard />}>
                <DashboardNotifications />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Expiring Documents */}
        <div className="mt-8">
          <ErrorBoundary>
            <Suspense fallback={<LoadingCard />}>
              <DashboardExpiringDocs />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />
      </div>

      {/* React Query DevTools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
});

DashboardPageOptimized.displayName = 'DashboardPageOptimized';

export default DashboardPageOptimized;
