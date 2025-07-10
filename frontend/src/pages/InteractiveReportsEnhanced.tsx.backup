import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
  Button,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import {
  Assessment as ReportIcon,
  TrendingUp as TrendIcon,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useApi } from '../services/ApiService';
import { ExportService } from '../services/ExportService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InteractiveReportsEnhanced: React.FC = () => {
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [data, setData] = useState<{
    companies: any[];
    absences: any[];
    licenses: any[];
    notifications: any[];
  }>({
    companies: [],
    absences: [],
    licenses: [],
    notifications: []
  });

  const api = useApi();

  // ألوان للمخططات
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [companiesData, absencesData, licensesData, notificationsData] = await Promise.all([
          api.companies.getAll(),
          api.absences.getAll(),
          api.licenses.getAll(),
          api.notifications.getAll()
        ]);

        setData({
          companies: companiesData || [],
          absences: absencesData || [],
          licenses: licensesData || [],
          notifications: notificationsData || []
        });

        setStatus('✅ تم تحميل البيانات بنجاح!');
      } catch (error) {
        setStatus(`❌ خطأ في تحميل البيانات: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // إعداد بيانات المخططات
  const getAbsencesChartData = () => {
    const absencesByMonth = data.absences.reduce((acc, absence) => {
      const month = new Date(absence.date).toLocaleString('ar', { month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(absencesByMonth).map(([month, count]) => ({
      month,
      count
    }));
  };

  const getLicenseTypeData = () => {
    const licenseTypes = data.licenses.reduce((acc, license) => {
      const type = license.license_type || 'غير محدد';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(licenseTypes).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const getNotificationTrendData = () => {
    const notificationsByDate = data.notifications.reduce((acc, notification) => {
      const date = new Date(notification.created_at).toLocaleDateString('ar');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(notificationsByDate)
      .slice(-10) // آخر 10 أيام
      .map(([date, count]) => ({
        date,
        count
      }));
  };

  // تصدير التقرير
  const exportReport = (format: 'excel' | 'pdf') => {
    const reportData = [
      {
        category: 'الشركات',
        total: data.companies.length,
        active: data.companies.filter(c => c.file_status === 'فعال').length
      },
      {
        category: 'الغيابات',
        total: data.absences.length,
        excused: data.absences.filter(a => a.is_excused).length
      },
      {
        category: 'الرخص',
        total: data.licenses.length,
        active: data.licenses.filter(l => l.status === 'فعال').length
      },
      {
        category: 'الإشعارات',
        total: data.notifications.length,
        unread: data.notifications.filter(n => !n.read).length
      }
    ];

    const columns = [
      { key: 'category', label: 'الفئة' },
      { key: 'total', label: 'المجموع' },
      { key: 'active', label: 'النشط' },
      { key: 'excused', label: 'المعذور' },
      { key: 'unread', label: 'غير مقروء' }
    ];

    try {
      if (format === 'excel') {
        ExportService.exportToExcel(reportData, columns, {
          format: 'excel',
          filename: `interactive_report_${new Date().toISOString().split('T')[0]}.xlsx`,
          title: 'تقرير تفاعلي شامل',
          includeDate: true,
          includeStats: true
        });
      } else {
        ExportService.exportToPDF(reportData, columns, {
          format: 'pdf',
          filename: `interactive_report_${new Date().toISOString().split('T')[0]}.pdf`,
          title: 'تقرير تفاعلي شامل',
          includeDate: true,
          includeStats: true
        });
      }
      setStatus(`✅ تم تصدير التقرير إلى ${format.toUpperCase()} بنجاح!`);
    } catch (error) {
      setStatus(`❌ خطأ في تصدير التقرير: ${error}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📊 التقارير التفاعلية المحسنة
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          تقارير تفاعلية شاملة مع مخططات بيانية ومؤشرات أداء
        </Typography>

        {status && (
          <Alert 
            severity={status.includes('❌') ? 'error' : 'success'} 
            sx={{ mb: 3 }}
            onClose={() => setStatus('')}
          >
            {status}
          </Alert>
        )}

        {/* إحصائيات عامة */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏢 الشركات
              </Typography>
              <Typography variant="h4" color="primary">
                {data.companies.length}
              </Typography>
              <Chip label={`${data.companies.filter(c => c.file_status === 'فعال').length} فعال`} size="small" color="success" />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⏰ الغيابات
              </Typography>
              <Typography variant="h4" color="warning.main">
                {data.absences.length}
              </Typography>
              <Chip label={`${data.absences.filter(a => a.is_excused).length} معذور`} size="small" color="info" />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📜 الرخص
              </Typography>
              <Typography variant="h4" color="info.main">
                {data.licenses.length}
              </Typography>
              <Chip label={`${data.licenses.filter(l => l.status === 'فعال').length} فعال`} size="small" color="success" />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔔 الإشعارات
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {data.notifications.length}
              </Typography>
              <Chip label={`${data.notifications.filter(n => !n.read).length} جديد`} size="small" color="error" />
            </CardContent>
          </Card>
        </div>

        {/* أزرار التصدير */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={() => exportReport('excel')}
          >
            تصدير التقرير Excel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DownloadIcon />}
            onClick={() => exportReport('pdf')}
          >
            تصدير التقرير PDF
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="الغيابات" icon={<BarIcon />} />
            <Tab label="أنواع الرخص" icon={<PieIcon />} />
            <Tab label="اتجاه الإشعارات" icon={<TrendIcon />} />
          </Tabs>
        </Box>

        {/* تبويب مخطط الغيابات */}
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 الغيابات حسب الشهر
              </Typography>
              
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getAbsencesChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="عدد الغيابات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* تبويب مخطط دائري للرخص */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🥧 توزيع أنواع الرخص
              </Typography>
              
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={getLicenseTypeData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getLicenseTypeData().map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* تبويب اتجاه الإشعارات */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 اتجاه الإشعارات (آخر 10 أيام)
              </Typography>
              
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getNotificationTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} name="عدد الإشعارات" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default InteractiveReportsEnhanced;
