/**
 * Dashboard Notifications Component
 * مكون إشعارات لوحة التحكم
 */

import React, { memo } from 'react';
import { useRecentNotifications } from '../../services/api-optimized';

interface NotificationProps {
  id: number;
  title: string;
  message: string;
  created_at: string;
  type?: string;
}

const NotificationItem = memo<NotificationProps>(({ title, message, created_at, type }) => {
  const getTypeColor = (notificationType?: string) => {
    switch (notificationType) {
      case 'warning': return 'border-l-yellow-400 bg-yellow-50';
      case 'error': return 'border-l-red-400 bg-red-50';
      case 'success': return 'border-l-green-400 bg-green-50';
      default: return 'border-l-blue-400 bg-blue-50';
    }
  };

  return (
    <div className={`border-l-4 p-3 mb-3 rounded-r-lg ${getTypeColor(type)}`}>
      <h4 className="font-medium text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-gray-700 text-sm mb-2">{message}</p>
      <p className="text-gray-500 text-xs">
        {new Date(created_at).toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  );
});

const DashboardNotifications: React.FC = memo(() => {
  const { data: notifications, isLoading, error } = useRecentNotifications(10);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الإشعارات الحديثة</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 text-sm">خطأ في تحميل الإشعارات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">الإشعارات الحديثة</h3>
        <div className="flex items-center text-blue-600">
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span className="text-sm">الإشعارات</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification: NotificationProps) => (
            <NotificationItem
              key={notification.id}
              {...notification}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5-5-5h5V3h5v14z"/>
            </svg>
            <p className="text-gray-500 text-sm">لا توجد إشعارات جديدة</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications && notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <button className="w-full text-blue-600 text-sm hover:text-blue-800 transition-colors">
            عرض جميع الإشعارات
          </button>
        </div>
      )}
    </div>
  );
});

DashboardNotifications.displayName = 'DashboardNotifications';

export default DashboardNotifications;
