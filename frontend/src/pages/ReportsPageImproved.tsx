import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
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
  Refresh as RefreshIcon,
  Download,
  Analytics,
  Business,
  People,
  Assignment,
  Visibility,
  Settings,
} from '@mui/icons-material';
import { 
  PageLayout,
  ActionButtons,
  StatusChip,
  SearchAndFilter 
} from '../components/common';

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

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  lastGenerated?: string;
  status: 'active' | 'inactive' | 'processing';
  formats: string[];
  estimatedTime: string;
}

interface GeneratedReport {
  id: string;
  name: string;
  generatedAt: string;
  format: string;
  size: string;
  status: 'completed' | 'failed' | 'processing';
  downloadUrl?: string;
}

const ReportsPageImproved: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generateDialog, setGenerateDialog] = useState<{
    open: boolean;
    report: ReportTemplate | null;
  }>({ open: false, report: null });
  const [reportSettings, setReportSettings] = useState({
    format: 'pdf',
    dateRange: 'last_month',
    includeCharts: true,
    includeDetails: true,
  });

  // Report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'workers-summary',
      name: 'تقرير العمال الشامل',
      description: 'تقرير شامل عن جميع العمال وحالاتهم',
      icon: <People />,
      category: 'workers',
      lastGenerated: '2024-01-15 10:30:00',
      status: 'active',
      formats: ['pdf', 'excel', 'csv'],
      estimatedTime: '2-3 دقائق'
    },
    {
      id: 'companies-report',
      name: 'تقرير الشركات',
      description: 'تقرير عن الشركات المسجلة ونشاطاتها',
      icon: <Business />,
      category: 'companies',
      lastGenerated: '2024-01-14 14:20:00',
      status: 'active',
      formats: ['pdf', 'excel'],
      estimatedTime: '1-2 دقيقة'
    },
    {
      id: 'financial-report',
      name: 'التقرير المالي',
      description: 'تقرير عن الرسوم والمستحقات المالية',
      icon: <MoneyIcon />,
      category: 'financial',
      lastGenerated: '2024-01-13 16:45:00',
      status: 'active',
      formats: ['pdf', 'excel'],
      estimatedTime: '3-4 دقائق'
    },
    {
      id: 'attendance-report',
      name: 'تقرير الحضور والغياب',
      description: 'تقرير شامل عن حضور وغياب العمال',
      icon: <AttendanceIcon />,
      category: 'attendance',
      lastGenerated: '2024-01-12 09:30:00',
      status: 'active',
      formats: ['pdf', 'excel', 'csv'],
      estimatedTime: '2-3 دقائق'
    },
    {
      id: 'licenses-expiry',
      name: 'تقرير انتهاء الرخص',
      description: 'تقرير عن الرخص المنتهية والتي ستنتهي قريباً',
      icon: <LicenseIcon />,
      category: 'licenses',
      lastGenerated: '2024-01-11 11:15:00',
      status: 'active',
      formats: ['pdf', 'excel'],
      estimatedTime: '1-2 دقيقة'
    },
    {
      id: 'violations-report',
      name: 'تقرير المخالفات',
      description: 'تقرير عن المخالفات والعقوبات',
      icon: <WarningIcon />,
      category: 'violations',
      lastGenerated: '2024-01-10 13:20:00',
      status: 'active',
      formats: ['pdf', 'excel'],
      estimatedTime: '2-3 دقائق'
    },
    {
      id: 'analytics-report',
      name: 'تقرير التحليلات',
      description: 'تقرير تحليلي شامل مع الرسوم البيانية',
      icon: <Analytics />,
      category: 'analytics',
      lastGenerated: '2024-01-09 15:45:00',
      status: 'active',
      formats: ['pdf'],
      estimatedTime: '5-7 دقائق'
    },
    {
      id: 'custom-report',
      name: 'تقرير مخصص',
      description: 'إنشاء تقرير مخصص حسب المعايير المحددة',
      icon: <Settings />,
      category: 'custom',
      status: 'inactive',
      formats: ['pdf', 'excel', 'csv'],
      estimatedTime: '3-5 دقائق'
    },
  ];

  // Generated reports (mock data)
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: '1',
      name: 'تقرير العمال الشامل - يناير 2024',
      generatedAt: '2024-01-15 10:30:00',
      format: 'PDF',
      size: '2.5 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '2',
      name: 'التقرير المالي - ديسمبر 2023',
      generatedAt: '2024-01-14 14:20:00',
      format: 'Excel',
      size: '1.8 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '3',
      name: 'تقرير الحضور والغياب - الأسبوع الماضي',
      generatedAt: '2024-01-13 16:45:00',
      format: 'PDF',
      size: '3.2 MB',
      status: 'processing',
    },
    {
      id: '4',
      name: 'تقرير انتهاء الرخص - يناير 2024',
      generatedAt: '2024-01-12 09:30:00',
      format: 'PDF',
      size: '0.9 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '5',
      name: 'تقرير المخالفات - الربع الأخير',
      generatedAt: '2024-01-11 11:15:00',
      format: 'Excel',
      size: '1.2 MB',
      status: 'failed',
    },
  ]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleGenerateReport = (report: ReportTemplate) => {
    setGenerateDialog({ open: true, report });
  };

  const handleConfirmGenerate = async () => {
    if (!generateDialog.report) return;

    setLoading(true);
    try {
      // TODO: Implement actual report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to generated reports
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        name: `${generateDialog.report.name} - ${new Date().toLocaleDateString('ar-SA')}`,
        generatedAt: new Date().toISOString(),
        format: reportSettings.format.toUpperCase(),
        size: '1.5 MB',
        status: 'completed',
        downloadUrl: '#'
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      setGenerateDialog({ open: false, report: null });
    } catch (error) {
      setError('فشل في إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (report: GeneratedReport) => {
    // TODO: Implement actual download
    console.log('Downloading report:', report.name);
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'failed': return 'error';
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'processing': return 'قيد المعالجة';
      case 'failed': return 'فشل';
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      default: return status;
    }
  };

  // Quick stats
  const stats = [
    { 
      label: 'قوالب التقارير', 
      value: reportTemplates.length, 
      color: 'primary' as const 
    },
    { 
      label: 'تقارير مولدة', 
      value: generatedReports.length, 
      color: 'info' as const 
    },
    { 
      label: 'تقارير مكتملة', 
      value: generatedReports.filter(r => r.status === 'completed').length, 
      color: 'success' as const 
    },
    { 
      label: 'قيد المعالجة', 
      value: generatedReports.filter(r => r.status === 'processing').length, 
      color: 'warning' as const 
    }
  ];

  return (
    <PageLayout
      title="التقارير المتقدمة"
      subtitle="إنشاء وإدارة التقارير التفصيلية"
      icon={<ReportIcon />}
      stats={stats}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            تحديث
          </Button>
          <Button
            variant="contained"
            startIcon={<ReportIcon />}
            onClick={() => handleGenerateReport(reportTemplates[0])}
          >
            إنشاء تقرير جديد
          </Button>
        </Box>
      }
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="report tabs">
          <Tab icon={<ReportIcon />} label="قوالب التقارير" />
          <Tab icon={<Assignment />} label="التقارير المولدة" />
          <Tab icon={<TrendIcon />} label="الإحصائيات" />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {reportTemplates.map((report) => (
            <Card key={report.id} sx={{ minWidth: 300, flex: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ color: 'primary.main' }}>
                    {report.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h3">
                      {report.name}
                    </Typography>
                    <StatusChip 
                      status={report.status}
                      color={getStatusColor(report.status)}
                      label={getStatusText(report.status)}
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {report.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    الصيغ المدعومة:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {report.formats.map((format) => (
                      <Chip 
                        key={format} 
                        label={format.toUpperCase()} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    الوقت المتوقع: {report.estimatedTime}
                  </Typography>
                </Box>
                
                {report.lastGenerated && (
                  <Typography variant="caption" color="text.secondary">
                    آخر إنشاء: {new Date(report.lastGenerated).toLocaleString('ar-SA')}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Download />}
                  onClick={() => handleGenerateReport(report)}
                  disabled={report.status === 'inactive'}
                >
                  إنشاء التقرير
                </Button>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  disabled={!report.lastGenerated}
                >
                  معاينة
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Box sx={{ mb: 3 }}>
          <SearchAndFilter
            searchPlaceholder="البحث في التقارير المولدة..."
            onSearch={() => {}}
            onFilter={() => {}}
            filterOptions={[
              { value: '', label: 'جميع الحالات' },
              { value: 'completed', label: 'مكتمل' },
              { value: 'processing', label: 'قيد المعالجة' },
              { value: 'failed', label: 'فشل' }
            ]}
            filterLabel="الحالة"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {generatedReports.map((report) => (
            <Card key={report.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h3">
                      {report.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      تم الإنشاء: {new Date(report.generatedAt).toLocaleString('ar-SA')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Chip label={report.format} size="small" />
                      <Chip label={report.size} size="small" variant="outlined" />
                      <StatusChip 
                        status={report.status}
                        color={getStatusColor(report.status)}
                        label={getStatusText(report.status)}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <ActionButtons
                      onView={() => handleDownload(report)}
                      showEdit={false}
                      showDelete={true}
                      showView={report.status === 'completed'}
                      viewTooltip="تحميل التقرير"
                      onDelete={() => {
                        setGeneratedReports(prev => prev.filter(r => r.id !== report.id));
                      }}
                      deleteTooltip="حذف التقرير"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Card sx={{ minWidth: 300, flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                إحصائيات التقارير
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="متوسط وقت الإنشاء"
                    secondary="3.2 دقيقة"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GroupIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="أكثر التقارير طلباً"
                    secondary="تقرير العمال الشامل"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ExcelIcon color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="الصيغة الأكثر استخداماً"
                    secondary="PDF (68%)"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 300, flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                التقارير الأخيرة
              </Typography>
              <List dense>
                {generatedReports.slice(0, 5).map((report) => (
                  <ListItem key={report.id}>
                    <ListItemIcon>
                      {report.format === 'PDF' ? <PdfIcon /> : <ExcelIcon />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={report.name}
                      secondary={new Date(report.generatedAt).toLocaleString('ar-SA')}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      {/* Generate Report Dialog */}
      <Dialog 
        open={generateDialog.open} 
        onClose={() => setGenerateDialog({ open: false, report: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          إنشاء تقرير: {generateDialog.report?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>صيغة التقرير</InputLabel>
              <Select
                value={reportSettings.format}
                label="صيغة التقرير"
                onChange={(e) => setReportSettings(prev => ({ ...prev, format: e.target.value }))}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>نطاق التاريخ</InputLabel>
              <Select
                value={reportSettings.dateRange}
                label="نطاق التاريخ"
                onChange={(e) => setReportSettings(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <MenuItem value="last_week">الأسبوع الماضي</MenuItem>
                <MenuItem value="last_month">الشهر الماضي</MenuItem>
                <MenuItem value="last_quarter">الربع الأخير</MenuItem>
                <MenuItem value="last_year">السنة الماضية</MenuItem>
                <MenuItem value="custom">مخصص</MenuItem>
              </Select>
            </FormControl>

            {reportSettings.dateRange === 'custom' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="من تاريخ"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="إلى تاريخ"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={reportSettings.includeCharts ? 'contained' : 'outlined'}
                onClick={() => setReportSettings(prev => ({ ...prev, includeCharts: !prev.includeCharts }))}
              >
                تضمين الرسوم البيانية
              </Button>
              <Button
                variant={reportSettings.includeDetails ? 'contained' : 'outlined'}
                onClick={() => setReportSettings(prev => ({ ...prev, includeDetails: !prev.includeDetails }))}
              >
                تضمين التفاصيل
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog({ open: false, report: null })}>
            إلغاء
          </Button>
          <Button onClick={handleConfirmGenerate} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'إنشاء التقرير'}
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </PageLayout>
  );
};

export default ReportsPageImproved;
