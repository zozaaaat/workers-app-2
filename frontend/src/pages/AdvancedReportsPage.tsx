import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  Assessment as ReportIcon,
  AttachMoney as MoneyIcon,
  Schedule as AttendanceIcon,
  VerifiedUser as LicenseIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TrendingUp as TrendIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { AdvancedReportsService } from '../services/AdvancedReportsService';
import type { 
  FinancialReportData, 
  AttendanceReportData, 
  LicenseExpiryReportData 
} from '../services/AdvancedReportsService';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

const AdvancedReportsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [payrollData, setPayrollData] = useState<FinancialReportData | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceReportData | null>(null);
  const [licenseData, setLicenseData] = useState<LicenseExpiryReportData | null>(null);

  // تحميل جميع البيانات عند تحميل الصفحة
  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setLoading(true);
    setError('');

    try {
      const [payroll, attendance, licenses] = await Promise.all([
        AdvancedReportsService.generatePayrollReport(),
        AdvancedReportsService.generateAttendanceReport(),
        AdvancedReportsService.generateLicenseExpiryReport()
      ]);

      setPayrollData(payroll);
      setAttendanceData(attendance);
      setLicenseData(licenses);
    } catch (err: any) {
      setError('فشل في تحميل التقارير: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshReports = async () => {
    setRefreshing(true);
    await loadAllReports();
    setRefreshing(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleExportExcel = async (reportType: string, data: any) => {
    try {
      await AdvancedReportsService.exportReportToExcel(reportType, data);
    } catch (err: any) {
      setError('فشل في تصدير Excel: ' + err.message);
    }
  };

  const handleExportPDF = async (reportType: string, data: any) => {
    try {
      await AdvancedReportsService.exportReportToPDF(reportType, data);
    } catch (err: any) {
      setError('فشل في تصدير PDF: ' + err.message);
    }
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ك`;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            جاري تحميل التقارير...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <ReportIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1">
                📊 التقارير المتقدمة
              </Typography>
              <Typography variant="body1" color="text.secondary">
                تقارير مالية وإدارية شاملة مع إمكانية التصدير
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshReports}
            disabled={loading || refreshing}
          >
            {refreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab 
              label="التقارير المالية" 
              icon={<MoneyIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="الحضور والغياب" 
              icon={<AttendanceIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="انتهاء التراخيص" 
              icon={<LicenseIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* تبويب التقارير المالية */}
        <TabPanel value={currentTab} index={0}>
          {payrollData && (
            <Box>
              <Typography variant="h5" gutterBottom>
                💰 تقرير الرواتب الشهري
              </Typography>
              
              {/* بطاقات الإحصائيات المالية */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <Card sx={{ minWidth: 200, flex: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <MoneyIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">إجمالي الرواتب</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(payrollData.totalSalaries)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      للعمال الـ {payrollData.workerCount}
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, flex: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <TrendIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6">المكافآت</Typography>
                    </Box>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(payrollData.totalBonuses)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      حوافز وعلاوات
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, flex: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <WarningIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6">الخصومات</Typography>
                    </Box>
                    <Typography variant="h4" color="error.main">
                      {formatCurrency(payrollData.totalDeductions)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      غرامات وخصومات
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, flex: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <GroupIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="h6">صافي الراتب</Typography>
                    </Box>
                    <Typography variant="h4" color="info.main">
                      {formatCurrency(payrollData.netPayroll)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      متوسط: {formatCurrency(payrollData.averageSalary)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* التفاصيل الشهرية */}
              <Typography variant="h6" gutterBottom>
                📈 التفاصيل الشهرية
              </Typography>
              <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                {payrollData.monthlyBreakdown.map((month, index) => (
                  <Chip 
                    key={index}
                    label={`${month.month}: ${formatCurrency(month.net)}`}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>

              {/* أزرار التصدير */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 تصدير التقرير المالي
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    تصدير تقرير الرواتب الشامل مع جميع التفاصيل والإحصائيات
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    startIcon={<ExcelIcon />}
                    onClick={() => handleExportExcel('payroll', payrollData)}
                    color="success"
                  >
                    تصدير Excel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PdfIcon />}
                    onClick={() => handleExportPDF('payroll', payrollData)}
                    color="error"
                  >
                    تصدير PDF
                  </Button>
                </CardActions>
              </Card>
            </Box>
          )}
        </TabPanel>

        {/* تبويب الحضور والغياب */}
        <TabPanel value={currentTab} index={1}>
          {attendanceData && (
            <Box>
              <Typography variant="h5" gutterBottom>
                📅 تقرير الحضور والغياب
              </Typography>

              {/* إحصائيات الحضور */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <Card sx={{ minWidth: 200, flex: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <AttendanceIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">معدل الحضور</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">
                      {attendanceData.attendanceRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      من إجمالي {attendanceData.totalWorkDays} يوم عمل
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, flex: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <WarningIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="h6">إجمالي الغيابات</Typography>
                    </Box>
                    <Typography variant="h4" color="warning.main">
                      {attendanceData.totalAbsences}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      يوم غياب
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* العمال المتكررون في الغياب */}
              {attendanceData.frequentAbsentees.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    ⚠️ العمال المتكررون في الغياب
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {attendanceData.frequentAbsentees.slice(0, 5).map((worker, index) => (
                      <Chip
                        key={index}
                        label={`${worker.workerName}: ${worker.absenceCount} غياب`}
                        color="warning"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* أسباب الغياب */}
              <Typography variant="h6" gutterBottom>
                📊 أسباب الغياب الشائعة
              </Typography>
              <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                {attendanceData.absencesByReason.map((reason, index) => (
                  <Chip
                    key={index}
                    label={`${reason.reason}: ${reason.count} (${reason.percentage.toFixed(1)}%)`}
                    variant="outlined"
                    color="info"
                  />
                ))}
              </Box>

              {/* أزرار التصدير */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 تصدير تقرير الحضور
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    تصدير تقرير الحضور والغياب مع تحليل الأنماط والاتجاهات
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    startIcon={<ExcelIcon />}
                    onClick={() => handleExportExcel('attendance', attendanceData)}
                    color="success"
                  >
                    تصدير Excel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PdfIcon />}
                    onClick={() => handleExportPDF('attendance', attendanceData)}
                    color="error"
                  >
                    تصدير PDF
                  </Button>
                </CardActions>
              </Card>
            </Box>
          )}
        </TabPanel>

        {/* تبويب انتهاء التراخيص */}
        <TabPanel value={currentTab} index={2}>
          {licenseData && (
            <Box>
              <Typography variant="h5" gutterBottom>
                🔒 تقرير انتهاء التراخيص
              </Typography>

              {/* إحصائيات التراخيص */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <Card sx={{ minWidth: 200, flex: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <WarningIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6">منتهية الصلاحية</Typography>
                    </Box>
                    <Typography variant="h4" color="error.main">
                      {licenseData.expired.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ترخيص منتهي
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, flex: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <WarningIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="h6">تنتهي خلال 30 يوم</Typography>
                    </Box>
                    <Typography variant="h4" color="warning.main">
                      {licenseData.expiringIn30Days.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ترخيص
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, flex: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <LicenseIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6">معدل التجديد</Typography>
                    </Box>
                    <Typography variant="h4" color="success.main">
                      {licenseData.renewalRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      من التراخيص
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* التراخيص الحرجة */}
              {licenseData.criticalLicenses.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    🚨 تراخيص تحتاج انتباه فوري
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {licenseData.criticalLicenses.slice(0, 5).map((license, index) => (
                      <Chip
                        key={index}
                        label={`${license.name}: ${license.license_number}`}
                        color="error"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* أزرار التصدير */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 تصدير تقرير التراخيص
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    تصدير تقرير التراخيص مع تنبيهات الانتهاء والتجديد
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    startIcon={<ExcelIcon />}
                    onClick={() => handleExportExcel('licenses', licenseData)}
                    color="success"
                  >
                    تصدير Excel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PdfIcon />}
                    onClick={() => handleExportPDF('licenses', licenseData)}
                    color="error"
                  >
                    تصدير PDF
                  </Button>
                </CardActions>
              </Card>
            </Box>
          )}
        </TabPanel>

        <Divider sx={{ my: 3 }} />

        {/* معلومات إضافية */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            ℹ️ معلومات التقارير المتقدمة
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ تحليل شامل للبيانات المالية والإدارية
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ تصدير احترافي بتنسيقات متعددة (Excel, PDF)
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ إحصائيات تفاعلية ومؤشرات أداء رئيسية
          </Typography>
          <Typography variant="body2">
            ✅ تحديث تلقائي للبيانات وتحليل الاتجاهات
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdvancedReportsPage;
