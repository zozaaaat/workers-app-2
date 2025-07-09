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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ShieldIcon from '@mui/icons-material/Shield';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  sessionTimeout: number;
}

interface SecurityLog {
  id: number;
  timestamp: string;
  event: string;
  user: string;
  ip: string;
  severity: 'low' | 'medium' | 'high';
}

const SecuritySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    passwordExpiryDays: 90,
    maxLoginAttempts: 3,
    sessionTimeout: 30,
  });
  
  const securityLogs: SecurityLog[] = [
    {
      id: 1,
      timestamp: '2024-01-15 10:30:00',
      event: 'تسجيل دخول ناجح',
      user: 'admin',
      ip: '192.168.1.100',
      severity: 'low',
    },
    {
      id: 2,
      timestamp: '2024-01-15 09:15:00',
      event: 'محاولة دخول فاشلة',
      user: 'unknown',
      ip: '203.0.113.1',
      severity: 'high',
    },
    {
      id: 3,
      timestamp: '2024-01-15 08:45:00',
      event: 'تغيير كلمة مرور',
      user: 'manager1',
      ip: '192.168.1.105',
      severity: 'medium',
    },
  ];
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSettingChange = (key: keyof SecuritySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSecuritySettings = async () => {
    setLoading(true);
    try {
      setMessage('تم حفظ إعدادات الأمان بنجاح');
    } catch (error) {
      setMessage('فشل في حفظ الإعدادات');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        إعدادات الأمان
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* إعدادات الأمان */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <VpnKeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              إعدادات المصادقة
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorEnabled}
                  onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                />
              }
              label="تفعيل المصادقة الثنائية"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="عدد أيام انتهاء كلمة المرور"
              type="number"
              value={settings.passwordExpiryDays}
              onChange={(e) => handleSettingChange('passwordExpiryDays', parseInt(e.target.value))}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="عدد محاولات تسجيل الدخول المسموحة"
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="مهلة انتهاء الجلسة (بالدقائق)"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={saveSecuritySettings}
              disabled={loading}
              fullWidth
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </CardContent>
        </Card>

        {/* سجل الأمان */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <ShieldIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              سجل الأمان
            </Typography>

            <List>
              {securityLogs.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemText
                      primary={log.event}
                      secondary={`المستخدم: ${log.user} | IP: ${log.ip} | ${log.timestamp}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={log.severity}
                        color={getSeverityColor(log.severity) as any}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < securityLogs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* حالة الأمان العامة */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              حالة الأمان العامة
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <Box>
                <Typography variant="h4" color="success.main">
                  98%
                </Typography>
                <Typography color="textSecondary">
                  مستوى الأمان
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="primary">
                  {securityLogs.filter(log => log.severity === 'low').length}
                </Typography>
                <Typography color="textSecondary">
                  أحداث آمنة
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="warning.main">
                  {securityLogs.filter(log => log.severity === 'medium').length}
                </Typography>
                <Typography color="textSecondary">
                  تحذيرات
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="error">
                  {securityLogs.filter(log => log.severity === 'high').length}
                </Typography>
                <Typography color="textSecondary">
                  تهديدات
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SecuritySettingsPage;
