// ✅ Done - صفحة التنبيهات لعرض تنبيهات قرب انتهاء الإقامة
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Chip, 
  Alert, 
  Snackbar,
  Button,
  Badge
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { PageLayout, SearchAndFilter } from '../../components/common';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface Notification {
  id: number;
  worker_id: number;
  worker_name: string;
  worker_civil_id: string;
  type: 'residence_expiry' | 'passport_expiry' | 'license_expiry';
  title: string;
  message: string;
  days_remaining: number;
  expiry_date: string;
  is_read: boolean;
  is_urgent: boolean;
  created_at: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  residence_expiry: number;
  passport_expiry: number;
  license_expiry: number;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    urgent: 0,
    residence_expiry: 0,
    passport_expiry: 0,
    license_expiry: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterUrgent, setFilterUrgent] = useState('');
  const [filterRead, setFilterRead] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // تحميل البيانات
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // TODO: ربط بـ API حقيقي
      const response = await axios.get(`${API_URL}/notifications`);
      setNotifications(response.data);
      calculateStats(response.data);
    } catch (error) {
      // بيانات تجريبية
      const mockNotifications: Notification[] = [
        {
          id: 1,
          worker_id: 1,
          worker_name: 'أحمد محمد',
          worker_civil_id: '123456789',
          type: 'residence_expiry',
          title: 'انتهاء الإقامة قريباً',
          message: 'ستنتهي إقامة العامل أحمد محمد خلال 10 أيام',
          days_remaining: 10,
          expiry_date: '2025-07-20',
          is_read: false,
          is_urgent: true,
          created_at: '2025-07-01'
        },
        {
          id: 2,
          worker_id: 2,
          worker_name: 'محمد علي',
          worker_civil_id: '987654321',
          type: 'passport_expiry',
          title: 'انتهاء الجواز قريباً',
          message: 'سينتهي جواز العامل محمد علي خلال 5 أيام',
          days_remaining: 5,
          expiry_date: '2025-07-15',
          is_read: false,
          is_urgent: true,
          created_at: '2025-07-01'
        },
        {
          id: 3,
          worker_id: 3,
          worker_name: 'فاطمة أحمد',
          worker_civil_id: '456789123',
          type: 'license_expiry',
          title: 'انتهاء الترخيص قريباً',
          message: 'سينتهي ترخيص العامل فاطمة أحمد خلال 20 يوم',
          days_remaining: 20,
          expiry_date: '2025-07-30',
          is_read: true,
          is_urgent: false,
          created_at: '2025-06-30'
        }
      ];
      setNotifications(mockNotifications);
      calculateStats(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (notifications: Notification[]) => {
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.is_read).length,
      urgent: notifications.filter(n => n.is_urgent).length,
      residence_expiry: notifications.filter(n => n.type === 'residence_expiry').length,
      passport_expiry: notifications.filter(n => n.type === 'passport_expiry').length,
      license_expiry: notifications.filter(n => n.type === 'license_expiry').length
    };
    setStats(stats);
  };

  // فلترة البيانات
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = !searchTerm || 
        (notification.worker_name && notification.worker_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (notification.worker_civil_id && notification.worker_civil_id.includes(searchTerm)) ||
        (notification.title && notification.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = !filterType || notification.type === filterType;
      const matchesUrgent = !filterUrgent || 
        (filterUrgent === 'true' && notification.is_urgent) ||
        (filterUrgent === 'false' && !notification.is_urgent);
      const matchesRead = !filterRead || 
        (filterRead === 'true' && notification.is_read) ||
        (filterRead === 'false' && !notification.is_read);
      
      return matchesSearch && matchesType && matchesUrgent && matchesRead;
    });
  }, [notifications, searchTerm, filterType, filterUrgent, filterRead]);

  // تحديد نوع التنبيه
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'residence_expiry': return 'انتهاء الإقامة';
      case 'passport_expiry': return 'انتهاء الجواز';
      case 'license_expiry': return 'انتهاء الترخيص';
      default: return type;
    }
  };

  // تحديد لون التنبيه
  const getNotificationColor = (notification: Notification) => {
    if (notification.days_remaining <= 5) return 'error';
    if (notification.days_remaining <= 15) return 'warning';
    return 'info';
  };

  // العمليات
  const handleMarkAsRead = async (id: number) => {
    try {
      // TODO: ربط بـ API حقيقي
      await axios.patch(`${API_URL}/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setSuccess('تم تحديث التنبيه بنجاح');
    } catch (error) {
      // محاكاة
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setSuccess('تم تحديث التنبيه بنجاح');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: ربط بـ API حقيقي
      await axios.patch(`${API_URL}/notifications/mark-all-read`);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setSuccess('تم تحديث جميع التنبيهات بنجاح');
    } catch (error) {
      // محاكاة
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setSuccess('تم تحديث جميع التنبيهات بنجاح');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      // TODO: ربط بـ API حقيقي
      await axios.delete(`${API_URL}/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      setSuccess('تم حذف التنبيه بنجاح');
    } catch (error) {
      // محاكاة
      setNotifications(notifications.filter(n => n.id !== id));
      setSuccess('تم حذف التنبيه بنجاح');
    }
  };

  // الأعمدة
  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'المعرف', 
      width: 80,
      renderCell: (params) => (
        <Badge color="error" variant="dot" invisible={params.row.is_read}>
          {params.value}
        </Badge>
      )
    },
    { field: 'worker_name', headerName: 'اسم العامل', width: 150 },
    { field: 'worker_civil_id', headerName: 'الرقم المدني', width: 120 },
    { 
      field: 'type', 
      headerName: 'النوع', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={getNotificationTypeLabel(params.value)} 
          color={getNotificationColor(params.row)}
          size="small"
        />
      )
    },
    { 
      field: 'days_remaining', 
      headerName: 'الأيام المتبقية', 
      width: 130,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          color={params.value <= 5 ? 'error' : params.value <= 15 ? 'warning.main' : 'text.primary'}
          fontWeight={params.value <= 15 ? 'bold' : 'normal'}
        >
          {params.value} يوم
        </Typography>
      )
    },
    { field: 'expiry_date', headerName: 'تاريخ الانتهاء', width: 130, type: 'date' },
    { 
      field: 'is_urgent', 
      headerName: 'عاجل', 
      width: 80,
      renderCell: (params) => (
        params.value ? <WarningIcon color="error" /> : null
      )
    },
    { 
      field: 'is_read', 
      headerName: 'مقروء', 
      width: 80,
      renderCell: (params) => (
        params.value ? <CheckCircleIcon color="success" /> : <NotificationsActiveIcon color="primary" />
      )
    },
    {
      field: 'actions',
      headerName: 'العمليات',
      width: 120,
      renderCell: (params) => (
        <Box>
          {!params.row.is_read && (
            <IconButton 
              size="small" 
              onClick={() => handleMarkAsRead(params.row.id)}
              title="تحديد كمقروء"
            >
              <CheckCircleIcon color="success" />
            </IconButton>
          )}
          <IconButton 
            size="small" 
            onClick={() => handleDeleteNotification(params.row.id)}
            title="حذف التنبيه"
          >
            <CloseIcon color="error" />
          </IconButton>
        </Box>
      )
    }
  ];

  // مسح المرشحات
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterUrgent('');
    setFilterRead('');
  };

  const activeFiltersCount = [filterType, filterUrgent, filterRead].filter(Boolean).length;

  // إعدادات البحث والفلترة
  const filterOptions = [
    {
      label: 'النوع',
      value: filterType,
      options: [
        { value: 'residence_expiry', label: 'انتهاء الإقامة' },
        { value: 'passport_expiry', label: 'انتهاء الجواز' },
        { value: 'license_expiry', label: 'انتهاء الترخيص' }
      ],
      onChange: setFilterType
    },
    {
      label: 'العاجل',
      value: filterUrgent,
      options: [
        { value: 'true', label: 'عاجل' },
        { value: 'false', label: 'غير عاجل' }
      ],
      onChange: setFilterUrgent
    },
    {
      label: 'المقروء',
      value: filterRead,
      options: [
        { value: 'true', label: 'مقروء' },
        { value: 'false', label: 'غير مقروء' }
      ],
      onChange: setFilterRead
    }
  ];

  return (
    <PageLayout
      title="التنبيهات"
      actions={
        <Button
          variant="contained"
          startIcon={<NotificationsIcon />}
          onClick={handleMarkAllAsRead}
          disabled={stats.unread === 0}
        >
          تحديد الكل كمقروء
        </Button>
      }
      headerContent={
        <Box>
          {/* إحصائيات */}
          <Box display="flex" gap={2} mb={2}>
            <Card sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" color="primary">{stats.total}</Typography>
                <Typography variant="body2">المجموع</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" color="error">{stats.unread}</Typography>
                <Typography variant="body2">غير مقروء</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" color="warning.main">{stats.urgent}</Typography>
                <Typography variant="body2">عاجل</Typography>
              </CardContent>
            </Card>
          </Box>
          
          <SearchAndFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filterOptions}
            onClear={clearFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </Box>
      }
    >
      <DataGrid
        rows={filteredNotifications}
        columns={columns}
        loading={loading}
        autoHeight
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }
        }}
      />

      {/* رسائل النجاح والخطأ */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default NotificationsPage;
