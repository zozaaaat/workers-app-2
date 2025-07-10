import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  EventBusy as AbsenceIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MoneyOff as DeductionIcon
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

interface Absence {
  id: number;
  worker_id: number;
  date: string;
  reason: string;
  is_excused: boolean;
  deduction_id?: number;
  worker?: { name: string; civil_id: string };
}

interface Worker {
  id: number;
  name: string;
  civil_id: string;
}

const AbsencesPageSimplified: React.FC = () => {
  const api = useApi();
  
  // الحالات الأساسية
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // حالات الحوار
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  
  // حالات النموذج
  const [formData, setFormData] = useState({
    worker_id: '',
    date: '',
    reason: '',
    is_excused: false
  });
  
  // حالات الفلترة
  const [filterWorker, setFilterWorker] = useState('');
  const [filterExcused, setFilterExcused] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // خيارات أسباب الغياب
  const absenceReasons = [
    'مرض',
    'ظروف شخصية',
    'إجازة طارئة',
    'عذر عائلي',
    'موعد طبي',
    'غياب بدون عذر',
    'أخرى'
  ];

  // جلب البيانات
  useEffect(() => {
    fetchAbsences();
    fetchWorkers();
  }, []);

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const data = await api.absences.getAll();
      setAbsences(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في جلب بيانات الغيابات');
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
      id: 'date',
      label: 'تاريخ الغياب',
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
      id: 'reason',
      label: 'سبب الغياب',
      width: 150,
      render: (value) => (
        <Chip 
          label={value || 'غير محدد'} 
          size="small" 
          color="secondary"
        />
      )
    },
    {
      id: 'is_excused',
      label: 'نوع الغياب',
      width: 120,
      align: 'center',
      render: (value) => (
        <Chip 
          icon={value ? <AbsenceIcon /> : <DeductionIcon />}
          label={value ? 'بعذر' : 'بدون عذر'} 
          size="small" 
          color={value ? 'success' : 'error'}
        />
      )
    },
    {
      id: 'deduction_id',
      label: 'خصم مرتبط',
      width: 100,
      align: 'center',
      render: (value) => (
        <Chip 
          label={value ? 'نعم' : 'لا'} 
          size="small" 
          color={value ? 'warning' : 'default'}
        />
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
      onClick: (absence) => {
        setSelectedAbsence(absence);
        // يمكن إضافة نافذة تفاصيل لاحقاً
      }
    },
    {
      id: 'edit',
      label: 'تعديل',
      icon: <EditIcon />,
      color: 'primary',
      onClick: (absence) => {
        setSelectedAbsence(absence);
        setFormData({
          worker_id: absence.worker_id?.toString() || '',
          date: absence.date || '',
          reason: absence.reason || '',
          is_excused: absence.is_excused || false
        });
        setEditDialogOpen(true);
      }
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: (absence) => {
        setSelectedAbsence(absence);
        setDeleteDialogOpen(true);
      }
    }
  ];

  // إضافة غياب جديد
  const handleAdd = () => {
    setFormData({
      worker_id: '',
      date: '',
      reason: '',
      is_excused: false
    });
    setAddDialogOpen(true);
  };

  // حفظ غياب جديد
  const handleSaveAdd = async () => {
    try {
      const dataToSend = {
        ...formData,
        worker_id: Number(formData.worker_id)
      };
      await api.absences.create(dataToSend);
      await fetchAbsences();
      setAddDialogOpen(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في إضافة الغياب');
      throw err;
    }
  };

  // حفظ تعديل الغياب
  const handleSaveEdit = async () => {
    if (!selectedAbsence) return;
    
    try {
      const dataToSend = {
        ...formData,
        worker_id: Number(formData.worker_id)
      };
      await api.absences.update(selectedAbsence.id, dataToSend);
      await fetchAbsences();
      setEditDialogOpen(false);
      setSelectedAbsence(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تعديل الغياب');
      throw err;
    }
  };

  // حذف الغياب
  const handleDelete = async () => {
    if (!selectedAbsence) return;
    
    try {
      await api.absences.delete(selectedAbsence.id);
      await fetchAbsences();
      setDeleteDialogOpen(false);
      setSelectedAbsence(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في حذف الغياب');
    }
  };

  // تطبيق الفلاتر
  const filteredAbsences = absences.filter(absence => {
    const matchesWorker = !filterWorker || absence.worker_id?.toString() === filterWorker;
    const matchesExcused = !filterExcused || absence.is_excused.toString() === filterExcused;
    const matchesMonth = !filterMonth || (absence.date && absence.date.startsWith(filterMonth));
    
    return matchesWorker && matchesExcused && matchesMonth;
  });

  // إحصائيات سريعة
  const totalAbsences = filteredAbsences.length;
  const excusedAbsences = filteredAbsences.filter(a => a.is_excused).length;
  const unexcusedAbsences = totalAbsences - excusedAbsences;

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
          icon={<AbsenceIcon />}
          label={`إجمالي الغيابات: ${totalAbsences}`} 
          color="primary" 
          size="medium"
        />
        <Chip 
          label={`بعذر: ${excusedAbsences}`} 
          color="success" 
          size="medium"
        />
        <Chip 
          label={`بدون عذر: ${unexcusedAbsences}`} 
          color="error" 
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
          <InputLabel>نوع الغياب</InputLabel>
          <Select
            value={filterExcused}
            onChange={(e) => setFilterExcused(e.target.value)}
            label="نوع الغياب"
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="true">بعذر</MenuItem>
            <MenuItem value="false">بدون عذر</MenuItem>
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
        title="إدارة الغيابات"
        data={filteredAbsences}
        columns={columns}
        actions={actions}
        loading={loading}
        onAdd={handleAdd}
        searchPlaceholder="البحث في الغيابات..."
        emptyMessage="لا توجد غيابات مسجلة"
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* حوار إضافة غياب */}
      <UniversalFormDialog
        open={addDialogOpen}
        title="إضافة غياب جديد"
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
          
          <TextField
            fullWidth
            required
            label="تاريخ الغياب *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <FormControl fullWidth>
            <InputLabel>سبب الغياب</InputLabel>
            <Select
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              label="سبب الغياب"
            >
              {absenceReasons.map(reason => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_excused}
                onChange={(e) => setFormData({...formData, is_excused: e.target.checked})}
                color="success"
              />
            }
            label="غياب بعذر"
          />
        </Box>
      </UniversalFormDialog>

      {/* حوار تعديل غياب */}
      <UniversalFormDialog
        open={editDialogOpen}
        title={`تعديل غياب: ${selectedAbsence?.worker?.name}`}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedAbsence(null);
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
          
          <TextField
            fullWidth
            required
            label="تاريخ الغياب *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <FormControl fullWidth>
            <InputLabel>سبب الغياب</InputLabel>
            <Select
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              label="سبب الغياب"
            >
              {absenceReasons.map(reason => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_excused}
                onChange={(e) => setFormData({...formData, is_excused: e.target.checked})}
                color="success"
              />
            }
            label="غياب بعذر"
          />
        </Box>
      </UniversalFormDialog>

      {/* حوار تأكيد الحذف */}
      <UniversalFormDialog
        open={deleteDialogOpen}
        title="تأكيد الحذف"
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedAbsence(null);
        }}
        onSubmit={handleDelete}
        maxWidth="sm"
        submitText="حذف"
        submitColor="error"
      >
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <AbsenceIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Box>
            هل أنت متأكد من حذف غياب العامل:
            <br />
            <strong>{selectedAbsence?.worker?.name}</strong>
            <br />
            بتاريخ: <strong>{selectedAbsence?.date}</strong>؟
          </Box>
        </Box>
      </UniversalFormDialog>
    </Box>
  );
};

export default AbsencesPageSimplified;
