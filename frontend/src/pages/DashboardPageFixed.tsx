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
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Assignment as DocumentIcon
} from "@mui/icons-material";
import { Pie, Bar, Line } from 'react-chartjs-2';
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
  recentDocuments: number;
  pendingApprovals: number;
  workersThisMonth: number;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

const DashboardPageFixed: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [chartsData, setChartsData] = useState<{
    workersChart: ChartData;
    companiesChart: ChartData;
    monthlyTrend: ChartData;
  } | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [workers, companies, absences, leaves] = await Promise.all([
        axios.get(`${API_URL}/workers`),
        axios.get(`${API_URL}/companies`),
        axios.get(`${API_URL}/absences`),
        axios.get(`${API_URL}/leaves`)
      ]);

      // حساب الإحصائيات المتقدمة
      const workersData = workers.data;
      const companiesData = companies.data;
      const currentDate = new Date();
      const oneMonthLater = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // العمال الذين ستنتهي تراخيصهم قريباً
      const upcomingExpirations = workersData.filter((worker: any) => {
        if (!worker.work_permit_end) return false;
        const expiryDate = new Date(worker.work_permit_end);
        return expiryDate <= oneMonthLater && expiryDate >= currentDate;
      }).length;

      const dashboardStats: DashboardStats = {
        workers: workersData.length,
        companies: companiesData.length,
        absences: absences.data.length,
        leaves: leaves.data.length,
        upcomingExpirations,
        recentDocuments: 0,
        pendingApprovals: 0,
        workersThisMonth: workersData.filter((worker: any) => {
          if (!worker.hire_date) return false;
          const hireDate = new Date(worker.hire_date);
          return hireDate.getMonth() === currentDate.getMonth() && 
                 hireDate.getFullYear() === currentDate.getFullYear();
        }).length
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

  const setupChartsData = (workersData: any[], companiesData: any[]) => {
    // رسم بياني للعمال حسب النوع
    const workerTypes = workersData.reduce((acc: any, worker: any) => {
      const type = worker.worker_type || 'غير محدد';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const workersChart: ChartData = {
      labels: Object.keys(workerTypes),
      datasets: [{
        data: Object.values(workerTypes),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 2
      }]
    };

    // رسم بياني للشركات حسب الحالة
    const companyStats = companiesData.reduce((acc: any, company: any) => {
      const status = company.file_status || 'غير محدد';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const companiesChart: ChartData = {
      labels: Object.keys(companyStats),
      datasets: [{
        label: 'عدد الشركات',
        data: Object.values(companyStats),
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1
      }]
    };

    // اتجاه التوظيف الشهري (آخر 6 أشهر)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = date.toLocaleString('ar', { month: 'long' });
      const monthNumber = date.getMonth();
      const year = date.getFullYear();
      
      const count = workersData.filter((worker: any) => {
        if (!worker.hire_date) return false;
        const hireDate = new Date(worker.hire_date);
        return hireDate.getMonth() === monthNumber && hireDate.getFullYear() === year;
      }).length;

      return { month, count };
    });

    const monthlyTrend: ChartData = {
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

    setChartsData({
      workersChart,
      companiesChart,
      monthlyTrend
    });
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

  // بطاقة إحصائية مبسطة
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
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15, ${color}05)` }}>
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
      title: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Box p={3}>
      {/* العنوان الرئيسي */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          🏢 لوحة التحكم الرئيسية
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          مرحباً {user?.username}، إليك نظرة عامة على النظام
        </Typography>
      </Box>

      {/* بطاقات الإحصائيات */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" 
        gap={3} 
        mb={4}
      >
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
          icon={ScheduleIcon}
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
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))" 
        gap={3} 
        mb={4}
      >
        {/* توزيع العمال */}
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

        {/* حالة الشركات */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏢 حالة الشركات
            </Typography>
            <Box height={300}>
              {chartsData?.companiesChart && (
                <Bar data={chartsData.companiesChart} options={chartOptions} />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* اتجاه التوظيف */}
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
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
            gap={2}
          >
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
              startIcon={<DocumentIcon />}
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

export default DashboardPageFixed;
