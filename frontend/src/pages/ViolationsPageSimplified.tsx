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
  Warning as ViolationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MoneyOff as PenaltyIcon
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

interface Violation {
  id: number;
  worker_id: number;
  description: string;
  penalty_amount: number;
  date: string;
  worker?: { name: string; civil_id: string };
}

interface Worker {
  id: number;
  name: string;
  civil_id: string;
}

const ViolationsPageSimplified: React.FC = () => {
  const api = useApi();
  
  // الحالات الأساسية
  const [violations, setViolations] = useState<Violation[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // حالات الحوار
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  
  // حالات النموذج
  const [formData, setFormData] = useState({
    worker_id: '',
    description: '',
    penalty_amount: '',
    date: ''
  });
  
  // حالات الفلترة
  const [filterWorker, setFilterWorker] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // أنواع المخالفات الشائعة
  const commonViolations = [
    'التأخير عن العمل',
    'الغياب بدون إذن',
    'عدم الالتزام بزي العمل',
    'مخالفة قوانين السلامة',
    'سوء استخدام المعدات',
    'عدم احترام زملاء العمل',
    'استخدام الهاتف أثناء العمل',
    'ترك موقع العمل بدون إذن',
    'أخرى'
  ];

  // جلب البيانات
  useEffect(() => {
    fetchViolations();
    fetchWorkers();
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const data = await api.workers.getAll(); // سنعدل هذا لاحقاً
      setViolations([]);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في جلب بيانات المخالفات');
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
      label: 'تاريخ المخالفة',
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
      id: 'description',
      label: 'وصف المخالفة',
      width: 250,
      render: (value) => (
        <Chip 
          icon={<ViolationIcon />}
          label={value ? (value.length > 30 ? `${value.substring(0, 30)}...` : value) : 'غير محدد'} 
          size="small" 
          color="warning"
        />
      )
    },
    {
      id: 'penalty_amount',
      label: 'مبلغ الغرامة',
      width: 130,
      align: 'center',
      render: (value) => (
        <Chip 
          icon={<PenaltyIcon />}
          label={`${value || 0} د.ك`} 
          size="small" 
          color={value > 0 ? 'error' : 'default'}
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
      onClick: (violation) => {
        setSelectedViolation(violation);
        // يمكن إضافة نافذة تفاصيل لاحقاً
      }
    },
    {
      id: 'edit',
      label: 'تعديل',
      icon: <EditIcon />,
      color: 'primary',
      onClick: (violation) => {
        setSelectedViolation(violation);
        setFormData({
          worker_id: violation.worker_id?.toString() || '',
          description: violation.description || '',
          penalty_amount: violation.penalty_amount?.toString() || '',
          date: violation.date || ''
        });
        setEditDialogOpen(true);
      }
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: (violation) => {
        setSelectedViolation(violation);
        setDeleteDialogOpen(true);
      }
    }
  ];

  // إضافة مخالفة جديدة
  const handleAdd = () => {
    setFormData({
      worker_id: '',
      description: '',
      penalty_amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setAddDialogOpen(true);
  };

  // حفظ مخالفة جديدة
  const handleSaveAdd = async () => {
    try {
      const dataToSend = {
        ...formData,
        worker_id: Number(formData.worker_id),
        penalty_amount: Number(formData.penalty_amount) || 0
      };
      // await api.violations.create(dataToSend);
      await fetchViolations();
      setAddDialogOpen(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في إضافة المخالفة');
      throw err;
    }
  };

  // حفظ تعديل المخالفة
  const handleSaveEdit = async () => {
    if (!selectedViolation) return;
    
    try {
      const dataToSend = {
        ...formData,
        worker_id: Number(formData.worker_id),
        penalty_amount: Number(formData.penalty_amount) || 0
      };
      // await api.violations.update(selectedViolation.id, dataToSend);
      await fetchViolations();
      setEditDialogOpen(false);
      setSelectedViolation(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تعديل المخالفة');
      throw err;
    }
  };

  // حذف المخالفة
  const handleDelete = async () => {
    if (!selectedViolation) return;
    
    try {
      // await api.violations.delete(selectedViolation.id);
      await fetchViolations();
      setDeleteDialogOpen(false);
      setSelectedViolation(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في حذف المخالفة');
    }
  };

  // تطبيق الفلاتر
  const filteredViolations = violations.filter(violation => {
    const matchesWorker = !filterWorker || violation.worker_id?.toString() === filterWorker;
    const matchesMonth = !filterMonth || (violation.date && violation.date.startsWith(filterMonth));
    
    return matchesWorker && matchesMonth;
  });

  // إحصائيات سريعة
  const totalViolations = filteredViolations.length;
  const totalPenalties = filteredViolations.reduce((sum, violation) => sum + (violation.penalty_amount || 0), 0);
  const avgPenalty = totalViolations > 0 ? Math.round(totalPenalties / totalViolations * 100) / 100 : 0;

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
          icon={<ViolationIcon />}
          label={`إجمالي المخالفات: ${totalViolations}`} 
          color="primary" 
          size="medium"
        />
        <Chip 
          icon={<PenaltyIcon />}
          label={`إجمالي الغرامات: ${totalPenalties} د.ك`} 
          color="error" 
          size="medium"
        />
        <Chip 
          label={`متوسط الغرامة: ${avgPenalty} د.ك`} 
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
        title="إدارة المخالفات"
        data={filteredViolations}
        columns={columns}
        actions={actions}
        loading={loading}
        onAdd={handleAdd}
        searchPlaceholder="البحث في المخالفات..."
        emptyMessage="لا توجد مخالفات مسجلة"
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* حوار إضافة مخالفة */}
      <UniversalFormDialog
        open={addDialogOpen}
        title="إضافة مخالفة جديدة"
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
            label="تاريخ المخالفة *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <FormControl fullWidth>
            <InputLabel>نوع المخالفة</InputLabel>
            <Select
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              label="نوع المخالفة"
            >
              {commonViolations.map(violation => (
                <MenuItem key={violation} value={violation}>
                  {violation}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="وصف مخصص للمخالفة"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="أو اكتب وصف مخصص للمخالفة..."
          />
          
          <TextField
            fullWidth
            label="مبلغ الغرامة"
            type="number"
            value={formData.penalty_amount}
            onChange={(e) => setFormData({...formData, penalty_amount: e.target.value})}
            InputProps={{
              startAdornment: <InputAdornment position="start">د.ك</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>
      </UniversalFormDialog>

      {/* حوار تعديل مخالفة */}
      <UniversalFormDialog
        open={editDialogOpen}
        title={`تعديل مخالفة: ${selectedViolation?.worker?.name}`}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedViolation(null);
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
            label="تاريخ المخالفة *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <FormControl fullWidth>
            <InputLabel>نوع المخالفة</InputLabel>
            <Select
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              label="نوع المخالفة"
            >
              {commonViolations.map(violation => (
                <MenuItem key={violation} value={violation}>
                  {violation}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="وصف مخصص للمخالفة"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="أو اكتب وصف مخصص للمخالفة..."
          />
          
          <TextField
            fullWidth
            label="مبلغ الغرامة"
            type="number"
            value={formData.penalty_amount}
            onChange={(e) => setFormData({...formData, penalty_amount: e.target.value})}
            InputProps={{
              startAdornment: <InputAdornment position="start">د.ك</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>
      </UniversalFormDialog>

      {/* حوار تأكيد الحذف */}
      <UniversalFormDialog
        open={deleteDialogOpen}
        title="تأكيد الحذف"
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedViolation(null);
        }}
        onSubmit={handleDelete}
        maxWidth="sm"
      >
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <ViolationIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Box>
            هل أنت متأكد من حذف مخالفة العامل:
            <br />
            <strong>{selectedViolation?.worker?.name}</strong>
            <br />
            بتاريخ: <strong>{selectedViolation?.date}</strong>؟
          </Box>
        </Box>
      </UniversalFormDialog>
    </Box>
  );
};

export default ViolationsPageSimplified;
