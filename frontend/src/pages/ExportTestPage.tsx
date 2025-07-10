import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  Chip
} from '@mui/material';
import {
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { ExportService } from '../services/ExportService';

const ExportTestPage: React.FC = () => {
  const [exportStatus, setExportStatus] = useState<string>('');

  // بيانات تجريبية للاختبار
  const testData = [
    {
      id: 1,
      name: 'أحمد محمد علي',
      job_title: 'مهندس',
      salary: 8000,
      hire_date: '2024-01-15',
      phone: '+966501234567'
    },
    {
      id: 2,
      name: 'محمد أحمد حسن',
      job_title: 'عامل',
      salary: 3000,
      hire_date: '2024-03-20',
      phone: '+966502345678'
    },
    {
      id: 3,
      name: 'سعد عبدالله الحربي',
      job_title: 'فني',
      salary: 4500,
      hire_date: '2024-02-10',
      phone: '+966503456789'
    }
  ];

  const columns = [
    { key: 'id', label: 'الرقم' },
    { key: 'name', label: 'اسم العامل' },
    { key: 'job_title', label: 'المسمى الوظيفي' },
    { key: 'salary', label: 'الراتب', format: (value: number) => `${value} ريال` },
    { key: 'hire_date', label: 'تاريخ التعيين' },
    { key: 'phone', label: 'رقم الهاتف' }
  ];

  const handleExportExcel = () => {
    try {
      ExportService.exportToExcel(testData, columns, {
        format: 'excel',
        filename: 'test_workers_export.xlsx',
        title: 'بيانات العمال - اختبار التصدير',
        includeDate: true,
        includeStats: true
      });
      setExportStatus('تم تصدير ملف Excel بنجاح! ✅');
    } catch (error) {
      setExportStatus(`خطأ في تصدير Excel: ${error}`);
    }
  };

  const handleExportPDF = () => {
    try {
      ExportService.exportToPDF(testData, columns, {
        format: 'pdf',
        filename: 'test_workers_export.pdf',
        title: 'بيانات العمال - اختبار التصدير',
        includeDate: true,
        includeStats: true
      });
      setExportStatus('تم تصدير ملف PDF بنجاح! ✅');
    } catch (error) {
      setExportStatus(`خطأ في تصدير PDF: ${error}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🧪 اختبار ميزات التصدير
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          هذه الصفحة لاختبار ميزات تصدير البيانات إلى Excel و PDF
        </Typography>

        {exportStatus && (
          <Alert 
            severity={exportStatus.includes('خطأ') ? 'error' : 'success'} 
            sx={{ mb: 3 }}
            onClose={() => setExportStatus('')}
          >
            {exportStatus}
          </Alert>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* بيانات الاختبار */}
          <div>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 البيانات التجريبية
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    icon={<CheckIcon />}
                    label={`${testData.length} سجل`} 
                    color="primary" 
                    size="small"
                  />
                </Box>

                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {testData.map((worker, index) => (
                    <Box key={worker.id} sx={{ 
                      p: 1, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 1,
                      backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                    }}>
                      <Typography variant="body2" fontWeight="bold">
                        {worker.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {worker.job_title} - {worker.salary} ريال
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </div>

          {/* أزرار التصدير */}
          <div>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📤 خيارات التصدير
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<ExcelIcon />}
                    onClick={handleExportExcel}
                    fullWidth
                  >
                    تصدير إلى Excel
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<PdfIcon />}
                    onClick={handleExportPDF}
                    fullWidth
                  >
                    تصدير إلى PDF
                  </Button>

                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      💡 ملاحظة: الملفات سيتم تحميلها تلقائياً في مجلد التحميلات
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* معلومات التصدير */}
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ℹ️ معلومات التصدير
              </Typography>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    ميزات Excel:
                  </Typography>
                  <ul>
                    <li>تنسيق البيانات بالعربية</li>
                    <li>إضافة عنوان وتاريخ</li>
                    <li>تنسيق الأعمدة والقيم</li>
                    <li>إحصائيات إضافية</li>
                  </ul>
                </div>
                
                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    ميزات PDF:
                  </Typography>
                  <ul>
                    <li>جداول منسقة</li>
                    <li>دعم النصوص العربية</li>
                    <li>تخطيط احترافي</li>
                    <li>رأس وتذييل الصفحة</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Container>
  );
};

export default ExportTestPage;
