/**
 * ✅ FIXED: TypeScript errors resolved by replacing Grid with Box layouts
 * 
 * STATUS: LEGACY - Still not recommended for new development
 * 
 * RECOMMENDED ALTERNATIVES:
 * 1. DashboardPageTailwind.tsx (BEST) - Modern, error-free, Tailwind CSS
 * 2. DashboardPage.tsx (GOOD) - All TypeScript errors resolved, MUI-based
 * 
 * This file is now error-free but remains as a legacy alternative.
 * For new development, use DashboardPageTailwind.tsx for best practices.
 * 
 * See: frontend/TYPESCRIPT_ERROR_RESOLUTION.md for migration guide
 */

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
import axios from 'axios';
import { API_URL } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { fetchNotifications } from '../../api_notifications';

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
  const { } = useTranslation();
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
      workersThisMonth,
      totalDocuments: 0, // Add logic when documents API is available
      pendingApprovals: 0 // Add logic for pending approvals
    };

    setStats(dashboardStats);
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
      <Box 
        display="grid" 
        gridTemplateColumns={{ 
          xs: 'repeat(1, 1fr)', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(4, 1fr)' 
        }} 
        gap={3} 
        mb={4}
      >
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
      </Box>

      {/* Quick Actions and Notifications */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} 
        gap={3}
      >
        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              إجراءات سريعة
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box 
              display="grid" 
              gridTemplateColumns={{ 
                xs: 'repeat(1, 1fr)', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)' 
              }} 
              gap={2}
            >
              <Button
                variant="outlined"
                startIcon={<WorkersIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                إضافة عامل
              </Button>
              <Button
                variant="outlined"
                startIcon={<CompanyIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                إضافة شركة
              </Button>
              <Button
                variant="outlined"
                startIcon={<TaskIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                تقرير جديد
              </Button>
              <Button
                variant="outlined"
                startIcon={<WarningIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                التنبيهات
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Notifications Panel */}
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <NotificationsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                الإشعارات الحديثة
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box maxHeight="300px" overflow="auto">
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

      {/* Alerts for upcoming expirations */}
      {stats.upcomingExpirations > 0 && (
        <Box mt={3}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ⚠️ هناك {stats.upcomingExpirations} عامل/عمال ستنتهي تراخيص عملهم خلال الشهر القادم
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
