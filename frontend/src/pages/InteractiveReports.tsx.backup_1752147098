import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Description as LicenseIcon,
  Assessment as ReportIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
import { useApi } from '../services/ApiService';

interface ReportData {
  workers: any[];
  companies: any[];
  licenses: any[];
  absences: any[];
  leaves: any[];
  violations: any[];
  deductions: any[];
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

const InteractiveReports: React.FC = () => {
  const api = useApi();
  const [reportData, setReportData] = useState<ReportData>({
    workers: [],
    companies: [],
    licenses: [],
    absences: [],
    leaves: [],
    violations: [],
    deductions: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');

  // جلب البيانات
  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [workers, companies, licenses] = await Promise.all([
        api.workers.getAll(),
        api.companies.getAll(),
        api.licenses.getAll()
      ]);

      setReportData({
        workers,
        companies,
        licenses,
        absences: [], // سنضيف هذه لاحقاً
        leaves: [],
        violations: [],
        deductions: []
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ألوان المخططات
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  // إحصائيات عامة
  const generalStats = {
    totalWorkers: reportData.workers.length,
    totalCompanies: reportData.companies.length,
    totalLicenses: reportData.licenses.length,
    averageWorkersPerCompany: reportData.companies.length > 0 
      ? Math.round(reportData.workers.length / reportData.companies.length) 
      : 0
  };

  // بيانات العمال حسب الجنسية
  const workersByNationality = reportData.workers.reduce((acc: any, worker: any) => {
    const nationality = worker.nationality || 'غير محدد';
    acc[nationality] = (acc[nationality] || 0) + 1;
    return acc;
  }, {});

  const nationalityChartData: ChartData[] = Object.entries(workersByNationality).map(([name, value]) => ({
    name,
    value: value as number
  }));

  // بيانات العمال حسب نوع العامل
  const workersByType = reportData.workers.reduce((acc: any, worker: any) => {
    const type = worker.worker_type || 'غير محدد';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const workerTypeChartData: ChartData[] = Object.entries(workersByType).map(([name, value]) => ({
    name,
    value: value as number
  }));

  // بيانات الشركات حسب التصنيف
  const companiesByClassification = reportData.companies.reduce((acc: any, company: any) => {
    const classification = company.file_classification || 'غير محدد';
    acc[classification] = (acc[classification] || 0) + 1;
    return acc;
  }, {});

  const classificationChartData: ChartData[] = Object.entries(companiesByClassification).map(([name, value]) => ({
    name,
    value: value as number
  }));

  // بيانات العمال حسب الشركة (أفضل 10 شركات)
  const workersByCompany = reportData.companies.map((company: any) => ({
    name: company.file_name?.substring(0, 20) + (company.file_name?.length > 20 ? '...' : ''),
    workers: company.total_workers || 0,
    licenses: company.total_licenses || 0
  })).sort((a, b) => b.workers - a.workers).slice(0, 10);

  // بيانات التراخيص حسب النوع
  const licensesByType = reportData.licenses.reduce((acc: any, license: any) => {
    const type = license.license_type || 'غير محدد';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const licenseTypeChartData: ChartData[] = Object.entries(licensesByType).map(([name, value]) => ({
    name,
    value: value as number
  }));

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          تحليل البيانات والتقارير
        </Typography>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>جاري تحميل البيانات...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* عنوان الصفحة */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportIcon />
          <Typography variant="h4">
            تحليل البيانات والتقارير
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>الفترة الزمنية</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="الفترة الزمنية"
            >
              <MenuItem value="all">جميع البيانات</MenuItem>
              <MenuItem value="year">هذا العام</MenuItem>
              <MenuItem value="month">هذا الشهر</MenuItem>
              <MenuItem value="week">هذا الأسبوع</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>الشركة</InputLabel>
            <Select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              label="الشركة"
            >
              <MenuItem value="all">جميع الشركات</MenuItem>
              {reportData.companies.map((company: any) => (
                <MenuItem key={company.id} value={company.id.toString()}>
                  {company.file_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={() => {/* سنضيف تصدير التقارير لاحقاً */}}
          >
            تصدير التقرير
          </Button>
        </Box>
      </Box>

      {/* الإحصائيات العامة */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 3, 
        mb: 4 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي العمال
                </Typography>
                <Typography variant="h4">
                  {generalStats.totalWorkers.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BusinessIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي الشركات
                </Typography>
                <Typography variant="h4">
                  {generalStats.totalCompanies.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LicenseIcon sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي التراخيص
                </Typography>
                <Typography variant="h4">
                  {generalStats.totalLicenses.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  متوسط العمال/شركة
                </Typography>
                <Typography variant="h4">
                  {generalStats.averageWorkersPerCompany}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* المخططات */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: 3,
        mb: 3
      }}>
        {/* مخطط العمال حسب الجنسية */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              توزيع العمال حسب الجنسية
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={nationalityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {nationalityChartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* مخطط العمال حسب النوع */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              توزيع العمال حسب النوع
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workerTypeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* مخطط الشركات حسب التصنيف */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              توزيع الشركات حسب التصنيف
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classificationChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* مخطط التراخيص حسب النوع */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              توزيع التراخيص حسب النوع
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={licenseTypeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#ffc658"
                  dataKey="value"
                >
                  {licenseTypeChartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* أفضل الشركات حسب عدد العمال */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            أفضل 10 شركات حسب عدد العمال
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={workersByCompany} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="workers" fill="#8884d8" name="عدد العمال" />
              <Bar dataKey="licenses" fill="#82ca9d" name="عدد التراخيص" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* إحصائيات تفصيلية */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          ملخص تفصيلي
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 2
        }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              إحصائيات العمال:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {Object.entries(workersByNationality).map(([nationality, count]) => (
                <Chip 
                  key={nationality}
                  label={`${nationality}: ${count}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              إحصائيات الشركات:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {Object.entries(companiesByClassification).map(([classification, count]) => (
                <Chip 
                  key={classification}
                  label={`${classification}: ${count}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default InteractiveReports;
