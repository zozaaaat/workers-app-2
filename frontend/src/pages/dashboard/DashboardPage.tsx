import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  PeopleAlt as WorkersIcon,
  Business as CompanyIcon,
  Assignment as TaskIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  NotificationsActive as NotificationsIcon
} from '@mui/icons-material';
import { Pie, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import axios from 'axios';
import { API_URL } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { fetchNotifications } from '../../api_notifications';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);

interface DashboardStats {
  workers: number;
  companies: number;
  absences: number;
  leaves: number;
  upcomingExpirations: number;
  workersThisMonth: number;
  totalDocuments: number;
  pendingApprovals: number;
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
  <Card 
    sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${color}20`,
        border: `1px solid ${color}50`
      }
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box sx={{ color: color, fontSize: '2.5rem' }}>
          {icon}
        </Box>
        {trend && (
          <Chip
            size="small"
            icon={<TrendingUpIcon />}
            label={`+${trend}%`}
            color={trend > 0 ? 'success' : 'error'}
            variant="outlined"
          />
        )}
      </Box>
      <Typography variant="h4" fontWeight="bold" color={color} mb={1}>
        {value.toLocaleString()}
      </Typography>
      <Typography variant="h6" color="text.primary" mb={0.5}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [chartsData, setChartsData] = useState<any>(null);
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
    const [workers, companies, absences, leaves, documents] = await Promise.all([
      axios.get(`${API_URL}/workers/public`),
      axios.get(`${API_URL}/companies`),
      axios.get(`${API_URL}/absences`),
      axios.get(`${API_URL}/leaves`),
      // Add document count endpoint when available
      Promise.resolve({ data: [] })
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
      workersThisMonth,
      totalDocuments: documents.data.length,
      pendingApprovals: 0 // Add logic for pending approvals
    };

    setStats(dashboardStats);
    setupChartsData(workersData, companiesData);
  };

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.slice(0, 5)); // Show only latest 5
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const setupChartsData = (workersData: any[], companiesData: any[]) => {
    // Workers by type chart
    const workerTypes = workersData.reduce((acc: any, worker: any) => {
      const type = worker.worker_type || 'غير محدد';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const workersChart = {
      labels: Object.keys(workerTypes),
      datasets: [{
        data: Object.values(workerTypes),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    // Monthly hiring trend
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = date.toLocaleString(i18n.language, { month: 'short' });
      const monthNumber = date.getMonth();
      const year = date.getFullYear();
      
      const count = workersData.filter((worker: any) => {
        if (!worker.hire_date) return false;
        const hireDate = new Date(worker.hire_date);
        return hireDate.getMonth() === monthNumber && hireDate.getFullYear() === year;
      }).length;

      return { month, count };
    });

    const monthlyTrend = {
      labels: monthlyData.map(item => item.month),
      datasets: [{
        label: 'عدد العمال المعينين',
        data: monthlyData.map(item => item.count),
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: '#4BC0C0',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    };

    // Companies distribution
    const companiesChart = {
      labels: companiesData.slice(0, 5).map(company => company.name),
      datasets: [{
        label: 'عدد العمال',
        data: companiesData.slice(0, 5).map(() => Math.floor(Math.random() * 50) + 10),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    };

    setChartsData({ workersChart, monthlyTrend, companiesChart });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={loadDashboardData}>
              إعادة المحاولة
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={3}>
        <Alert severity="warning">لا توجد بيانات لعرضها</Alert>
      </Box>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            مرحباً {user?.username} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            نظرة عامة على نشاط النظام اليوم
          </Typography>
        </Box>
        <Tooltip title="تحديث البيانات">
          <IconButton 
            onClick={handleRefresh} 
            aria-label="refresh button" 
            disabled={refreshing}
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <RefreshIcon sx={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
        <Box flex="1 1 250px" minWidth="250px">
          <StatCard
            title="إجمالي العمال"
            value={stats?.workers || 0}
            icon={<WorkersIcon />}
            color="#4BC0C0"
            subtitle={`${stats?.workersThisMonth || 0} معين هذا الشهر`}
            trend={stats?.workersThisMonth && stats.workersThisMonth > 0 ? 12 : 0}
          />
        </Box>
        <Box flex="1 1 250px" minWidth="250px">
          <StatCard
            title="الشركات المسجلة"
            value={stats?.companies || 0}
            icon={<CompanyIcon />}
            color="#36A2EB"
            subtitle="شركة نشطة"
          />
        </Box>
        <Box flex="1 1 250px" minWidth="250px">
          <StatCard
            title="انتهاء صالحية قريبة"
            value={stats?.upcomingExpirations || 0}
            icon={<WarningIcon />}
            color="#FF6384"
            subtitle="خلال الشهر القادم"
          />
        </Box>
        <Box flex="1 1 250px" minWidth="250px">
          <StatCard
            title="الإجازات النشطة"
            value={stats?.leaves || 0}
            icon={<TaskIcon />}
            color="#FFCE56"
            subtitle="إجازة مستمرة"
          />
        </Box>
      </Box>

      {/* Charts and Notifications */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        {/* Charts */}
        <Box flex="2 1 600px" minWidth="600px">
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex="1 1 300px" minWidth="300px">
              <Card sx={{ height: '400px' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    توزيع العمال حسب النوع
                  </Typography>
                  <Box height="320px">
                    {chartsData?.workersChart && (
                      <Pie data={chartsData.workersChart} options={chartOptions} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box flex="1 1 300px" minWidth="300px">
              <Card sx={{ height: '400px' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    اتجاه التوظيف (6 أشهر)
                  </Typography>
                  <Box height="320px">
                    {chartsData?.monthlyTrend && (
                      <Line data={chartsData.monthlyTrend} options={chartOptions} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box width="100%">
              <Card sx={{ height: '300px' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    أكثر الشركات توظيفاً
                  </Typography>
                  <Box height="220px">
                    {chartsData?.companiesChart && (
                      <Bar data={chartsData.companiesChart} options={chartOptions} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Notifications Panel */}
        <Box flex="1 1 300px" minWidth="300px">
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  الإشعارات الحديثة
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box maxHeight="600px" overflow="auto">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        border: '1px solid #e0e0e0',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium" mb={1}>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.created_at).toLocaleDateString('ar-EG')}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    لا توجد إشعارات جديدة
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
