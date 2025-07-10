import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PeopleAlt as WorkersIcon,
  Business as CompanyIcon,
  Assignment as TaskIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  NotificationsActive as NotificationsIcon,
  Dashboard as DashboardIcon,
  AccessTime,
  Assignment,
  AccountCircle,
  Description,
  EventNote,
  Security,
  Analytics,
  Schedule,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { Pie, Line } from 'react-chartjs-2';
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
import { useAuth } from '../../context/AuthContext';
import { 
  PageLayout 
} from '../../components/common';

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

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const DashboardPageImproved: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API calls
      const mockStats: DashboardStats = {
        workers: 120,
        companies: 15,
        absences: 8,
        leaves: 12,
        upcomingExpirations: 5,
        workersThisMonth: 8,
        totalDocuments: 450,
        pendingApprovals: 3,
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(mockStats);
    } catch (err) {
      setError('فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick actions based on user role
  const quickActions: QuickAction[] = [
    {
      id: 'add-worker',
      title: 'إضافة عامل جديد',
      description: 'إضافة عامل جديد للنظام',
      icon: <AccountCircle />,
      color: '#1976d2',
      path: '/workers'
    },
    {
      id: 'add-company',
      title: 'إضافة شركة',
      description: 'تسجيل شركة جديدة',
      icon: <CompanyIcon />,
      color: '#388e3c',
      path: '/companies'
    },
    {
      id: 'manage-leaves',
      title: 'إدارة الإجازات',
      description: 'مراجعة طلبات الإجازات',
      icon: <EventNote />,
      color: '#f57c00',
      path: '/leaves'
    },
    {
      id: 'reports',
      title: 'التقارير',
      description: 'عرض التقارير والتحليلات',
      icon: <Analytics />,
      color: '#7b1fa2',
      path: '/advanced-reports'
    },
    {
      id: 'security',
      title: 'إعدادات الأمان',
      description: 'إدارة إعدادات الأمان',
      icon: <Security />,
      color: '#c62828',
      path: '/security'
    },
    {
      id: 'documents',
      title: 'الوثائق',
      description: 'إدارة الوثائق والملفات',
      icon: <Description />,
      color: '#455a64',
      path: '/workers'
    },
  ];

  // Recent activities
  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'worker_added',
      description: 'تم إضافة عامل جديد: أحمد محمد',
      timestamp: '2024-01-15 10:30:00',
      user: 'admin',
      icon: <AccountCircle />,
      color: '#1976d2'
    },
    {
      id: 2,
      type: 'leave_approved',
      description: 'تم الموافقة على إجازة محمد علي',
      timestamp: '2024-01-15 09:15:00',
      user: 'manager1',
      icon: <CheckCircle />,
      color: '#388e3c'
    },
    {
      id: 3,
      type: 'document_uploaded',
      description: 'تم رفع وثيقة جديدة للعامل سارة أحمد',
      timestamp: '2024-01-15 08:45:00',
      user: 'admin',
      icon: <Description />,
      color: '#f57c00'
    },
    {
      id: 4,
      type: 'license_expires',
      description: 'تحذير: رخصة العامل خالد محمد ستنتهي قريباً',
      timestamp: '2024-01-15 08:30:00',
      user: 'system',
      icon: <WarningIcon />,
      color: '#f44336'
    },
    {
      id: 5,
      type: 'company_updated',
      description: 'تم تحديث بيانات شركة الأمل للمقاولات',
      timestamp: '2024-01-15 07:20:00',
      user: 'admin',
      icon: <CompanyIcon />,
      color: '#9c27b0'
    },
  ];

  // Chart data
  const workersChartData = {
    labels: ['نشط', 'غير نشط', 'في إجازة', 'منتهي الترخيص'],
    datasets: [
      {
        data: [85, 15, 12, 8],
        backgroundColor: [
          '#4caf50',
          '#ff9800',
          '#2196f3',
          '#f44336',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const monthlyStatsData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'عمال جدد',
        data: [12, 19, 8, 15, 22, 18],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
      },
      {
        label: 'شركات جديدة',
        data: [2, 3, 1, 4, 2, 3],
        borderColor: '#388e3c',
        backgroundColor: 'rgba(56, 142, 60, 0.1)',
        fill: true,
      },
    ],
  };

  if (loading) {
    return (
      <PageLayout title="لوحة التحكم" icon={<DashboardIcon />}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="لوحة التحكم" icon={<DashboardIcon />}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshIcon />}>
          إعادة المحاولة
        </Button>
      </PageLayout>
    );
  }

  const mainStats = [
    { 
      label: 'إجمالي العمال', 
      value: stats?.workers || 0, 
      color: 'primary' as const,
      icon: <WorkersIcon />
    },
    { 
      label: 'الشركات', 
      value: stats?.companies || 0, 
      color: 'success' as const,
      icon: <CompanyIcon />
    },
    { 
      label: 'الغيابات', 
      value: stats?.absences || 0, 
      color: 'warning' as const,
      icon: <AccessTime />
    },
    { 
      label: 'الإجازات', 
      value: stats?.leaves || 0, 
      color: 'info' as const,
      icon: <EventNote />
    },
    { 
      label: 'انتهاء الصلاحية', 
      value: stats?.upcomingExpirations || 0, 
      color: 'error' as const,
      icon: <WarningIcon />
    },
    { 
      label: 'الموافقات المعلقة', 
      value: stats?.pendingApprovals || 0, 
      color: 'secondary' as const,
      icon: <Assignment />
    },
  ];

  return (
    <PageLayout
      title="لوحة التحكم"
      subtitle={`مرحباً ${user?.username || 'المستخدم'} - ${new Date().toLocaleDateString('ar-SA')}`}
      icon={<DashboardIcon />}
      stats={mainStats}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="تحديث البيانات">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<NotificationsIcon />}
            color="primary"
          >
            عرض الإشعارات
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 2, minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TaskIcon />
                  الإجراءات السريعة
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {quickActions.map((action) => (
                    <Paper
                      key={action.id}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${action.color}30`,
                        minWidth: 200,
                        flex: 1,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 20px ${action.color}20`,
                          border: `1px solid ${action.color}50`,
                        },
                      }}
                      onClick={() => window.location.href = action.path}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ color: action.color }}>
                          {action.icon}
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {action.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Activities */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule />
                  الأنشطة الأخيرة
                </Typography>
                <List dense>
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Box sx={{ color: activity.color }}>
                            {activity.icon}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.description}
                          secondary={`${activity.user} - ${new Date(activity.timestamp).toLocaleString('ar-SA')}`}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Charts */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  توزيع العمال
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <Pie data={workersChartData} options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  الإحصائيات الشهرية
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={monthlyStatsData} options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Alerts and Notifications */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info />
              التنبيهات والإشعارات
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {stats && stats.upcomingExpirations > 0 && (
                <Alert severity="warning" sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle2">
                    {stats.upcomingExpirations} من العمال لديهم رخص ستنتهي قريباً
                  </Typography>
                </Alert>
              )}
              {stats && stats.pendingApprovals > 0 && (
                <Alert severity="info" sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle2">
                    {stats.pendingApprovals} من الطلبات في انتظار الموافقة
                  </Typography>
                </Alert>
              )}
              {stats && stats.absences > 5 && (
                <Alert severity="error" sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle2">
                    عدد الغيابات اليوم أعلى من المعتاد ({stats.absences})
                  </Typography>
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageLayout>
  );
};

export default DashboardPageImproved;
