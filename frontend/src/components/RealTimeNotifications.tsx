import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Chip,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationImportant as ImportantIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Assignment as TaskIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'system' | 'hr' | 'task' | 'reminder';
  actionUrl?: string;
  actionText?: string;
  sender?: {
    name: string;
    avatar?: string;
    role: string;
  };
}

const RealTimeNotificationsComponent: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enablePush: true,
    enableEmail: true,
    enableSound: true,
    autoMarkRead: false,
    showPreview: true
  });

  useEffect(() => {
    // Simulate real-time notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'طلب إجازة جديد',
        message: 'أحمد محمد قدم طلب إجازة سنوية لمدة 5 أيام',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'hr',
        actionUrl: '/leaves/pending',
        actionText: 'مراجعة الطلب',
        sender: {
          name: 'نظام الموارد البشرية',
          role: 'النظام'
        }
      },
      {
        id: '2',
        type: 'warning',
        title: 'تأخر في تسليم المهام',
        message: 'هناك 3 مهام متأخرة في قسم المبيعات',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        category: 'task',
        actionUrl: '/tasks/overdue',
        actionText: 'عرض المهام',
        sender: {
          name: 'مدير المشاريع',
          role: 'الإدارة'
        }
      },
      {
        id: '3',
        type: 'success',
        title: 'تم اكتمال التدريب',
        message: 'فاطمة العلي أكملت دورة السلامة المهنية بنجاح',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        category: 'hr',
        sender: {
          name: 'قسم التدريب',
          role: 'الموارد البشرية'
        }
      },
      {
        id: '4',
        type: 'error',
        title: 'خطأ في النظام',
        message: 'فشل في رفع تقرير الحضور اليومي',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        category: 'system',
        actionUrl: '/system/errors',
        actionText: 'إصلاح المشكلة'
      }
    ];

    setNotifications(mockNotifications);

    // Simulate new notifications
    const interval = setInterval(() => {
      const randomNotification: Notification = {
        id: Date.now().toString(),
        type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)] as any,
        title: 'إشعار جديد',
        message: `إشعار تجريبي في ${new Date().toLocaleTimeString('ar-SA')}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'system'
      };

      setNotifications(prev => [randomNotification, ...prev]);
    }, 30000); // New notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <InfoIcon color="info" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'success': return <SuccessIcon color="success" />;
      default: return <InfoIcon />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hr': return <PersonIcon />;
      case 'task': return <TaskIcon />;
      case 'system': return <SettingsIcon />;
      case 'reminder': return <ScheduleIcon />;
      default: return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <>
      {/* Notification Bell */}
      <IconButton
        color="inherit"
        onClick={handleNotificationClick}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            width: 400, 
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              الإشعارات ({unreadCount} غير مقروء)
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={() => setSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
              {unreadCount > 0 && (
                <IconButton size="small" onClick={markAllAsRead}>
                  <MarkReadIcon />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              لا توجد إشعارات
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.slice(0, 10).map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ flex: 1 }}>
                          {notification.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={notification.priority}
                          color={getPriorityColor(notification.priority) as any}
                          variant="outlined"
                        />
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notification.timestamp)}
                          </Typography>
                          {notification.sender && (
                            <Typography variant="caption" color="text.secondary">
                              من: {notification.sender.name}
                            </Typography>
                          )}
                        </Stack>
                        {notification.actionText && (
                          <Button size="small" sx={{ mt: 1 }}>
                            {notification.actionText}
                          </Button>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Stack>
                      {!notification.read && (
                        <IconButton
                          size="small"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < notifications.slice(0, 10).length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Footer */}
        {notifications.length > 10 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Button size="small">
              عرض جميع الإشعارات ({notifications.length})
            </Button>
          </Box>
        )}
      </Menu>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إعدادات الإشعارات</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enablePush}
                  onChange={(e) => setSettings({ ...settings, enablePush: e.target.checked })}
                />
              }
              label="تفعيل الإشعارات الفورية"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableEmail}
                  onChange={(e) => setSettings({ ...settings, enableEmail: e.target.checked })}
                />
              }
              label="إرسال إشعارات البريد الإلكتروني"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableSound}
                  onChange={(e) => setSettings({ ...settings, enableSound: e.target.checked })}
                />
              }
              label="تشغيل الأصوات"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoMarkRead}
                  onChange={(e) => setSettings({ ...settings, autoMarkRead: e.target.checked })}
                />
              }
              label="تمييز كمقروء تلقائياً"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showPreview}
                  onChange={(e) => setSettings({ ...settings, showPreview: e.target.checked })}
                />
              }
              label="عرض معاينة الإشعار"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            حفظ الإعدادات
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Toast Notification Component for in-app notifications
export const ToastNotification: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Alert
      severity={notification.type}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={onClose}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
      sx={{
        position: 'fixed',
        top: 80,
        right: 20,
        minWidth: 350,
        zIndex: 9999,
        boxShadow: 3,
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <Stack>
        <Typography variant="subtitle2" fontWeight="bold">
          {notification.title}
        </Typography>
        <Typography variant="body2">
          {notification.message}
        </Typography>
        {notification.actionText && (
          <Button size="small" color="inherit" sx={{ mt: 1, alignSelf: 'flex-start' }}>
            {notification.actionText}
          </Button>
        )}
      </Stack>
    </Alert>
  );
};

// Notification Provider Context
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);

  const addToastNotification = (notification: Notification) => {
    setToastNotifications(prev => [...prev, notification]);
  };

  const removeToastNotification = (id: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Box>
      {children}
      {toastNotifications.map(notification => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => removeToastNotification(notification.id)}
        />
      ))}
    </Box>
  );
};

export default RealTimeNotificationsComponent;
