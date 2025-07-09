import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button
} from "@mui/material";
import {
  PeopleAlt as WorkersIcon,
  Business as CompanyIcon,
  Assignment as TaskIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import axios from "axios";
import { API_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { fetchNotifications } from "../api_notifications";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  workers: number;
  companies: number;
  absences: number;
  leaves: number;
  upcomingExpirations: number;
  workersThisMonth: number;
}

const DashboardPageSimplified: React.FC = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [chartsData, setChartsData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      console.log('Notifications loaded:', data.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
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
      setupChartsData(workersData, companiesData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const setupChartsData = (workersData: any[], _companiesData: any[]) => {
    const workerTypes = workersData.reduce((acc: any, worker: any) => {
      const type = worker.worker_type || 'غير محدد';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const workersChart = {
      labels: Object.keys(workerTypes),
      datasets: [{
        data: Object.values(workerTypes),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        borderWidth: 2
      }]
    };

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = date.toLocaleString(i18n.language, { month: 'long' });
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
        fill: true
      }]
    };

    setChartsData({ workersChart, monthlyTrend });
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
        <Alert severity="error">{error}</Alert>
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

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle 
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }) => (
    <Card sx={{ height: '100%', mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h3" component="div" color={color} fontWeight="bold">
              {value.toLocaleString()}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 60, color: color, opacity: 0.3 }} />
        </Box>
      </CardContent>
    </Card>
  );

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Box p={3}>
      {/* العنوان الرئيسي */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          🏢 لوحة التحكم المبسطة
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          مرحباً {user?.username}، إليك نظرة عامة على النظام
        </Typography>
      </Box>

      {/* بطاقات الإحصائيات */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3} mb={4}>
        <StatCard
          title="إجمالي العمال"
          value={stats.workers}
          icon={WorkersIcon}
          color="#1976d2"
          subtitle={`${stats.workersThisMonth} عامل جديد هذا الشهر`}
        />
        <StatCard
          title="الشركات المسجلة"
          value={stats.companies}
          icon={CompanyIcon}
          color="#2e7d32"
        />
        <StatCard
          title="الإجازات المطلوبة"
          value={stats.leaves}
          icon={TaskIcon}
          color="#ed6c02"
        />
        <StatCard
          title="انتهاء التراخيص قريباً"
          value={stats.upcomingExpirations}
          icon={WarningIcon}
          color="#d32f2f"
          subtitle="خلال 30 يوم"
        />
      </Box>

      {/* تنبيه إذا كان هناك تراخيص ستنتهي */}
      {stats.upcomingExpirations > 0 && (
        <Box mb={3}>
          <Alert 
            severity="warning" 
            action={
              <Button color="inherit" size="small" href="/workers">
                عرض التفاصيل
              </Button>
            }
          >
            <strong>تنبيه:</strong> يوجد {stats.upcomingExpirations} عامل ستنتهي تراخيصهم خلال الشهر القادم
          </Alert>
        </Box>
      )}

      {/* الرسوم البيانية */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={3} mb={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 توزيع العمال حسب النوع
            </Typography>
            <Box height={300}>
              {chartsData?.workersChart && (
                <Pie data={chartsData.workersChart} options={chartOptions} />
              )}
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📈 اتجاه التوظيف (آخر 6 أشهر)
            </Typography>
            <Box height={300}>
              {chartsData?.monthlyTrend && (
                <Line data={chartsData.monthlyTrend} options={chartOptions} />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* إجراءات سريعة */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ⚡ إجراءات سريعة
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<WorkersIcon />}
              component="a"
              href="/workers"
              sx={{ py: 2 }}
            >
              إدارة العمال
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CompanyIcon />}
              component="a"
              href="/companies"
              sx={{ py: 2 }}
            >
              إدارة الشركات
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<TaskIcon />}
              component="a"
              href="/company-documents"
              sx={{ py: 2 }}
            >
              المستندات
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<TrendingUpIcon />}
              component="a"
              href="/analytics"
              sx={{ py: 2 }}
            >
              التقارير والتحليلات
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPageSimplified;
