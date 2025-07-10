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
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  RemoveCircle as DeductionIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
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

interface Deduction {
  id: number;
  worker_id: number;
  amount: number;
  reason: string;
  date: string;
  worker?: { name: string; civil_id: string };
}

interface Worker {
  id: number;
  name: string;
  civil_id: string;
}

const DeductionsPageSimplified: React.FC = () => {
  const api = useApi();
  
  // الحالات الأساسية
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // حالات الحوار
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | null>(null);
  
  // حالات النموذج
  const [formData, setFormData] = useState({
    worker_id: '',
    amount: '',
    reason: '',
    date: ''
  });
  
  // حالات الفلترة
  const [filterWorker, setFilterWorker] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // أسباب الخصم الشائعة
  const deductionReasons = [
    'غياب بدون عذر',
    'التأخير عن العمل',
    'تلف في المعدات',
    'مخالفة قوانين العمل',
    'سلفة على الراتب',
    'تأمينات اجتماعية',
    'ضريبة دخل',
    'غرامة مخالفة',
    'استهلاك شخصي',
    'أخرى'
  ];

  // جلب البيانات
  useEffect(() => {
    fetchDeductions();
    fetchWorkers();
  }, []);

  const fetchDeductions = async () => {
    try {
      setLoading(true);
      // سنستخدم بيانات وهمية الآن
      setDeductions([]);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في جلب بيانات الخصومات');
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
      label: 'تاريخ الخصم',
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
      label: 'سبب الخصم',
      width: 200,
      render: (value) => (
        <Chip 
          icon={<DeductionIcon />}
          label={value ? (value.length > 25 ? `${value.substring(0, 25)}...` : value) : 'غير محدد'} 
          size="small" 
          color="secondary"
        />
      )
    },
    {
      id: 'amount',
      label: 'مبلغ الخصم',
      width: 130,
      align: 'center',
      render: (value) => (
        <Chip 
          icon={<MoneyIcon />}
          label={`${value || 0} د.ك`} 
          size="small" 
          color={value > 50 ? 'error' : value > 20 ? 'warning' : 'default'}
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
      onClick: (deduction) => {
        setSelectedDeduction(deduction);
        // يمكن إضافة نافذة تفاصيل لاحقاً
      }
    },
    {
      id: 'edit',
      label: 'تعديل',
      icon: <EditIcon />,
      color: 'primary',
      onClick: (deduction) => {
        setSelectedDeduction(deduction);
        setFormData({
          worker_id: deduction.worker_id?.toString() || '',
          amount: deduction.amount?.toString() || '',
          reason: deduction.reason || '',
          date: deduction.date || ''
        });
        setEditDialogOpen(true);
      }
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: (deduction) => {
        setSelectedDeduction(deduction);
        setDeleteDialogOpen(true);
      }
    }
  ];

  // إضافة خصم جديد
  const handleAdd = () => {
    setFormData({
      worker_id: '',
      amount: '',
      reason: '',
      date: new Date().toISOString().split('T')[0]
    });
    setAddDialogOpen(true);
  };

  // حفظ خصم جديد
  const handleSaveAdd = async () => {
    try {
      // سنضيف المنطق لاحقاً
      await fetchDeductions();
      setAddDialogOpen(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في إضافة الخصم');
      throw err;
    }
  };

  // حفظ تعديل الخصم
  const handleSaveEdit = async () => {
    if (!selectedDeduction) return;
    
    try {
      // سنضيف المنطق لاحقاً
      await fetchDeductions();
      setEditDialogOpen(false);
      setSelectedDeduction(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تعديل الخصم');
      throw err;
    }
  };

  // حذف الخصم
  const handleDelete = async () => {
    if (!selectedDeduction) return;
    
    try {
      // سنضيف المنطق لاحقاً
      await fetchDeductions();
      setDeleteDialogOpen(false);
      setSelectedDeduction(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في حذف الخصم');
    }
  };

  // تطبيق الفلاتر
  const filteredDeductions = deductions.filter(deduction => {
    const matchesWorker = !filterWorker || deduction.worker_id?.toString() === filterWorker;
    const matchesMonth = !filterMonth || (deduction.date && deduction.date.startsWith(filterMonth));
    
    return matchesWorker && matchesMonth;
  });

  // إحصائيات سريعة
  const totalDeductions = filteredDeductions.length;
  const totalAmount = filteredDeductions.reduce((sum, deduction) => sum + (deduction.amount || 0), 0);
  const avgAmount = totalDeductions > 0 ? Math.round(totalAmount / totalDeductions * 100) / 100 : 0;

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
          icon={<DeductionIcon />}
          label={`إجمالي الخصومات: ${totalDeductions}`} 
          color="primary" 
          size="medium"
        />
        <Chip 
          icon={<MoneyIcon />}
          label={`إجمالي المبلغ: ${totalAmount} د.ك`} 
          color="error" 
          size="medium"
        />
        <Chip 
          label={`متوسط الخصم: ${avgAmount} د.ك`} 
          color="warning" 
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
        title="إدارة الخصومات"
        data={filteredDeductions}
        columns={columns}
        actions={actions}
        loading={loading}
        onAdd={handleAdd}
        searchPlaceholder="البحث في الخصومات..."
        emptyMessage="لا توجد خصومات مسجلة"
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* حوار إضافة خصم */}
      <UniversalFormDialog
        open={addDialogOpen}
        title="إضافة خصم جديد"
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
            label="تاريخ الخصم *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <FormControl fullWidth>
            <InputLabel>سبب الخصم</InputLabel>
            <Select
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              label="سبب الخصم"
            >
              {deductionReasons.map(reason => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="سبب مخصص للخصم"
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            placeholder="أو اكتب سبب مخصص للخصم..."
          />
          
          <TextField
            fullWidth
            required
            label="مبلغ الخصم *"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            InputProps={{
              startAdornment: <InputAdornment position="start">د.ك</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />

          {/* تحذير للمبالغ الكبيرة */}
          {Number(formData.amount) > 100 && (
            <Alert severity="warning">
              تأكد من صحة المبلغ. الخصم أكبر من 100 دينار كويتي.
            </Alert>
          )}
        </Box>
      </UniversalFormDialog>

      {/* حوار تعديل خصم */}
      <UniversalFormDialog
        open={editDialogOpen}
        title={`تعديل خصم: ${selectedDeduction?.worker?.name}`}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedDeduction(null);
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
            label="تاريخ الخصم *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <FormControl fullWidth>
            <InputLabel>سبب الخصم</InputLabel>
            <Select
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              label="سبب الخصم"
            >
              {deductionReasons.map(reason => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="سبب مخصص للخصم"
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            placeholder="أو اكتب سبب مخصص للخصم..."
          />
          
          <TextField
            fullWidth
            required
            label="مبلغ الخصم *"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            InputProps={{
              startAdornment: <InputAdornment position="start">د.ك</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />

          {/* تحذير للمبالغ الكبيرة */}
          {Number(formData.amount) > 100 && (
            <Alert severity="warning">
              تأكد من صحة المبلغ. الخصم أكبر من 100 دينار كويتي.
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
          setSelectedDeduction(null);
        }}
        onSubmit={handleDelete}
        maxWidth="sm"
      >
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <DeductionIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Box>
            هل أنت متأكد من حذف خصم العامل:
            <br />
            <strong>{selectedDeduction?.worker?.name}</strong>
            <br />
            بمبلغ: <strong>{selectedDeduction?.amount} د.ك</strong>
            <br />
            بتاريخ: <strong>{selectedDeduction?.date}</strong>؟
          </Box>
        </Box>
      </UniversalFormDialog>
    </Box>
  );
};

export default DeductionsPageSimplified;
