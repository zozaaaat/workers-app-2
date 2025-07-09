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
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

interface Worker {
  id: number;
  name: string;
  civil_id: string;
  nationality: string;
  worker_type: string;
  job_title: string;
  hire_date: string;
  work_permit_start?: string;
  work_permit_end: string;
  salary: number;
  company_id: number;
  license_id: number;
  company?: { file_name: string };
  license?: { name: string };
}

interface Company {
  id: number;
  file_name: string;
}

interface License {
  id: number;
  name: string;
}

const WorkersPageSimplified: React.FC = () => {
  const navigate = useNavigate();
  const api = useApi();
  
  // الحالات الأساسية
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // حالات الحوار
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  
  // حالات النموذج
  const [formData, setFormData] = useState({
    civil_id: '',
    name: '',
    nationality: '',
    worker_type: '',
    job_title: '',
    hire_date: '',
    work_permit_start: '',
    work_permit_end: '',
    salary: 0,
    company_id: '',
    license_id: ''
  });
  
  // حالات الفلترة
  const [filterCompany, setFilterCompany] = useState('');
  const [filterLicense, setFilterLicense] = useState('');

  // تحميل البيانات
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [workersData, companiesData, licensesData] = await Promise.all([
        api.workers.getAll(),
        api.companies.getAll(),
        api.licenses.getAll()
      ]);
      
      setWorkers(workersData);
      setCompanies(companiesData);
      setLicenses(licensesData);
    } catch (err) {
      setError('فشل في تحميل البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // فلترة البيانات
  const filteredWorkers = workers.filter(worker => {
    const companyMatch = !filterCompany || worker.company_id.toString() === filterCompany;
    const licenseMatch = !filterLicense || worker.license_id?.toString() === filterLicense;
    return companyMatch && licenseMatch;
  });

  // تعريف الأعمدة
  const columns: Column[] = [
    { 
      id: 'name', 
      label: 'الاسم', 
      width: 200,
      render: (value, _row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon color="primary" fontSize="small" />
          <span>{value}</span>
        </Box>
      )
    },
    { id: 'civil_id', label: 'الرقم المدني', width: 120 },
    { id: 'nationality', label: 'الجنسية', width: 100 },
    { 
      id: 'worker_type', 
      label: 'نوع العامل', 
      width: 120,
      render: (value) => (
        <Chip 
          label={value} 
          color={value === 'وافد' ? 'primary' : 'secondary'} 
          size="small" 
        />
      )
    },
    { id: 'job_title', label: 'المسمى الوظيفي', width: 150 },
    { 
      id: 'salary', 
      label: 'الراتب', 
      width: 100,
      align: 'right',
      format: (value) => `${value} د.ك`
    },
    { 
      id: 'work_permit_end', 
      label: 'انتهاء الإقامة', 
      width: 120,
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        const today = new Date();
        const daysLeft = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        return (
          <Chip
            label={value}
            color={daysLeft < 30 ? 'error' : daysLeft < 60 ? 'warning' : 'success'}
            size="small"
          />
        );
      }
    },
    { 
      id: 'company_id', 
      label: 'الشركة', 
      width: 180,
      render: (value, _row) => {
        const company = companies.find(c => c.id === value);
        return company?.file_name || value;
      }
    }
  ];

  // تعريف الإجراءات
  const actions: Action[] = [
    {
      id: 'view',
      label: 'عرض التفاصيل',
      icon: <ViewIcon />,
      color: 'info',
      onClick: (worker) => navigate(`/workers/${worker.id}`)
    },
    {
      id: 'edit',
      label: 'تعديل',
      icon: <EditIcon />,
      color: 'primary',
      onClick: handleEdit
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: handleDelete
    }
  ];

  // معالجات الأحداث
  function handleEdit(worker: Worker) {
    setSelectedWorker(worker);
    setFormData({
      civil_id: worker.civil_id,
      name: worker.name,
      nationality: worker.nationality,
      worker_type: worker.worker_type,
      job_title: worker.job_title,
      hire_date: worker.hire_date,
      work_permit_start: worker.work_permit_start || '',
      work_permit_end: worker.work_permit_end,
      salary: worker.salary,
      company_id: worker.company_id.toString(),
      license_id: worker.license_id?.toString() || ''
    });
    setEditDialogOpen(true);
  }

  function handleDelete(worker: Worker) {
    setSelectedWorker(worker);
    setDeleteDialogOpen(true);
  }

  const handleAdd = () => {
    setFormData({
      civil_id: '',
      name: '',
      nationality: '',
      worker_type: '',
      job_title: '',
      hire_date: '',
      work_permit_start: '',
      work_permit_end: '',
      salary: 0,
      company_id: '',
      license_id: ''
    });
    setAddDialogOpen(true);
  };

  const handleSubmitAdd = async () => {
    try {
      await api.workers.create({
        ...formData,
        company_id: parseInt(formData.company_id),
        license_id: formData.license_id ? parseInt(formData.license_id) : null
      });
      setAddDialogOpen(false);
      loadData();
    } catch (err) {
      setError('فشل في إضافة العامل');
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedWorker) return;
    
    try {
      await api.workers.update(selectedWorker.id, {
        ...formData,
        company_id: parseInt(formData.company_id),
        license_id: formData.license_id ? parseInt(formData.license_id) : null
      });
      setEditDialogOpen(false);
      loadData();
    } catch (err) {
      setError('فشل في تحديث العامل');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedWorker) return;
    
    try {
      await api.workers.delete(selectedWorker.id);
      setDeleteDialogOpen(false);
      loadData();
    } catch (err) {
      setError('فشل في حذف العامل');
    }
  };

  const handleExport = async () => {
    // TODO: تنفيذ تصدير البيانات
    console.log('Export workers data');
  };

  // مكون الفلاتر
  const filterComponent = (
    <Box display="flex" gap={2}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>فلترة حسب الشركة</InputLabel>
        <Select
          value={filterCompany}
          label="فلترة حسب الشركة"
          onChange={(e) => setFilterCompany(e.target.value)}
        >
          <MenuItem value="">جميع الشركات</MenuItem>
          {companies.map(company => (
            <MenuItem key={company.id} value={company.id.toString()}>
              {company.file_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>فلترة حسب الترخيص</InputLabel>
        <Select
          value={filterLicense}
          label="فلترة حسب الترخيص"
          onChange={(e) => setFilterLicense(e.target.value)}
        >
          <MenuItem value="">جميع التراخيص</MenuItem>
          {licenses.map(license => (
            <MenuItem key={license.id} value={license.id.toString()}>
              {license.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  // نموذج الإدخال
  const WorkerForm = () => (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        label="الرقم المدني"
        value={formData.civil_id}
        onChange={(e) => setFormData({ ...formData, civil_id: e.target.value })}
        fullWidth
        required
      />
      <TextField
        label="الاسم"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        fullWidth
        required
      />
      <TextField
        label="الجنسية"
        value={formData.nationality}
        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
        fullWidth
        required
      />
      <TextField
        select
        label="نوع العامل"
        value={formData.worker_type}
        onChange={(e) => setFormData({ ...formData, worker_type: e.target.value })}
        fullWidth
        required
      >
        <MenuItem value="وافد">وافد</MenuItem>
        <MenuItem value="مواطن">مواطن</MenuItem>
      </TextField>
      <TextField
        label="المسمى الوظيفي"
        value={formData.job_title}
        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
        fullWidth
        required
      />
      <TextField
        label="تاريخ التعيين"
        type="date"
        value={formData.hire_date}
        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="بداية إذن العمل"
        type="date"
        value={formData.work_permit_start}
        onChange={(e) => setFormData({ ...formData, work_permit_start: e.target.value })}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="انتهاء إذن العمل"
        type="date"
        value={formData.work_permit_end}
        onChange={(e) => setFormData({ ...formData, work_permit_end: e.target.value })}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="الراتب"
        type="number"
        value={formData.salary}
        onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
        fullWidth
        required
      />
      <TextField
        select
        label="الشركة"
        value={formData.company_id}
        onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
        fullWidth
        required
      >
        {companies.map(company => (
          <MenuItem key={company.id} value={company.id.toString()}>
            {company.file_name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="الترخيص"
        value={formData.license_id}
        onChange={(e) => setFormData({ ...formData, license_id: e.target.value })}
        fullWidth
      >
        <MenuItem value="">بدون ترخيص</MenuItem>
        {licenses.map(license => (
          <MenuItem key={license.id} value={license.id.toString()}>
            {license.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );

  return (
    <Box p={3}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <UniversalDataTable
        title="إدارة العمال"
        data={filteredWorkers}
        columns={columns}
        actions={actions}
        loading={loading}
        searchFields={['name', 'civil_id', 'nationality', 'job_title']}
        searchPlaceholder="البحث في العمال..."
        onAdd={handleAdd}
        onExport={handleExport}
        filterComponent={filterComponent}
        emptyMessage="لا يوجد عمال مسجلون"
      />

      {/* حوار الإضافة */}
      <UniversalFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="إضافة عامل جديد"
        onSubmit={handleSubmitAdd}
        maxWidth="md"
      >
        <WorkerForm />
      </UniversalFormDialog>

      {/* حوار التعديل */}
      <UniversalFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title="تعديل بيانات العامل"
        onSubmit={handleSubmitEdit}
        maxWidth="md"
      >
        <WorkerForm />
      </UniversalFormDialog>

      {/* حوار الحذف */}
      <UniversalFormDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="تأكيد الحذف"
        onSubmit={handleConfirmDelete}
        submitLabel="حذف"
        maxWidth="xs"
      >
        <Box textAlign="center" py={2}>
          هل أنت متأكد من حذف العامل <strong>{selectedWorker?.name}</strong>؟
          <br />
          لا يمكن التراجع عن هذا الإجراء.
        </Box>
      </UniversalFormDialog>
    </Box>
  );
};

export default WorkersPageSimplified;
