import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { 
  Security, 
  VpnKey, 
  Shield, 
  Refresh, 
  Warning,
  CheckCircle,
  Error,
  Settings,
  History,
} from '@mui/icons-material';
import { 
  PageLayout, 
  StandardTable, 
  ActionButtons, 
  StatusChip, 
  SearchAndFilter 
} from '../components/common';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  sessionTimeout: number;
  autoLockEnabled: boolean;
  ipWhitelistEnabled: boolean;
  auditLogEnabled: boolean;
}

interface SecurityLog {
  id: number;
  timestamp: string;
  event: string;
  user: string;
  ip: string;
  severity: 'low' | 'medium' | 'high';
  details?: string;
}

const SecurityPageImproved: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    passwordExpiryDays: 90,
    maxLoginAttempts: 3,
    sessionTimeout: 30,
    autoLockEnabled: true,
    ipWhitelistEnabled: false,
    auditLogEnabled: true,
  });
  
  const [securityLogs] = useState<SecurityLog[]>([
    {
      id: 1,
      timestamp: '2024-01-15 10:30:00',
      event: 'تسجيل دخول ناجح',
      user: 'admin',
      ip: '192.168.1.100',
      severity: 'low',
      details: 'تسجيل دخول من IP آمن'
    },
    {
      id: 2,
      timestamp: '2024-01-15 09:15:00',
      event: 'محاولة دخول فاشلة',
      user: 'unknown',
      ip: '203.0.113.1',
      severity: 'high',
      details: 'محاولة دخول من IP غير معروف'
    },
    {
      id: 3,
      timestamp: '2024-01-15 08:45:00',
      event: 'تغيير كلمة مرور',
      user: 'manager1',
      ip: '192.168.1.105',
      severity: 'medium',
      details: 'تغيير كلمة مرور بنجاح'
    },
    {
      id: 4,
      timestamp: '2024-01-15 08:30:00',
      event: 'تسجيل خروج',
      user: 'employee1',
      ip: '192.168.1.110',
      severity: 'low',
      details: 'تسجيل خروج عادي'
    },
    {
      id: 5,
      timestamp: '2024-01-15 08:15:00',
      event: 'محاولة اختراق',
      user: 'unknown',
      ip: '192.0.2.1',
      severity: 'high',
      details: 'محاولة SQL injection'
    },
  ]);
  
  const [filteredLogs, setFilteredLogs] = useState<SecurityLog[]>(securityLogs);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; log: SecurityLog | null }>({
    open: false,
    log: null
  });

  const handleSettingChange = (key: keyof SecuritySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSecuritySettings = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('تم حفظ إعدادات الأمان بنجاح');
    } catch (error) {
      setMessage('فشل في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const refreshSecurityLogs = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('تم تحديث سجل الأمان');
    } catch (error) {
      setMessage('فشل في تحديث سجل الأمان');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (log: SecurityLog) => {
    setDetailsDialog({ open: true, log });
  };

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredLogs(securityLogs);
      return;
    }
    const filtered = securityLogs.filter(log => 
      log.event.toLowerCase().includes(query.toLowerCase()) ||
      log.user.toLowerCase().includes(query.toLowerCase()) ||
      log.ip.includes(query)
    );
    setFilteredLogs(filtered);
  };

  const handleFilter = (filterType: string, value: string) => {
    let filtered = securityLogs;
    
    if (filterType === 'severity' && value) {
      filtered = securityLogs.filter(log => log.severity === value);
    }
    
    setFilteredLogs(filtered);
  };

  const getSeverityColor = (severity: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Define table columns for security logs
  const columns = [
    { 
      id: 'timestamp', 
      label: 'الوقت', 
      render: (log: SecurityLog) => new Date(log.timestamp).toLocaleString('ar-SA')
    },
    { 
      id: 'event', 
      label: 'الحدث', 
      render: (log: SecurityLog) => log.event
    },
    { 
      id: 'user', 
      label: 'المستخدم', 
      render: (log: SecurityLog) => log.user
    },
    { 
      id: 'ip', 
      label: 'عنوان IP', 
      render: (log: SecurityLog) => log.ip
    },
    { 
      id: 'severity', 
      label: 'الخطورة', 
      render: (log: SecurityLog) => (
        <StatusChip 
          status={log.severity} 
          color={getSeverityColor(log.severity)}
          label={
            log.severity === 'high' ? 'عالية' :
            log.severity === 'medium' ? 'متوسطة' :
            log.severity === 'low' ? 'منخفضة' : log.severity
          }
        />
      )
    },
    { 
      id: 'actions', 
      label: 'العمليات', 
      render: (log: SecurityLog) => (
        <ActionButtons
          onView={() => handleViewDetails(log)}
          showEdit={false}
          showDelete={false}
          showView={true}
          viewTooltip="عرض التفاصيل"
        />
      )
    }
  ];

  // Quick stats
  const stats = [
    { 
      label: 'إجمالي الأحداث', 
      value: securityLogs.length, 
      color: 'primary' as const 
    },
    { 
      label: 'أحداث آمنة', 
      value: securityLogs.filter(log => log.severity === 'low').length, 
      color: 'success' as const 
    },
    { 
      label: 'تحذيرات', 
      value: securityLogs.filter(log => log.severity === 'medium').length, 
      color: 'warning' as const 
    },
    { 
      label: 'تهديدات', 
      value: securityLogs.filter(log => log.severity === 'high').length, 
      color: 'error' as const 
    }
  ];

  const filterOptions = [
    { value: '', label: 'جميع المستويات' },
    { value: 'low', label: 'منخفضة' },
    { value: 'medium', label: 'متوسطة' },
    { value: 'high', label: 'عالية' }
  ];

  return (
    <PageLayout
      title="إعدادات الأمان"
      subtitle="إدارة إعدادات الأمان ومراقبة الأحداث"
      icon={<Security />}
      stats={stats}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshSecurityLogs}
            disabled={loading}
          >
            تحديث السجل
          </Button>
          <Button
            variant="contained"
            startIcon={<Settings />}
            onClick={saveSecuritySettings}
            disabled={loading}
          >
            حفظ الإعدادات
          </Button>
        </Box>
      }
    >
      <Box sx={{ mb: 3 }}>
        {/* Security Settings Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VpnKey />
              إعدادات المصادقة والأمان
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                  />
                }
                label="تفعيل المصادقة الثنائية"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoLockEnabled}
                    onChange={(e) => handleSettingChange('autoLockEnabled', e.target.checked)}
                  />
                }
                label="القفل التلقائي للشاشة"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.ipWhitelistEnabled}
                    onChange={(e) => handleSettingChange('ipWhitelistEnabled', e.target.checked)}
                  />
                }
                label="قائمة IP المسموحة"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.auditLogEnabled}
                    onChange={(e) => handleSettingChange('auditLogEnabled', e.target.checked)}
                  />
                }
                label="سجل المراجعة"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mt: 3 }}>
              <TextField
                fullWidth
                label="انتهاء كلمة المرور (أيام)"
                type="number"
                value={settings.passwordExpiryDays}
                onChange={(e) => handleSettingChange('passwordExpiryDays', parseInt(e.target.value))}
                size="small"
              />

              <TextField
                fullWidth
                label="محاولات الدخول المسموحة"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                size="small"
              />

              <TextField
                fullWidth
                label="انتهاء الجلسة (دقائق)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                size="small"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Security Status Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield />
              حالة الأمان العامة
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h3" color="success.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CheckCircle />
                  98%
                </Typography>
                <Typography color="textSecondary">
                  مستوى الأمان
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3" color="warning.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Warning />
                  {settings.twoFactorEnabled ? 0 : 1}
                </Typography>
                <Typography color="textSecondary">
                  تحذيرات الإعداد
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3" color="error.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Error />
                  {securityLogs.filter(log => log.severity === 'high').length}
                </Typography>
                <Typography color="textSecondary">
                  تهديدات نشطة
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Security Logs Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History />
            سجل الأمان
          </Typography>

          <SearchAndFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            filterOptions={filterOptions}
            filterLabel="مستوى الخطورة"
            searchPlaceholder="البحث في سجل الأمان..."
          />

          <StandardTable
            columns={columns}
            data={filteredLogs}
            loading={loading}
            emptyMessage="لا توجد أحداث أمان مسجلة"
          />
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialog.open} 
        onClose={() => setDetailsDialog({ open: false, log: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          تفاصيل الحدث الأمني
        </DialogTitle>
        <DialogContent>
          {detailsDialog.log && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {detailsDialog.log.event}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                الوقت: {new Date(detailsDialog.log.timestamp).toLocaleString('ar-SA')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                المستخدم: {detailsDialog.log.user}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                عنوان IP: {detailsDialog.log.ip}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                مستوى الخطورة: {
                  detailsDialog.log.severity === 'high' ? 'عالية' :
                  detailsDialog.log.severity === 'medium' ? 'متوسطة' :
                  detailsDialog.log.severity === 'low' ? 'منخفضة' : detailsDialog.log.severity
                }
              </Typography>
              {detailsDialog.log.details && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>التفاصيل:</strong><br />
                  {detailsDialog.log.details}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, log: null })}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!message} 
        autoHideDuration={4000} 
        onClose={() => setMessage(null)}
      >
        <Alert 
          severity={message?.includes('فشل') ? 'error' : 'success'}
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default SecurityPageImproved;
