import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  BeachAccess as LeaveIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  DateRange as DurationIcon
} from '@mui/icons-material';
import UniversalDataTable from '../components/common/UniversalDataTable';
import UniversalFormDialog from '../components/common/UniversalFormDialog';
import { useApi } from '../services/ApiService';

interface Column {
  id: string;
  label: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onClick: (row: any) => void;
}

interface Leave {
  id: number;
  worker_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  notes: string;
  worker?: { name: string; civil_id: string };
}

interface Worker {
  id: number;
  name: string;
  civil_id: string;
}

const LeavesPageSimplified: React.FC = () => {
  const api = useApi();
  
  // الحالات الأساسية
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // حالات الحوار
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  
  // حالات النموذج
  const [formData, setFormData] = useState({
    worker_id: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  
  // حالات الفلترة
  const [filterWorker, setFilterWorker] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // أنواع الإجازات
  const leaveTypes = [
    'إجازة سنوية',
    'إجازة مرضية',
    'إجازة بدون راتب',
    'إجازة طوارئ',
    'إجازة أمومة',
    'إجازة أبوة',
    'إجازة دراسية',
    'إجازة حج وعمرة',
    'أخرى'
  ];

  // حساب مدة الإجازة
  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // جلب البيانات
  useEffect(() => {
    fetchLeaves();
    fetchWorkers();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await api.leaves.getAll();
      setLeaves(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في جلب بيانات الإجازات');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const data = await api.workers.getAll();
      setWorkers(data);
    } catch (err: any) {
      console.error('Error fetching workers:', err);
    }
  };

  // تعريف الأعمدة
  const columns: Column[] = [
    {
      id: 'worker',
      label: 'العامل',
      width: 200,
      render: (value) => (
        <Chip 
          icon={<PersonIcon />}
          label={`${value?.name || 'غير محدد'} (${value?.civil_id || ''})`} 
          size="small" 
          color="primary"
        />
      )
    },
    {
      id: 'leave_type',
      label: 'نوع الإجازة',
      width: 150,
      render: (value) => (
        <Chip 
          icon={<LeaveIcon />}
          label={value || 'غير محدد'} 
          size="small" 
          color="secondary"
        />
      )
    },
    {
      id: 'start_date',
      label: 'تاريخ البداية',
      width: 130,
      render: (value) => (
        <Chip 
          icon={<CalendarIcon />}
          label={value ? new Date(value).toLocaleDateString('ar-SA') : 'غير محدد'} 
          size="small" 
          color="info"
        />
      )
    },
    {
      id: 'end_date',
      label: 'تاريخ النهاية',
      width: 130,
      render: (value) => (
        <Chip 
          icon={<CalendarIcon />}
          label={value ? new Date(value).toLocaleDateString('ar-SA') : 'غير محدد'} 
          size="small" 
          color="info"
        />
      )
    },
    {
      id: 'duration',
      label: 'المدة',
      width: 100,
      align: 'center',
      render: (_value, row) => {
        const duration = calculateDuration(row.start_date, row.end_date);
        return (
          <Chip 
            icon={<DurationIcon />}
            label={`${duration} يوم`} 
            size="small" 
            color={duration > 30 ? 'error' : duration > 7 ? 'warning' : 'success'}
          />
        );
      }
    },
    {
      id: 'notes',
      label: 'ملاحظات',
      width: 150,
      render: (value) => (
        <span style={{ fontSize: '0.875rem' }}>
          {value ? (value.length > 30 ? `${value.substring(0, 30)}...` : value) : 'لا توجد ملاحظات'}
        </span>
      )
    }
  ];

  // تعريف الإجراءات
  const actions: Action[] = [
    {
      id: 'view',
      label: 'عرض التفاصيل',
      icon: <ViewIcon />,
      color: 'info',
      onClick: (leave) => {
        setSelectedLeave(leave);
        // يمكن إضافة نافذة تفاصيل لاحقاً
      }
    },
    {
      id: 'edit',
      label: 'تعديل',
      icon: <EditIcon />,
      color: 'primary',
      onClick: (leave) => {
        setSelectedLeave(leave);
        setFormData({
          worker_id: leave.worker_id?.toString() || '',
          leave_type: leave.leave_type || '',
          start_date: leave.start_date || '',
          end_date: leave.end_date || '',
          notes: leave.notes || ''
        });
        setEditDialogOpen(true);
      }
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: (leave) => {
        setSelectedLeave(leave);
        setDeleteDialogOpen(true);
      }
    }
  ];

  // إضافة إجازة جديدة
  const handleAdd = () => {
    setFormData({
      worker_id: '',
      leave_type: '',
      start_date: '',
      end_date: '',
      notes: ''
    });
    setAddDialogOpen(true);
  };

  // حفظ إجازة جديدة
  const handleSaveAdd = async () => {
    try {
      const dataToSend = {
        ...formData,
        worker_id: Number(formData.worker_id)
      };
      await api.leaves.create(dataToSend);
      await fetchLeaves();
      setAddDialogOpen(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في إضافة الإجازة');
      throw err;
    }
  };

  // حفظ تعديل الإجازة
  const handleSaveEdit = async () => {
    if (!selectedLeave) return;
    
    try {
      const dataToSend = {
        ...formData,
        worker_id: Number(formData.worker_id)
      };
      await api.leaves.update(selectedLeave.id, dataToSend);
      await fetchLeaves();
      setEditDialogOpen(false);
      setSelectedLeave(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تعديل الإجازة');
      throw err;
    }
  };

  // حذف الإجازة
  const handleDelete = async () => {
    if (!selectedLeave) return;
    
    try {
      await api.leaves.delete(selectedLeave.id);
      await fetchLeaves();
      setDeleteDialogOpen(false);
      setSelectedLeave(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في حذف الإجازة');
    }
  };

  // تطبيق الفلاتر
  const filteredLeaves = leaves.filter(leave => {
    const matchesWorker = !filterWorker || leave.worker_id?.toString() === filterWorker;
    const matchesType = !filterType || leave.leave_type === filterType;
    const matchesMonth = !filterMonth || (leave.start_date && leave.start_date.startsWith(filterMonth));
    
    return matchesWorker && matchesType && matchesMonth;
  });

  // إحصائيات سريعة
  const totalLeaves = filteredLeaves.length;
  const totalDays = filteredLeaves.reduce((sum, leave) => 
    sum + calculateDuration(leave.start_date, leave.end_date), 0
  );
  const avgDuration = totalLeaves > 0 ? Math.round(totalDays / totalLeaves) : 0;

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* إحصائيات سريعة */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip 
          icon={<LeaveIcon />}
          label={`إجمالي الإجازات: ${totalLeaves}`} 
          color="primary" 
          size="medium"
        />
        <Chip 
          icon={<DurationIcon />}
          label={`إجمالي الأيام: ${totalDays}`} 
          color="info" 
          size="medium"
        />
        <Chip 
          label={`متوسط المدة: ${avgDuration} يوم`} 
          color="secondary" 
          size="medium"
        />
      </Box>

      {/* عوامل التصفية */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>العامل</InputLabel>
          <Select
            value={filterWorker}
            onChange={(e) => setFilterWorker(e.target.value)}
            label="العامل"
          >
            <MenuItem value="">الكل</MenuItem>
            {workers.map(worker => (
              <MenuItem key={worker.id} value={worker.id.toString()}>
                {worker.name} ({worker.civil_id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>نوع الإجازة</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="نوع الإجازة"
          >
            <MenuItem value="">الكل</MenuItem>
            {leaveTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="الشهر والسنة"
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
      </Box>

      {/* جدول البيانات */}
      <UniversalDataTable
        title="إدارة الإجازات"
        data={filteredLeaves}
        columns={columns}
        actions={actions}
        loading={loading}
        onAdd={handleAdd}
        searchPlaceholder="البحث في الإجازات..."
        emptyMessage="لا توجد إجازات مسجلة"
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* حوار إضافة إجازة */}
      <UniversalFormDialog
        open={addDialogOpen}
        title="إضافة إجازة جديدة"
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleSaveAdd}
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth required>
            <InputLabel>العامل *</InputLabel>
            <Select
              value={formData.worker_id}
              onChange={(e) => setFormData({...formData, worker_id: e.target.value})}
              label="العامل *"
            >
              {workers.map(worker => (
                <MenuItem key={worker.id} value={worker.id.toString()}>
                  {worker.name} ({worker.civil_id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth required>
            <InputLabel>نوع الإجازة *</InputLabel>
            <Select
              value={formData.leave_type}
              onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
              label="نوع الإجازة *"
            >
              {leaveTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            required
            label="تاريخ البداية *"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            required
            label="تاريخ النهاية *"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            label="ملاحظات"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="أدخل أي ملاحظات إضافية..."
          />

          {/* عرض مدة الإجازة */}
          {formData.start_date && formData.end_date && (
            <Alert severity="info">
              مدة الإجازة: {calculateDuration(formData.start_date, formData.end_date)} يوم
            </Alert>
          )}
        </Box>
      </UniversalFormDialog>

      {/* حوار تعديل إجازة */}
      <UniversalFormDialog
        open={editDialogOpen}
        title={`تعديل إجازة: ${selectedLeave?.worker?.name}`}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedLeave(null);
        }}
        onSubmit={handleSaveEdit}
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth required>
            <InputLabel>العامل *</InputLabel>
            <Select
              value={formData.worker_id}
              onChange={(e) => setFormData({...formData, worker_id: e.target.value})}
              label="العامل *"
            >
              {workers.map(worker => (
                <MenuItem key={worker.id} value={worker.id.toString()}>
                  {worker.name} ({worker.civil_id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth required>
            <InputLabel>نوع الإجازة *</InputLabel>
            <Select
              value={formData.leave_type}
              onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
              label="نوع الإجازة *"
            >
              {leaveTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            required
            label="تاريخ البداية *"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            required
            label="تاريخ النهاية *"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            label="ملاحظات"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="أدخل أي ملاحظات إضافية..."
          />

          {/* عرض مدة الإجازة */}
          {formData.start_date && formData.end_date && (
            <Alert severity="info">
              مدة الإجازة: {calculateDuration(formData.start_date, formData.end_date)} يوم
            </Alert>
          )}
        </Box>
      </UniversalFormDialog>

      {/* حوار تأكيد الحذف */}
      <UniversalFormDialog
        open={deleteDialogOpen}
        title="تأكيد الحذف"
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedLeave(null);
        }}
        onSubmit={handleDelete}
        maxWidth="sm"
        submitText="حذف"
        submitColor="error"
      >
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <LeaveIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Box>
            هل أنت متأكد من حذف إجازة العامل:
            <br />
            <strong>{selectedLeave?.worker?.name}</strong>
            <br />
            من: <strong>{selectedLeave?.start_date}</strong> إلى: <strong>{selectedLeave?.end_date}</strong>؟
          </Box>
        </Box>
      </UniversalFormDialog>
    </Box>
  );
};

export default LeavesPageSimplified;
