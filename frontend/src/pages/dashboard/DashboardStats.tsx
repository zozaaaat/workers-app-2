/**
 * Dashboard Stats Component with React Query
 * مكون إحصائيات لوحة التحكم مع React Query
 */

import React, { memo } from 'react';
import { useDashboardStats, useInvalidateCache } from '../../services/api-optimized';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  loading?: boolean;
}

const StatCard = memo<StatCardProps>(({ title, value, icon, color, subtitle, loading }) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-200 hover:shadow-md`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        {loading ? (
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
        ) : (
          <p className="text-3xl font-bold" style={{ color }}>
            {value.toLocaleString()}
          </p>
        )}
        {subtitle && !loading && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}15` }}>
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
  </div>
));

const DashboardStats: React.FC = memo(() => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const invalidateCache = useInvalidateCache();

  const handleRefresh = async () => {
    await invalidateCache.mutateAsync();
    refetch();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">خطأ في تحميل الإحصائيات</h3>
        <p className="text-red-600 text-sm mt-1">يرجى المحاولة لاحقاً</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // Icons as simple SVGs
  const WorkersIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  const CompanyIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
    </svg>
  );

  const WarningIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  );

  const TaskIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
    </svg>
  );

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">الإحصائيات العامة</h2>
        <button
          onClick={handleRefresh}
          disabled={invalidateCache.isPending}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {invalidateCache.isPending ? 'جارِ التحديث...' : 'تحديث'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي العمال"
          value={stats?.total_workers || 0}
          icon={<WorkersIcon />}
          color="#4BC0C0"
          subtitle={stats?.workers_this_month ? `${stats.workers_this_month} معين هذا الشهر` : undefined}
          loading={isLoading}
        />
        
        <StatCard
          title="الشركات المسجلة"
          value={stats?.total_companies || 0}
          icon={<CompanyIcon />}
          color="#36A2EB"
          subtitle="شركة نشطة"
          loading={isLoading}
        />
        
        <StatCard
          title="انتهاء صالحية قريبة"
          value={stats?.upcoming_expirations || 0}
          icon={<WarningIcon />}
          color="#FF6384"
          subtitle="خلال الشهر القادم"
          loading={isLoading}
        />
        
        <StatCard
          title="الإشعارات غير المقروءة"
          value={stats?.unread_notifications || 0}
          icon={<TaskIcon />}
          color="#FFCE56"
          subtitle="إشعار جديد"
          loading={isLoading}
        />
      </div>

      {/* Performance indicator */}
      {!isLoading && (
        <div className="text-xs text-gray-500 text-center">
          آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
          {stats && ' • البيانات محدّثة'}
        </div>
      )}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;
