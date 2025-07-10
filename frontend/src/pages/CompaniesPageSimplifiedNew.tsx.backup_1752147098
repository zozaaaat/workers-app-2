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
  Business as BusinessIcon,
  Group as GroupIcon,
  Description as DescriptionIcon
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

interface Company {
  id: number;
  file_number: string;
  file_status?: string;
  creation_date?: string;
  commercial_registration_number?: string;
  file_name?: string;
  file_classification?: string;
  administration?: string;
  file_type?: string;
  legal_entity?: string;
  ownership_category?: string;
  total_workers?: number;
  total_licenses?: number;
  email?: string;
  phone?: string;
}

const CompaniesPageSimplified: React.FC = () => {
  const api = useApi();
  
  // الحالات الأساسية
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // حالات الحوار
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // حالات النموذج
  const [formData, setFormData] = useState({
    file_number: '',
    file_name: '',
    commercial_registration_number: '',
    file_classification: '',
    administration: '',
    file_type: '',
    legal_entity: '',
    ownership_category: '',
    email: '',
    phone: ''
  });
  
  // حالات الفلترة
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClassification, setFilterClassification] = useState('');

  // جلب البيانات
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.companies.getAll();
      setCompanies(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في جلب بيانات الشركات');
    } finally {
      setLoading(false);
    }
  };

  // تعريف الأعمدة
  const columns: Column[] = [
    {
      id: 'file_number',
      label: 'رقم الملف',
      width: 120,
    },
    {
      id: 'file_name',
      label: 'اسم الشركة',
      width: 200,
    },
    {
      id: 'commercial_registration_number',
      label: 'رقم السجل التجاري',
      width: 150,
    },
    {
      id: 'file_classification',
      label: 'تصنيف الملف',
      width: 120,
      render: (value) => (
        <Chip 
          label={value || 'غير محدد'} 
          size="small" 
          color={value ? 'primary' : 'default'}
        />
      )
    },
    {
      id: 'legal_entity',
      label: 'الكيان القانوني',
      width: 150,
    },
    {
      id: 'total_workers',
      label: 'عدد العمال',
      width: 100,
      align: 'center',
      render: (value) => (
        <Chip 
          icon={<GroupIcon />}
          label={value || 0} 
          size="small" 
          color="secondary"
        />
      )
    },
    {
      id: 'total_licenses',
      label: 'عدد التراخيص',
      width: 100,
      align: 'center',
      render: (value) => (
        <Chip 
          icon={<DescriptionIcon />}
          label={value || 0} 
          size="small" 
          color="info"
        />
      )
    },
    {
      id: 'file_status',
      label: 'حالة الملف',
      width: 120,
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
      onClick: (company) => {
        setSelectedCompany(company);
        // يمكن إضافة نافذة تفاصيل لاحقاً
      }
    },
    {
      id: 'edit',
      label: 'تعديل',
      icon: <EditIcon />,
      color: 'primary',
      onClick: (company) => {
        setSelectedCompany(company);
        setFormData({
          file_number: company.file_number || '',
          file_name: company.file_name || '',
          commercial_registration_number: company.commercial_registration_number || '',
          file_classification: company.file_classification || '',
          administration: company.administration || '',
          file_type: company.file_type || '',
          legal_entity: company.legal_entity || '',
          ownership_category: company.ownership_category || '',
          email: company.email || '',
          phone: company.phone || ''
        });
        setEditDialogOpen(true);
      }
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: (company) => {
        setSelectedCompany(company);
        setDeleteDialogOpen(true);
      }
    }
  ];

  // إضافة شركة جديدة
  const handleAdd = () => {
    setFormData({
      file_number: '',
      file_name: '',
      commercial_registration_number: '',
      file_classification: '',
      administration: '',
      file_type: '',
      legal_entity: '',
      ownership_category: '',
      email: '',
      phone: ''
    });
    setAddDialogOpen(true);
  };

  // حفظ شركة جديدة
  const handleSaveAdd = async () => {
    try {
      await api.companies.create(formData);
      await fetchCompanies();
      setAddDialogOpen(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في إضافة الشركة');
      throw err;
    }
  };

  // حفظ تعديل الشركة
  const handleSaveEdit = async () => {
    if (!selectedCompany) return;
    
    try {
      await api.companies.update(selectedCompany.id, formData);
      await fetchCompanies();
      setEditDialogOpen(false);
      setSelectedCompany(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تعديل الشركة');
      throw err;
    }
  };

  // حذف الشركة
  const handleDelete = async () => {
    if (!selectedCompany) return;
    
    try {
      await api.companies.delete(selectedCompany.id);
      await fetchCompanies();
      setDeleteDialogOpen(false);
      setSelectedCompany(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في حذف الشركة');
      throw err;
    }
  };

  // فلترة البيانات
  const filteredCompanies = companies.filter(company => {
    const matchesStatus = !filterStatus || company.file_status === filterStatus;
    const matchesClassification = !filterClassification || company.file_classification === filterClassification;
    
    return matchesStatus && matchesClassification;
  });

  // خيارات التصنيفات
  const classificationOptions = [
    'مؤسسة فردية',
    'شركة محدودة المسؤولية',
    'شركة مساهمة',
    'فرع شركة أجنبية',
    'أخرى'
  ];

  const statusOptions = [
    'نشط',
    'معلق',
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>حالة الملف</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="حالة الملف"
          >
            <MenuItem value="">الكل</MenuItem>
            {statusOptions.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>تصنيف الملف</InputLabel>
          <Select
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value)}
            label="تصنيف الملف"
          >
            <MenuItem value="">الكل</MenuItem>
            {classificationOptions.map(classification => (
              <MenuItem key={classification} value={classification}>
                {classification}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* جدول البيانات */}
      <UniversalDataTable
        title="إدارة الشركات"
        data={filteredCompanies}
        columns={columns}
        actions={actions}
        loading={loading}
        onAdd={handleAdd}
        searchPlaceholder="البحث في الشركات..."
        emptyMessage="لا توجد شركات مسجلة"
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* حوار إضافة شركة */}
      <UniversalFormDialog
        open={addDialogOpen}
        title="إضافة شركة جديدة"
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleSaveAdd}
        maxWidth="md"
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          <TextField
            fullWidth
            label="رقم الملف *"
            value={formData.file_number}
            onChange={(e) => setFormData({...formData, file_number: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            label="اسم الشركة *"
            value={formData.file_name}
            onChange={(e) => setFormData({...formData, file_name: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            label="رقم السجل التجاري"
            value={formData.commercial_registration_number}
            onChange={(e) => setFormData({...formData, commercial_registration_number: e.target.value})}
          />
          
          <FormControl fullWidth>
            <InputLabel>تصنيف الملف</InputLabel>
            <Select
              value={formData.file_classification}
              onChange={(e) => setFormData({...formData, file_classification: e.target.value})}
              label="تصنيف الملف"
            >
              {classificationOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="الإدارة"
            value={formData.administration}
            onChange={(e) => setFormData({...formData, administration: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="نوع الملف"
            value={formData.file_type}
            onChange={(e) => setFormData({...formData, file_type: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="الكيان القانوني"
            value={formData.legal_entity}
            onChange={(e) => setFormData({...formData, legal_entity: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="فئة الملكية"
            value={formData.ownership_category}
            onChange={(e) => setFormData({...formData, ownership_category: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="البريد الإلكتروني"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="رقم الهاتف"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </Box>
      </UniversalFormDialog>

      {/* حوار تعديل شركة */}
      <UniversalFormDialog
        open={editDialogOpen}
        title={`تعديل شركة: ${selectedCompany?.file_name}`}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedCompany(null);
        }}
        onSubmit={handleSaveEdit}
        maxWidth="md"
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          <TextField
            fullWidth
            label="رقم الملف *"
            value={formData.file_number}
            onChange={(e) => setFormData({...formData, file_number: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            label="اسم الشركة *"
            value={formData.file_name}
            onChange={(e) => setFormData({...formData, file_name: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            label="رقم السجل التجاري"
            value={formData.commercial_registration_number}
            onChange={(e) => setFormData({...formData, commercial_registration_number: e.target.value})}
          />
          
          <FormControl fullWidth>
            <InputLabel>تصنيف الملف</InputLabel>
            <Select
              value={formData.file_classification}
              onChange={(e) => setFormData({...formData, file_classification: e.target.value})}
              label="تصنيف الملف"
            >
              {classificationOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="الإدارة"
            value={formData.administration}
            onChange={(e) => setFormData({...formData, administration: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="نوع الملف"
            value={formData.file_type}
            onChange={(e) => setFormData({...formData, file_type: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="الكيان القانوني"
            value={formData.legal_entity}
            onChange={(e) => setFormData({...formData, legal_entity: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="فئة الملكية"
            value={formData.ownership_category}
            onChange={(e) => setFormData({...formData, ownership_category: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="البريد الإلكتروني"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          
          <TextField
            fullWidth
            label="رقم الهاتف"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </Box>
      </UniversalFormDialog>

      {/* حوار تأكيد الحذف */}
      <UniversalFormDialog
        open={deleteDialogOpen}
        title="تأكيد الحذف"
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCompany(null);
        }}
        onSubmit={handleDelete}
        submitLabel="حذف"
        maxWidth="sm"
      >
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <BusinessIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Box>
            هل أنت متأكد من حذف شركة <strong>{selectedCompany?.file_name}</strong>؟
          </Box>
          <Box sx={{ mt: 1, color: 'text.secondary' }}>
            سيتم حذف جميع البيانات المرتبطة بهذه الشركة نهائياً ولا يمكن التراجع عن هذا الإجراء.
          </Box>
        </Box>
      </UniversalFormDialog>
    </Box>
  );
};

export default CompaniesPageSimplified;
