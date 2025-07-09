/**
 * Dashboard Quick Actions Component
 * مكون الإجراءات السريعة للوحة التحكم
 */

import React, { memo } from 'react';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const QuickActionCard = memo<QuickActionProps>(({ title, description, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-right group"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 mb-1 group-hover:text-gray-700">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className={`p-2 rounded-lg ml-3`} style={{ backgroundColor: `${color}15` }}>
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
  </button>
));

const DashboardQuickActions: React.FC = memo(() => {
  const handleAction = (action: string) => {
    console.log(`تنفيذ إجراء: ${action}`);
    // TODO: Implement navigation or action
  };

  // Icons
  const WorkersIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  const CompanyIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
    </svg>
  );

  const ReportIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
    </svg>
  );

  const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.97 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.04 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
    </svg>
  );

  const SearchIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
    </svg>
  );

  const NotificationIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
  );

  const actions = [
    {
      title: 'إضافة عامل جديد',
      description: 'تسجيل عامل جديد في النظام',
      icon: <WorkersIcon />,
      color: '#4BC0C0',
      action: 'add-worker'
    },
    {
      title: 'إضافة شركة',
      description: 'تسجيل شركة جديدة',
      icon: <CompanyIcon />,
      color: '#36A2EB',
      action: 'add-company'
    },
    {
      title: 'إنشاء تقرير',
      description: 'إنشاء تقرير جديد',
      icon: <ReportIcon />,
      color: '#FFCE56',
      action: 'create-report'
    },
    {
      title: 'البحث المتقدم',
      description: 'البحث في قاعدة البيانات',
      icon: <SearchIcon />,
      color: '#FF6384',
      action: 'advanced-search'
    },
    {
      title: 'إدارة الإشعارات',
      description: 'إدارة وتخصيص الإشعارات',
      icon: <NotificationIcon />,
      color: '#9966FF',
      action: 'manage-notifications'
    },
    {
      title: 'إعدادات النظام',
      description: 'تكوين إعدادات النظام',
      icon: <SettingsIcon />,
      color: '#FF9F40',
      action: 'system-settings'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">الإجراءات السريعة</h3>
        <div className="flex items-center text-gray-500">
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13,14L10.5,9.5L9.08,11.92L7,9H2V15H22V14H13M22,4H2V6H22V4Z"/>
          </svg>
          <span className="text-sm">الأدوات</span>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <QuickActionCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            color={action.color}
            onClick={() => handleAction(action.action)}
          />
        ))}
      </div>

      {/* Performance tip */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 ml-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">نصيحة للأداء</p>
            <p className="text-sm text-blue-700 mt-1">
              يتم تحميل هذه الإجراءات ديناميكياً لتحسين أداء التطبيق
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

DashboardQuickActions.displayName = 'DashboardQuickActions';

export default DashboardQuickActions;
