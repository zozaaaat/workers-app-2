import React, { useEffect, useState } from 'react';
import {
  PeopleAlt as WorkersIcon,
  Business as CompanyIcon,
  Assignment as TaskIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  NotificationsActive as NotificationsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { fetchNotifications } from '../../api_notifications';

interface DashboardStats {
  workers: number;
  companies: number;
  absences: number;
  leaves: number;
  upcomingExpirations: number;
  workersThisMonth: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle, 
  trend 
}) => (
  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className="text-4xl" style={{ color: color }}>
        {icon}
      </div>
      {trend && (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <TrendingUpIcon className="w-3 h-3 mr-1" />
          +{trend}%
        </span>
      )}
    </div>
    <h3 className="text-3xl font-bold mb-2" style={{ color: color }}>
      {value.toLocaleString()}
    </h3>
    <p className="text-lg font-medium text-gray-700 mb-1">{title}</p>
    {subtitle && (
      <p className="text-sm text-gray-500">{subtitle}</p>
    )}
  </div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        fetchDashboardStats(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const [workers, companies, absences, leaves] = await Promise.all([
        axios.get(`${API_URL}/workers`),
        axios.get(`${API_URL}/companies`),
        axios.get(`${API_URL}/absences`),
        axios.get(`${API_URL}/leaves`)
      ]);

      const workersData = workers.data;
      const companiesData = companies.data;
      const currentDate = new Date();
      const oneMonthLater = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const upcomingExpirations = workersData.filter((worker: any) => {
        if (!worker.work_permit_end) return false;
        const expiryDate = new Date(worker.work_permit_end);
        return expiryDate <= oneMonthLater && expiryDate >= currentDate;
      }).length;

      const workersThisMonth = workersData.filter((worker: any) => {
        if (!worker.hire_date) return false;
        const hireDate = new Date(worker.hire_date);
        return hireDate.getMonth() === currentDate.getMonth() && 
               hireDate.getFullYear() === currentDate.getFullYear();
      }).length;

      const dashboardStats: DashboardStats = {
        workers: workersData.length,
        companies: companiesData.length,
        absences: absences.data.length,
        leaves: leaves.data.length,
        upcomingExpirations,
        workersThisMonth
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.slice(0, 5)); // Show only latest 5
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadDashboardData}
              className="text-red-700 hover:text-red-900 font-medium"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">لا توجد بيانات لعرضها</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            مرحباً {user?.username} 👋
          </h1>
          <p className="text-gray-600">
            نظرة عامة على نشاط النظام اليوم
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshIcon className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="إجمالي العمال"
          value={stats.workers}
          icon={<WorkersIcon />}
          color="#4BC0C0"
          subtitle={`${stats.workersThisMonth} معين هذا الشهر`}
          trend={stats.workersThisMonth > 0 ? 12 : 0}
        />
        <StatCard
          title="الشركات المسجلة"
          value={stats.companies}
          icon={<CompanyIcon />}
          color="#36A2EB"
          subtitle="شركة نشطة"
        />
        <StatCard
          title="انتهاء صالحية قريبة"
          value={stats.upcomingExpirations}
          icon={<WarningIcon />}
          color="#FF6384"
          subtitle="خلال الشهر القادم"
        />
        <StatCard
          title="الإجازات النشطة"
          value={stats.leaves}
          icon={<TaskIcon />}
          color="#FFCE56"
          subtitle="إجازة مستمرة"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">إجراءات سريعة</h2>
            <hr className="mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors duration-200">
                <WorkersIcon className="w-5 h-5 mr-2" />
                إضافة عامل
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-colors duration-200">
                <CompanyIcon className="w-5 h-5 mr-2" />
                إضافة شركة
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors duration-200">
                <TaskIcon className="w-5 h-5 mr-2" />
                تقرير جديد
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-orange-300 rounded-lg text-orange-700 hover:bg-orange-50 transition-colors duration-200">
                <WarningIcon className="w-5 h-5 mr-2" />
                التنبيهات
              </button>
            </div>
            
            {/* Statistics Summary */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">ملخص سريع</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">إجمالي الغيابات</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.absences}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">الإجازات المعتمدة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.leaves}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">التوظيف الشهري</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.workersThisMonth}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">تنبيهات مهمة</p>
                  <p className="text-2xl font-bold text-red-600">{stats.upcomingExpirations}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 h-full">
            <div className="flex items-center mb-4">
              <NotificationsIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">الإشعارات الحديثة</h2>
            </div>
            <hr className="mb-4" />
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-800 mb-2">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <NotificationsIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد إشعارات جديدة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts for upcoming expirations */}
      {stats.upcomingExpirations > 0 && (
        <div className="mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <WarningIcon className="w-6 h-6 text-yellow-600 mr-3" />
              <p className="text-yellow-800">
                ⚠️ هناك {stats.upcomingExpirations} عامل/عمال ستنتهي تراخيص عملهم خلال الشهر القادم
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
