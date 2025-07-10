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
  Description as LicenseIcon,
  Business as CompanyIcon,
  CalendarToday as CalendarIcon
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

interface License {
  id: number;
  name: string;
  license_number: string;
  civil_id: string;
  licenseType: string;
  status: string;
  issue_date: string;
  expiryDate: string;
  issuing_authority: string;
  labor_count: number;
  address: string;
  company_id: number;
  company?: { file_name: string };
}

interface Company {
  id: number;
  file_name: string;
}

const LicensesPageSimplified: React.FC = () => {
  const api = useApi();
  
  // الحالات الأساسية
  const [licenses, setLicenses] = useState<License[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // حالات الحوار
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  
  // حالات النموذج
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    civil_id: '',
    licenseType: '',
    status: '',
    issue_date: '',
    expiryDate: '',
    issuing_authority: '',
    labor_count: 0,
    address: '',
    company_id: ''
  });
  
  // حالات الفلترة
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  // جلب البيانات
  useEffect(() => {
    fetchLicenses();
    fetchCompanies();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const data = await api.licenses.getAll();
      setLicenses(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في جلب بيانات التراخيص');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await api.companies.getAll();
      setCompanies(data);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
    }
  };

  // تعريف الأعمدة
  const columns: Column[] = [
    {
      id: 'license_number',
      label: 'رقم الترخيص',
      width: 130,
    },
    {
      id: 'name',
      label: 'اسم صاحب الترخيص',
      width: 180,
    },
    {
      id: 'civil_id',
      label: 'الرقم المدني',
      width: 120,
    },
    {
      id: 'licenseType',
      label: 'نوع الترخيص',
      width: 150,
      render: (value) => (
        <Chip 
          label={value || 'غير محدد'} 
          size="small" 
          color="primary"
        />
      )
    },
    {
      id: 'company',
      label: 'الشركة',
      width: 150,
      render: (value) => (
        <Chip 
          icon={<CompanyIcon />}
          label={value?.file_name || 'غير مربوط'} 
          size="small" 
          color="secondary"
        />
      )
    },
    {
      id: 'labor_count',
      label: 'عدد العمال',
      width: 100,
      align: 'center',
      render: (value) => (
        <Chip 
          label={value || 0} 
          size="small" 
          color="info"
        />
      )
    },
    {
      id: 'expiryDate',
      label: 'تاريخ الانتهاء',
      width: 120,
      render: (value) => {
        const isExpired = new Date(value) < new Date();
        const isExpiringSoon = new Date(value) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        return (
          <Chip 
            icon={<CalendarIcon />}
            label={value ? new Date(value).toLocaleDateString('ar-SA') : 'غير محدد'} 
            size="small" 
            color={isExpired ? 'error' : isExpiringSoon ? 'warning' : 'success'}
          />
        );
      }
    },
    {
      id: 'status',
      label: 'الحالة',
      width: 100,
      render: (value) => (
        <Chip 
          label={value || 'نشط'} 
          size="small" 
          color={value === 'نشط' ? 'success' : value === 'معلق' ? 'warning' : 'error'}
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
      onClick: (license) => {
        setSelectedLicense(license);
        // يمكن إضافة نافذة تفاصيل لاحقاً
      }
    },
    {
      id: 'edit',
      label: 'تعديل',
      icon: <EditIcon />,
      color: 'primary',
      onClick: (license) => {
        setSelectedLicense(license);
        setFormData({
          name: license.name || '',
          license_number: license.license_number || '',
          civil_id: license.civil_id || '',
          licenseType: license.licenseType || '',
          status: license.status || '',
          issue_date: license.issue_date || '',
          expiryDate: license.expiryDate || '',
          issuing_authority: license.issuing_authority || '',
          labor_count: license.labor_count || 0,
          address: license.address || '',
          company_id: license.company_id?.toString() || ''
        });
        setEditDialogOpen(true);
      }
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: (license) => {
        setSelectedLicense(license);
        setDeleteDialogOpen(true);
      }
    }
  ];

  // إضافة ترخيص جديد
  const handleAdd = () => {
    setFormData({
      name: '',
      license_number: '',
      civil_id: '',
      licenseType: '',
      status: 'نشط',
      issue_date: '',
      expiryDate: '',
      issuing_authority: '',
      labor_count: 0,
      address: '',
      company_id: ''
    });
    setAddDialogOpen(true);
  };

  // حفظ ترخيص جديد
  const handleSaveAdd = async () => {
    try {
      const dataToSend = {
        ...formData,
        labor_count: Number(formData.labor_count),
        company_id: formData.company_id ? Number(formData.company_id) : null
      };
      await api.licenses.create(dataToSend);
      await fetchLicenses();
      setAddDialogOpen(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في إضافة الترخيص');
      throw err;
    }
  };

  // حفظ تعديل الترخيص
  const handleSaveEdit = async () => {
    if (!selectedLicense) return;
    
    try {
      const dataToSend = {
        ...formData,
        labor_count: Number(formData.labor_count),
        company_id: formData.company_id ? Number(formData.company_id) : null
      };
      await api.licenses.update(selectedLicense.id, dataToSend);
      await fetchLicenses();
      setEditDialogOpen(false);
      setSelectedLicense(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تعديل الترخيص');
      throw err;
    }
  };

  // حذف الترخيص
  const handleDelete = async () => {
    if (!selectedLicense) return;
    
    try {
      await api.licenses.delete(selectedLicense.id);
      await fetchLicenses();
      setDeleteDialogOpen(false);
      setSelectedLicense(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في حذف الترخيص');
      throw err;
    }
  };

  // فلترة البيانات
  const filteredLicenses = licenses.filter(license => {
    const matchesStatus = !filterStatus || license.status === filterStatus;
    const matchesType = !filterType || license.licenseType === filterType;
    const matchesCompany = !filterCompany || license.company_id?.toString() === filterCompany;
    
    return matchesStatus && matchesType && matchesCompany;
  });

  // خيارات التراخيص
  const licenseTypes = [
    'رخصة تجارية',
    'رخصة صناعية',
    'رخصة مهنية',
    'رخصة خدمية',
    'أخرى'
  ];

  const statusOptions = [
    'نشط',
    'معلق',
    'منتهي الصلاحية',
    'ملغي'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* رسائل الخطأ */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* فلاتر البحث */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>الحالة</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="الحالة"
          >
            <MenuItem value="">الكل</MenuItem>
            {statusOptions.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>نوع الترخيص</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="نوع الترخيص"
          >
            <MenuItem value="">الكل</MenuItem>
            {licenseTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>الشركة</InputLabel>
          <Select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            label="الشركة"
          >
            <MenuItem value="">الكل</MenuItem>
            {companies.map(company => (
              <MenuItem key={company.id} value={company.id.toString()}>
                {company.file_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* جدول البيانات */}
      <UniversalDataTable
        title="إدارة التراخيص"
        data={filteredLicenses}
        columns={columns}
        actions={actions}
        loading={loading}
        onAdd={handleAdd}
        searchPlaceholder="البحث في التراخيص..."
        emptyMessage="لا توجد تراخيص مسجلة"
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* حوار إضافة ترخيص */}
      <UniversalFormDialog
        open={addDialogOpen}
        title="إضافة ترخيص جديد"
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleSaveAdd}
        maxWidth="md"
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          <TextField
            fullWidth
            label="رقم الترخيص *"
            value={formData.license_number}
            onChange={(e) => setFormData({...formData, license_number: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            label="اسم صاحب الترخيص *"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            label="الرقم المدني *"
            value={formData.civil_id}
            onChange={(e) => setFormData({...formData, civil_id: e.target.value})}
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>نوع الترخيص</InputLabel>
            <Select
              value={formData.licenseType}
              onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
              label="نوع الترخيص"
            >
              {licenseTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>الشركة</InputLabel>
            <Select
              value={formData.company_id}
              onChange={(e) => setFormData({...formData, company_id: e.target.value})}
              label="الشركة"
            >
              <MenuItem value="">بدون شركة</MenuItem>
              {companies.map(company => (
                <MenuItem key={company.id} value={company.id.toString()}>
                  {company.file_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="تاريخ الإصدار"
            type="date"
            value={formData.issue_date}
            onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            label="تاريخ الانتهاء"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            label="جهة الإصدار"
            value={formData.issuing_authority}
            onChange={(e) => setFormData({...formData, issuing_authority: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="عدد العمال المسموح"
            type="number"
            value={formData.labor_count}
            onChange={(e) => setFormData({...formData, labor_count: Number(e.target.value)})}
          />
          
          <TextField
            fullWidth
            label="العنوان"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            multiline
            rows={2}
          />
          
          <FormControl fullWidth>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              label="الحالة"
            >
              {statusOptions.map(status => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </UniversalFormDialog>

      {/* حوار تعديل ترخيص */}
      <UniversalFormDialog
        open={editDialogOpen}
        title={`تعديل ترخيص: ${selectedLicense?.name}`}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedLicense(null);
        }}
        onSubmit={handleSaveEdit}
        maxWidth="md"
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          <TextField
            fullWidth
            label="رقم الترخيص *"
            value={formData.license_number}
            onChange={(e) => setFormData({...formData, license_number: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            label="اسم صاحب الترخيص *"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            label="الرقم المدني *"
            value={formData.civil_id}
            onChange={(e) => setFormData({...formData, civil_id: e.target.value})}
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>نوع الترخيص</InputLabel>
            <Select
              value={formData.licenseType}
              onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
              label="نوع الترخيص"
            >
              {licenseTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>الشركة</InputLabel>
            <Select
              value={formData.company_id}
              onChange={(e) => setFormData({...formData, company_id: e.target.value})}
              label="الشركة"
            >
              <MenuItem value="">بدون شركة</MenuItem>
              {companies.map(company => (
                <MenuItem key={company.id} value={company.id.toString()}>
                  {company.file_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="تاريخ الإصدار"
            type="date"
            value={formData.issue_date}
            onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            label="تاريخ الانتهاء"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            label="جهة الإصدار"
            value={formData.issuing_authority}
            onChange={(e) => setFormData({...formData, issuing_authority: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="عدد العمال المسموح"
            type="number"
            value={formData.labor_count}
            onChange={(e) => setFormData({...formData, labor_count: Number(e.target.value)})}
          />
          
          <TextField
            fullWidth
            label="العنوان"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            multiline
            rows={2}
          />
          
          <FormControl fullWidth>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              label="الحالة"
            >
              {statusOptions.map(status => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </UniversalFormDialog>

      {/* حوار تأكيد الحذف */}
      <UniversalFormDialog
        open={deleteDialogOpen}
        title="تأكيد الحذف"
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedLicense(null);
        }}
        onSubmit={handleDelete}
        submitLabel="حذف"
        maxWidth="sm"
      >
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <LicenseIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Box>
            هل أنت متأكد من حذف ترخيص <strong>{selectedLicense?.name}</strong>؟
          </Box>
          <Box sx={{ mt: 1, color: 'text.secondary' }}>
            سيتم حذف جميع البيانات المرتبطة بهذا الترخيص نهائياً ولا يمكن التراجع عن هذا الإجراء.
          </Box>
        </Box>
      </UniversalFormDialog>
    </Box>
  );
};

export default LicensesPageSimplified;
