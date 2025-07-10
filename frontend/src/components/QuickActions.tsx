/**
 * Quick Actions Component - إجراءات سريعة للوحة التحكم
 */

import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import {
  PersonAdd as AddWorkerIcon,
  Business as AddCompanyIcon,
  Description as AddLicenseIcon,
  FileUpload as ImportIcon,
  Assessment as ReportsIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Download as ExportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  shortcut?: string;
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'add-worker',
      title: 'إضافة عامل جديد',
      description: 'إضافة عامل جديد للنظام',
      icon: <AddWorkerIcon />,
      path: '/workers?action=add',
      color: '#4CAF50',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'add-company',
      title: 'إضافة شركة',
      description: 'تسجيل شركة جديدة',
      icon: <AddCompanyIcon />,
      path: '/companies?action=add',
      color: '#2196F3',
      shortcut: 'Ctrl+C'
    },
    {
      id: 'add-license',
      title: 'إضافة ترخيص',
      description: 'إضافة ترخيص جديد',
      icon: <AddLicenseIcon />,
      path: '/licenses?action=add',
      color: '#FF9800',
      shortcut: 'Ctrl+L'
    },
    {
      id: 'import-data',
      title: 'استيراد البيانات',
      description: 'استيراد بيانات من ملفات Excel',
      icon: <ImportIcon />,
      path: '/import',
      color: '#9C27B0',
      shortcut: 'Ctrl+I'
    },
    {
      id: 'reports',
      title: 'التقارير',
      description: 'عرض وإنشاء التقارير',
      icon: <ReportsIcon />,
      path: '/reports',
      color: '#607D8B',
      shortcut: 'Ctrl+R'
    },
    {
      id: 'export-data',
      title: 'تصدير البيانات',
      description: 'تصدير البيانات إلى Excel/PDF',
      icon: <ExportIcon />,
      path: '/export-test',
      color: '#795548',
      shortcut: 'Ctrl+E'
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      description: 'إدارة الإشعارات والتنبيهات',
      icon: <NotificationsIcon />,
      path: '/notifications',
      color: '#F44336',
      shortcut: 'Ctrl+B'
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      description: 'إعدادات النظام',
      icon: <SettingsIcon />,
      path: '/settings',
      color: '#424242',
      shortcut: 'Ctrl+,'
    }
  ];

  // معالج النقر على الإجراء السريع
  const handleActionClick = (action: QuickAction) => {
    navigate(action.path);
  };

  // معالج اختصارات لوحة المفاتيح
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        const action = quickActions.find(a => 
          a.shortcut === `${event.ctrlKey ? 'Ctrl' : 'Cmd'}+${event.key.toUpperCase()}`
        );
        
        if (action) {
          event.preventDefault();
          handleActionClick(action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ⚡ إجراءات سريعة
      </Typography>
      
      <Grid container spacing={2}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={3} key={action.id}>
            <Tooltip title={`${action.description}${action.shortcut ? ` (${action.shortcut})` : ''}`}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    '& .action-icon': {
                      transform: 'scale(1.1)',
                      color: action.color
                    }
                  }
                }}
                onClick={() => handleActionClick(action)}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <IconButton
                    className="action-icon"
                    sx={{
                      mb: 1,
                      color: 'text.secondary',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                    size="large"
                  >
                    {action.icon}
                  </IconButton>
                  
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {action.title}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    {action.description}
                  </Typography>
                  
                  {action.shortcut && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mt: 1, 
                        px: 1, 
                        py: 0.5, 
                        bgcolor: 'grey.100', 
                        borderRadius: 1,
                        fontFamily: 'monospace'
                      }}
                    >
                      {action.shortcut}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickActions;
