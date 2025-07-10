import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Stack,
  Divider,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment as ReportIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  MonetizationOn as MoneyIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface ReportData {
  id: string;
  title: string;
  type: string;
  period: string;
  generated_at: string;
  data: any;
  summary?: {
    total: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdvancedReportsPageImproved: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sample data for charts
  const attendanceData = [
    { month: 'يناير', attendance: 95, target: 98 },
    { month: 'فبراير', attendance: 97, target: 98 },
    { month: 'مارس', attendance: 93, target: 98 },
    { month: 'أبريل', attendance: 96, target: 98 },
    { month: 'مايو', attendance: 98, target: 98 },
    { month: 'يونيو', attendance: 94, target: 98 }
  ];

  const performanceData = [
    { department: 'المبيعات', performance: 92, employees: 25 },
    { department: 'التسويق', performance: 88, employees: 15 },
    { department: 'الموارد البشرية', performance: 95, employees: 8 },
    { department: 'التقنية', performance: 90, employees: 20 },
    { department: 'المالية', performance: 94, employees: 12 }
  ];

  const financialData = [
    { month: 'يناير', salaries: 245000, bonuses: 25000, training: 15000 },
    { month: 'فبراير', salaries: 248000, bonuses: 30000, training: 12000 },
    { month: 'مارس', salaries: 252000, bonuses: 28000, training: 18000 },
    { month: 'أبريل', salaries: 255000, bonuses: 35000, training: 20000 },
    { month: 'مايو', salaries: 258000, bonuses: 32000, training: 16000 },
    { month: 'يونيو', salaries: 260000, bonuses: 38000, training: 22000 }
  ];

  const trainingData = [
    { name: 'التقنية', value: 35, color: '#8884d8' },
    { name: 'السلامة', value: 25, color: '#82ca9d' },
    { name: 'الإدارة', value: 20, color: '#ffc658' },
    { name: 'المهارات الناعمة', value: 15, color: '#ff7300' },
    { name: 'أخرى', value: 5, color: '#00ff7f' }
  ];

  const leaveData = [
    { type: 'إجازة سنوية', count: 45, approved: 42, pending: 3 },
    { type: 'إجازة مرضية', count: 23, approved: 20, pending: 3 },
    { type: 'إجازة طوارئ', count: 12, approved: 10, pending: 2 },
    { type: 'إجازة أمومة', count: 8, approved: 8, pending: 0 },
    { type: 'إجازة بدون راتب', count: 5, approved: 3, pending: 2 }
  ];

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod, selectedDepartment]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockReports: ReportData[] = [
        {
          id: '1',
          title: 'تقرير الحضور والغياب',
          type: 'attendance',
          period: selectedPeriod,
          generated_at: new Date().toISOString(),
          data: attendanceData,
          summary: {
            total: 96,
            growth: 2.1,
            trend: 'up'
          }
        },
        {
          id: '2',
          title: 'تقرير الأداء',
          type: 'performance',
          period: selectedPeriod,
          generated_at: new Date().toISOString(),
          data: performanceData,
          summary: {
            total: 92,
            growth: 1.5,
            trend: 'up'
          }
        },
        {
          id: '3',
          title: 'التقرير المالي',
          type: 'financial',
          period: selectedPeriod,
          generated_at: new Date().toISOString(),
          data: financialData,
          summary: {
            total: 1850000,
            growth: 5.2,
            trend: 'up'
          }
        }
      ];
      setReports(mockReports);
    } catch (error) {
      setError('خطأ في تحميل التقارير');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`تم إنشاء تقرير ${reportType} بنجاح`);
      fetchReports();
    } catch (error) {
      setError('خطأ في إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (reportId: string, format: 'pdf' | 'excel') => {
    alert(`تم تصدير التقرير بصيغة ${format.toUpperCase()}`);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        📊 التقارير المتقدمة والتحليلات
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Report Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>إعدادات التقارير</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>الفترة الزمنية</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="الفترة الزمنية"
            >
              <MenuItem value="daily">يومي</MenuItem>
              <MenuItem value="weekly">أسبوعي</MenuItem>
              <MenuItem value="monthly">شهري</MenuItem>
              <MenuItem value="quarterly">ربع سنوي</MenuItem>
              <MenuItem value="yearly">سنوي</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>القسم</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              label="القسم"
            >
              <MenuItem value="">جميع الأقسام</MenuItem>
              <MenuItem value="sales">المبيعات</MenuItem>
              <MenuItem value="marketing">التسويق</MenuItem>
              <MenuItem value="hr">الموارد البشرية</MenuItem>
              <MenuItem value="it">التقنية</MenuItem>
              <MenuItem value="finance">المالية</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<ReportIcon />}
            onClick={() => generateReport('comprehensive')}
            disabled={loading}
          >
            إنشاء تقرير شامل
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="الحضور والغياب" icon={<CalendarIcon />} />
          <Tab label="الأداء" icon={<TrendingIcon />} />
          <Tab label="التقارير المالية" icon={<MoneyIcon />} />
          <Tab label="التدريب" icon={<PieChartIcon />} />
          <Tab label="الإجازات" icon={<PeopleIcon />} />
        </Tabs>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <TabPanel value={tabValue} index={0}>
        {/* Attendance Reports */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  اتجاه الحضور الشهري
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[90, 100]} />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="الحضور الفعلي"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#82ca9d" 
                      strokeDasharray="5 5"
                      name="الهدف"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ملخص الحضور
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      96%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      معدل الحضور العام
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="h6" color="success.main">
                      +2.1%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      تحسن عن الشهر الماضي
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportReport('attendance', 'excel')}
                    fullWidth
                  >
                    تصدير Excel
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Performance Reports */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  أداء الأقسام
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis domain={[80, 100]} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="performance" fill="#8884d8" name="الأداء %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  إحصائيات الأداء
                </Typography>
                <Stack spacing={2}>
                  {performanceData.map((dept, index) => (
                    <Box key={index}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{dept.department}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {dept.performance}%
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={dept.performance} 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Financial Reports */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  التكاليف الشهرية
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => `${formatNumber(Number(value))} ريال`} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="salaries" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8"
                      name="الرواتب"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bonuses" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d"
                      name="المكافآت"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="training" 
                      stackId="1"
                      stroke="#ffc658" 
                      fill="#ffc658"
                      name="التدريب"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  الملخص المالي
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h5" color="primary">
                      {formatNumber(1850000)} ريال
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي التكاليف
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="h6" color="success.main">
                      +5.2%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      نمو عن العام الماضي
                    </Typography>
                  </Box>
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => exportReport('financial', 'pdf')}
                      fullWidth
                    >
                      تصدير PDF
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      fullWidth
                    >
                      طباعة
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Training Reports */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  توزيع أنواع التدريب
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <PieChart data={trainingData} width={400} height={400}>
                      <Pie
                        data={trainingData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {trainingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  إحصائيات التدريب
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      125
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      دورة تدريبية مكتملة
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      92%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      معدل إكمال الدورات
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="info.main">
                      4.6/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      متوسط تقييم التدريب
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {/* Leave Reports */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              تقرير الإجازات
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>نوع الإجازة</TableCell>
                    <TableCell align="center">العدد الكلي</TableCell>
                    <TableCell align="center">موافق عليها</TableCell>
                    <TableCell align="center">قيد المراجعة</TableCell>
                    <TableCell align="center">معدل الموافقة</TableCell>
                    <TableCell align="center">الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveData.map((leave, index) => (
                    <TableRow key={index}>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell align="center">{leave.count}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={leave.approved} 
                          color="success" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={leave.pending} 
                          color="warning" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {Math.round((leave.approved / leave.count) * 100)}%
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="عرض التفاصيل">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تصدير">
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default AdvancedReportsPageImproved;
