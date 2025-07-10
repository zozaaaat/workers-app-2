import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import {
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckIcon,
  DataUsage as DataIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { ExportService } from '../services/ExportService';
import { useApi } from '../services/ApiService';

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
      id={`export-tabpanel-${index}`}
      aria-labelledby={`export-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const RealDataExportPage: React.FC = () => {
  const [exportStatus, setExportStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
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

  // تحميل البيانات الحقيقية من APIs
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

        setExportStatus('✅ تم تحميل البيانات الحقيقية بنجاح!');
      } catch (error) {
        setExportStatus(`❌ خطأ في تحميل البيانات: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // تصدير بيانات الشركات
  const exportCompanies = (format: 'excel' | 'pdf') => {
    if (data.companies.length === 0) {
      setExportStatus('❌ لا توجد بيانات شركات للتصدير');
      return;
    }

    const columns = [
      { key: 'id', label: 'الرقم' },
      { key: 'file_name', label: 'اسم الشركة' },
      { key: 'file_status', label: 'الحالة' },
      { key: 'total_workers', label: 'عدد العمال' },
      { key: 'total_licenses', label: 'عدد الرخص' },
      { key: 'creation_date', label: 'تاريخ الإنشاء' }
    ];

    try {
      if (format === 'excel') {
        ExportService.exportToExcel(data.companies, columns, {
          format: 'excel',
          filename: `companies_${new Date().toISOString().split('T')[0]}.xlsx`,
          title: 'بيانات الشركات',
          includeDate: true,
          includeStats: true
        });
      } else {
        ExportService.exportToPDF(data.companies, columns, {
          format: 'pdf',
          filename: `companies_${new Date().toISOString().split('T')[0]}.pdf`,
          title: 'بيانات الشركات',
          includeDate: true,
          includeStats: true
        });
      }
      setExportStatus(`✅ تم تصدير بيانات الشركات إلى ${format.toUpperCase()} بنجاح!`);
    } catch (error) {
      setExportStatus(`❌ خطأ في تصدير ${format.toUpperCase()}: ${error}`);
    }
  };

  // تصدير بيانات الغيابات
  const exportAbsences = (format: 'excel' | 'pdf') => {
    if (data.absences.length === 0) {
      setExportStatus('❌ لا توجد بيانات غيابات للتصدير');
      return;
    }

    const columns = [
      { key: 'id', label: 'الرقم' },
      { key: 'worker_id', label: 'رقم العامل' },
      { key: 'date', label: 'تاريخ الغياب' },
      { key: 'reason', label: 'السبب' },
      { key: 'is_excused', label: 'معذور', format: (value: boolean) => value ? 'نعم' : 'لا' }
    ];

    try {
      if (format === 'excel') {
        ExportService.exportToExcel(data.absences, columns, {
          format: 'excel',
          filename: `absences_${new Date().toISOString().split('T')[0]}.xlsx`,
          title: 'بيانات الغيابات',
          includeDate: true,
          includeStats: true
        });
      } else {
        ExportService.exportToPDF(data.absences, columns, {
          format: 'pdf',
          filename: `absences_${new Date().toISOString().split('T')[0]}.pdf`,
          title: 'بيانات الغيابات',
          includeDate: true,
          includeStats: true
        });
      }
      setExportStatus(`✅ تم تصدير بيانات الغيابات إلى ${format.toUpperCase()} بنجاح!`);
    } catch (error) {
      setExportStatus(`❌ خطأ في تصدير ${format.toUpperCase()}: ${error}`);
    }
  };

  // تصدير بيانات الرخص
  const exportLicenses = (format: 'excel' | 'pdf') => {
    if (data.licenses.length === 0) {
      setExportStatus('❌ لا توجد بيانات رخص للتصدير');
      return;
    }

    const columns = [
      { key: 'id', label: 'الرقم' },
      { key: 'name', label: 'اسم الرخصة' },
      { key: 'license_type', label: 'نوع الرخصة' },
      { key: 'status', label: 'الحالة' },
      { key: 'civil_id', label: 'الرقم المدني' }
    ];

    try {
      if (format === 'excel') {
        ExportService.exportToExcel(data.licenses, columns, {
          format: 'excel',
          filename: `licenses_${new Date().toISOString().split('T')[0]}.xlsx`,
          title: 'بيانات الرخص',
          includeDate: true,
          includeStats: true
        });
      } else {
        ExportService.exportToPDF(data.licenses, columns, {
          format: 'pdf',
          filename: `licenses_${new Date().toISOString().split('T')[0]}.pdf`,
          title: 'بيانات الرخص',
          includeDate: true,
          includeStats: true
        });
      }
      setExportStatus(`✅ تم تصدير بيانات الرخص إلى ${format.toUpperCase()} بنجاح!`);
    } catch (error) {
      setExportStatus(`❌ خطأ في تصدير ${format.toUpperCase()}: ${error}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📊 اختبار التصدير مع البيانات الحقيقية
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          اختبار شامل لميزات التصدير باستخدام البيانات الحقيقية من قاعدة البيانات
        </Typography>

        {exportStatus && (
          <Alert 
            severity={exportStatus.includes('❌') ? 'error' : 'success'} 
            sx={{ mb: 3 }}
            onClose={() => setExportStatus('')}
          >
            {exportStatus}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>جاري تحميل البيانات...</Typography>
          </Box>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`الشركات (${data.companies.length})`} icon={<DataIcon />} />
            <Tab label={`الغيابات (${data.absences.length})`} icon={<ReportIcon />} />
            <Tab label={`الرخص (${data.licenses.length})`} icon={<CheckIcon />} />
          </Tabs>
        </Box>

        {/* تبويب الشركات */}
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 بيانات الشركات
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  icon={<CheckIcon />}
                  label={`${data.companies.length} شركة`} 
                  color="primary" 
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ExcelIcon />}
                  onClick={() => exportCompanies('excel')}
                >
                  تصدير Excel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PdfIcon />}
                  onClick={() => exportCompanies('pdf')}
                >
                  تصدير PDF
                </Button>
              </Box>

              {data.companies.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>الرقم</TableCell>
                        <TableCell>اسم الشركة</TableCell>
                        <TableCell>الحالة</TableCell>
                        <TableCell>عدد العمال</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.companies.slice(0, 5).map((company) => (
                        <TableRow key={company.id}>
                          <TableCell>{company.id}</TableCell>
                          <TableCell>{company.file_name}</TableCell>
                          <TableCell>{company.file_status}</TableCell>
                          <TableCell>{company.total_workers}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* تبويب الغيابات */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 بيانات الغيابات
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  icon={<CheckIcon />}
                  label={`${data.absences.length} غياب`} 
                  color="warning" 
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ExcelIcon />}
                  onClick={() => exportAbsences('excel')}
                >
                  تصدير Excel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PdfIcon />}
                  onClick={() => exportAbsences('pdf')}
                >
                  تصدير PDF
                </Button>
              </Box>

              {data.absences.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>الرقم</TableCell>
                        <TableCell>رقم العامل</TableCell>
                        <TableCell>التاريخ</TableCell>
                        <TableCell>السبب</TableCell>
                        <TableCell>معذور</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.absences.slice(0, 5).map((absence) => (
                        <TableRow key={absence.id}>
                          <TableCell>{absence.id}</TableCell>
                          <TableCell>{absence.worker_id}</TableCell>
                          <TableCell>{absence.date}</TableCell>
                          <TableCell>{absence.reason}</TableCell>
                          <TableCell>{absence.is_excused ? 'نعم' : 'لا'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* تبويب الرخص */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 بيانات الرخص
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  icon={<CheckIcon />}
                  label={`${data.licenses.length} رخصة`} 
                  color="info" 
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ExcelIcon />}
                  onClick={() => exportLicenses('excel')}
                >
                  تصدير Excel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PdfIcon />}
                  onClick={() => exportLicenses('pdf')}
                >
                  تصدير PDF
                </Button>
              </Box>

              {data.licenses.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>الرقم</TableCell>
                        <TableCell>اسم الرخصة</TableCell>
                        <TableCell>النوع</TableCell>
                        <TableCell>الحالة</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.licenses.slice(0, 5).map((license) => (
                        <TableRow key={license.id}>
                          <TableCell>{license.id}</TableCell>
                          <TableCell>{license.name}</TableCell>
                          <TableCell>{license.license_type}</TableCell>
                          <TableCell>{license.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default RealDataExportPage;
