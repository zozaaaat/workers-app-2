import React, { useEffect, useState, useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, Assignment as LicenseIcon, UploadFile as UploadFileIcon, CameraAlt as CameraAltIcon } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Typography, Box, Chip, Tooltip, IconButton } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { PageLayout, StandardTable, ActionButtons, StatusChip, SearchAndFilter } from "../../components/common";

interface License {
  id: number;
  license_number: string;
  licenseType: string;
  name: string;
  civil_id: string;
  issuing_authority: string;
  issue_date: string;
  expiryDate: string;
  status: string;
  labor_count: number;
  address: string;
  company_id: number;
  company?: {
    file_name: string;
    name: string;
  };
}

const LicensesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  // State للبيانات
  const [licenses, setLicenses] = useState<License[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  // State للعمليات
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);

  // حساب حالة الترخيص
  const getLicenseStatus = (license: License) => {
    const today = new Date();
    const expiryDate = new Date(license.expiryDate);
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return 'منتهي';
    } else if (daysLeft <= 30) {
      return 'قريب الانتهاء';
    } else {
      return 'نشط';
    }
  };

  // فلترة البيانات
  const filteredLicenses = useMemo(() => {
    return licenses.filter(license => {
      const matchesSearch = !searchTerm || 
        (license.name && license.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (license.license_number && license.license_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (license.civil_id && license.civil_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (license.licenseType && license.licenseType.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !filterStatus || getLicenseStatus(license) === filterStatus;
      const matchesType = !filterType || license.licenseType === filterType;
      const matchesCompany = !filterCompany || (license.company_id && license.company_id.toString() === filterCompany);
      
      return matchesSearch && matchesStatus && matchesType && matchesCompany;
    });
  }, [licenses, searchTerm, filterStatus, filterType, filterCompany]);

  // الأعمدة
  const columns: GridColDef[] = [
    { field: "license_number", headerName: t("licenseNumber") || "رقم الترخيص", width: 130 },
    { field: "name", headerName: t("name") || "الاسم", width: 150 },
    { field: "civil_id", headerName: t("civilId") || "الرقم المدني", width: 120 },
    { field: "licenseType", headerName: t("licenseType") || "نوع الترخيص", width: 130 },
    { field: "issuing_authority", headerName: t("issuingAuthority") || "الجهة المُصدرة", width: 130 },
    { 
      field: "issue_date", 
      headerName: t("issueDate") || "تاريخ الإصدار", 
      width: 120, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    { 
      field: "expiryDate", 
      headerName: t("expiryDate") || "تاريخ الانتهاء", 
      width: 130, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      },
      renderCell: (params: any) => {
        const endDate = new Date(params.value);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isExpiringSoon = diffDays <= 15 && diffDays > 0;
        const isExpired = diffDays < 0;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{params.value ? new Date(params.value).toLocaleDateString('ar-SA') : ''}</span>
            {isExpiringSoon && (
              <Tooltip title={`ينتهي خلال ${diffDays} يوم`}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'warning.main' 
                }} />
              </Tooltip>
            )}
            {isExpired && (
              <Tooltip title="منتهي الصلاحية">
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'error.main' 
                }} />
              </Tooltip>
            )}
          </Box>
        );
      }
    },
    { field: "labor_count", headerName: t("laborCount") || "عدد العمال", width: 100, type: 'number' },
    { field: "address", headerName: t("address") || "العنوان", width: 150 },
    {
      field: "company_name",
      headerName: t("company") || "الشركة",
      width: 150,
      valueGetter: (params: any) => {
        const company = companies.find(c => c.id === params.row.company_id);
        return company ? company.file_name || company.name : '';
      }
    },
    {
      field: "status",
      headerName: t("status") || "الحالة",
      width: 130,
      renderCell: (params: any) => (
        <StatusChip status={getLicenseStatus(params.row)} />
      )
    },
    {
      field: "actions",
      headerName: t("actions") || "العمليات",
      width: 200,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ActionButtons
            onEdit={() => handleEdit(params.row)}
            onDelete={() => handleDelete(params.row.id)}
            onView={() => handleViewDetails(params.row)}
            canEdit={canEdit}
            canDelete={canEdit}
            showView={true}
          />
          <Tooltip title="رفع مستند">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleUploadDocument(params.row)}
            >
              <UploadFileIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="قراءة OCR">
            <IconButton 
              size="small" 
              color="secondary"
              onClick={() => handleOCR(params.row)}
            >
              <CameraAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // تحميل البيانات
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [licensesRes, companiesRes] = await Promise.all([
        axios.get(`${API_URL}/licenses`),
        axios.get(`${API_URL}/companies`)
      ]);
      
      setLicenses(licensesRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      setError(t('loadError') || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // العمليات
  const handleEdit = (license: License) => {
    // TODO: إضافة حوار التعديل
    console.log('Edit license:', license);
    setError('TODO: إضافة حوار التعديل');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleViewDetails = (license: License) => {
    setSelectedLicense(license);
    setDetailsOpen(true);
  };

  // ✅ checked - إضافة دالة رفع الملفات للتراخيص
  const handleUploadDocument = (license: License) => {
    // TODO: إضافة حوار رفع الملفات
    console.log('Upload document for license:', license);
    setSuccess('TODO: إضافة حوار رفع الملفات للترخيص: ' + license.name);
  };

  // ✅ checked - إضافة دالة OCR للتراخيص
  const handleOCR = (license: License) => {
    // TODO: إضافة حوار OCR لقراءة البيانات
    console.log('OCR for license:', license);
    setSuccess('TODO: إضافة حوار OCR لقراءة البيانات للترخيص: ' + license.name);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/licenses/${deleteId}`);
      setLicenses(licenses.filter(l => l.id !== deleteId));
      setSuccess(t('deleteSuccess') || 'تم الحذف بنجاح');
    } catch (error) {
      setError(t('deleteError') || 'خطأ في الحذف');
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // مسح المرشحات
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterType('');
    setFilterCompany('');
  };

  // عدد المرشحات النشطة
  const activeFiltersCount = [filterStatus, filterType, filterCompany].filter(Boolean).length;

  // الحصول على قيم فريدة للفلترة
  const uniqueTypes = [...new Set(licenses.map(l => l.licenseType).filter(Boolean))];
  
  // إحصائيات الحالة
  const statusStats = licenses.reduce((acc, license) => {
    const status = getLicenseStatus(license);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إعدادات البحث والفلترة
  const filterOptions = [
    {
      label: t('status') || 'الحالة',
      value: filterStatus,
      options: [
        { value: 'نشط', label: 'نشط' },
        { value: 'قريب الانتهاء', label: 'قريب الانتهاء' },
        { value: 'منتهي', label: 'منتهي' }
      ],
      onChange: setFilterStatus
    },
    {
      label: t('licenseType') || 'نوع الترخيص',
      value: filterType,
      options: uniqueTypes.map(type => ({ value: type, label: type })),
      onChange: setFilterType
    },
    {
      label: t('company') || 'الشركة',
      value: filterCompany,
      options: companies.map(c => ({ value: c.id.toString(), label: c.file_name || c.name })),
      onChange: setFilterCompany
    }
  ];

  return (
    <PageLayout
      title={t('licenses') || 'التراخيص'}
      actions={
        canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setError('TODO: إضافة حوار الإضافة')}
          >
            {t('addLicense') || 'إضافة ترخيص'}
          </Button>
        )
      }
      headerContent={
        <Box>
          <SearchAndFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filterOptions}
            onClear={clearFilters}
            activeFiltersCount={activeFiltersCount}
          />
          
          {/* إحصائيات سريعة */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Chip 
              label={`إجمالي التراخيص: ${licenses.length}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`نشط: ${statusStats['نشط'] || 0}`}
              color="success"
              variant="outlined"
            />
            <Chip 
              label={`قريب الانتهاء: ${statusStats['قريب الانتهاء'] || 0}`}
              color="warning"
              variant="outlined"
            />
            <Chip 
              label={`منتهي: ${statusStats['منتهي'] || 0}`}
              color="error"
              variant="outlined"
            />
          </Box>
        </Box>
      }
    >
      <StandardTable
        rows={filteredLicenses}
        columns={columns}
        loading={loading}
        height={600}
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

      {/* حوار تأكيد الحذف */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('confirmDelete') || 'تأكيد الحذف'}</DialogTitle>
        <DialogContent>
          <Typography>{t('deleteConfirmMessage') || 'هل أنت متأكد من حذف هذا الترخيص؟'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            {t('cancel') || 'إلغاء'}
          </Button>
          <Button onClick={confirmDelete} color="error">
            {t('delete') || 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار تفاصيل الترخيص */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LicenseIcon />
          {t('licenseDetails') || 'تفاصيل الترخيص'} - {selectedLicense?.license_number}
        </DialogTitle>
        <DialogContent>
          {selectedLicense && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Typography><strong>الاسم:</strong> {selectedLicense.name}</Typography>
                <Typography><strong>الرقم المدني:</strong> {selectedLicense.civil_id}</Typography>
                <Typography><strong>نوع الترخيص:</strong> {selectedLicense.licenseType}</Typography>
                <Typography><strong>الجهة المصدرة:</strong> {selectedLicense.issuing_authority}</Typography>
                <Typography><strong>تاريخ الإصدار:</strong> {new Date(selectedLicense.issue_date).toLocaleDateString('ar-SA')}</Typography>
                <Typography><strong>تاريخ الانتهاء:</strong> {new Date(selectedLicense.expiryDate).toLocaleDateString('ar-SA')}</Typography>
                <Typography><strong>عدد العمال:</strong> {selectedLicense.labor_count}</Typography>
                <Typography><strong>العنوان:</strong> {selectedLicense.address}</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <StatusChip status={getLicenseStatus(selectedLicense)} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            {t('close') || 'إغلاق'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default LicensesPage;
