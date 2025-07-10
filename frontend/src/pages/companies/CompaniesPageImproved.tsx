import React, { useEffect, useState, useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, Folder as FolderIcon, UploadFile as UploadFileIcon, CameraAlt as CameraAltIcon } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Typography, Box, Chip, Tooltip, IconButton } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { PageLayout, StandardTable, ActionButtons, StatusChip, SearchAndFilter } from "../../components/common";

interface Company {
  id: number;
  file_number: string;
  file_status: string;
  creation_date: string;
  commercial_registration_number: string;
  file_name: string;
  file_classification: string;
  administration: string;
  file_type: string;
  legal_entity: string;
  ownership_category: string;
  total_workers: number;
  total_licenses: number;
  email?: string;
  phone?: string;
}

const CompaniesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  // State للبيانات
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterClassification, setFilterClassification] = useState('');

  // State للعمليات
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // فلترة البيانات
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = !searchTerm || 
        company.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.file_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.commercial_registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.administration?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || company.file_status === filterStatus;
      const matchesType = !filterType || company.file_type === filterType;
      const matchesClassification = !filterClassification || company.file_classification === filterClassification;
      
      return matchesSearch && matchesStatus && matchesType && matchesClassification;
    });
  }, [companies, searchTerm, filterStatus, filterType, filterClassification]);

  // الأعمدة
  const columns: GridColDef[] = [
    { field: "file_number", headerName: t("fileNumber") || "رقم الملف", width: 120 },
    { field: "file_name", headerName: t("fileName") || "اسم الملف", width: 200 },
    { 
      field: "commercial_registration_number", 
      headerName: t("commercialRegistration") || "السجل التجاري", 
      width: 150 
    },
    { field: "administration", headerName: t("administration") || "الإدارة", width: 120 },
    { field: "file_type", headerName: t("fileType") || "نوع الملف", width: 120 },
    { field: "file_classification", headerName: t("classification") || "التصنيف", width: 120 },
    { field: "email", headerName: t("email") || "البريد الإلكتروني", width: 200 },
    { field: "phone", headerName: t("phone") || "الهاتف", width: 150 },
    { 
      field: "creation_date", 
      headerName: t("creationDate") || "تاريخ الإنشاء", 
      width: 120, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    {
      field: "file_status",
      headerName: t("status") || "الحالة",
      width: 120,
      renderCell: (params: any) => (
        <StatusChip status={params.value} />
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
            onView={() => handleViewDocuments(params.row)}
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
      const response = await axios.get(`${API_URL}/companies`);
      setCompanies(response.data);
    } catch (error) {
      setError(t('loadError') || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // العمليات
  const handleEdit = (company: Company) => {
    // TODO: إضافة حوار التعديل
    console.log('Edit company:', company);
    setError('TODO: إضافة حوار التعديل');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleViewDocuments = (company: Company) => {
    setSelectedCompany(company);
    setDocumentsOpen(true);
    // TODO: إضافة عرض المستندات الفعلي
  };

  const handleUploadDocument = (company: Company) => {
    // TODO: إضافة حوار رفع الملفات
    console.log('Upload document for company:', company);
    setSuccess('TODO: إضافة حوار رفع الملفات للشركة: ' + company.file_name);
  };

  const handleOCR = (company: Company) => {
    // TODO: إضافة حوار OCR لقراءة البيانات
    console.log('OCR for company:', company);
    setSuccess('TODO: إضافة حوار OCR لقراءة البيانات للشركة: ' + company.file_name);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/companies/${deleteId}`);
      setCompanies(companies.filter(c => c.id !== deleteId));
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
    setFilterClassification('');
  };

  // عدد المرشحات النشطة
  const activeFiltersCount = [filterStatus, filterType, filterClassification].filter(Boolean).length;

  // الحصول على قيم فريدة للفلترة
  const uniqueStatuses = [...new Set(companies.map(c => c.file_status).filter(Boolean))];
  const uniqueTypes = [...new Set(companies.map(c => c.file_type).filter(Boolean))];
  const uniqueClassifications = [...new Set(companies.map(c => c.file_classification).filter(Boolean))];

  // إعدادات البحث والفلترة
  const filterOptions = [
    {
      label: t('status') || 'الحالة',
      value: filterStatus,
      options: uniqueStatuses.map(status => ({ value: status, label: status })),
      onChange: setFilterStatus
    },
    {
      label: t('fileType') || 'نوع الملف',
      value: filterType,
      options: uniqueTypes.map(type => ({ value: type, label: type })),
      onChange: setFilterType
    },
    {
      label: t('classification') || 'التصنيف',
      value: filterClassification,
      options: uniqueClassifications.map(classification => ({ value: classification, label: classification })),
      onChange: setFilterClassification
    }
  ];

  return (
    <PageLayout
      title={t('companies') || 'الشركات'}
      actions={
        canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setError('TODO: إضافة حوار الإضافة')}
          >
            {t('addCompany') || 'إضافة شركة'}
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
              label={`إجمالي الشركات: ${companies.length}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`إجمالي العمال: ${companies.reduce((sum, c) => sum + (c.total_workers || 0), 0)}`}
              color="success"
              variant="outlined"
            />
            <Chip 
              label={`إجمالي الرخص: ${companies.reduce((sum, c) => sum + (c.total_licenses || 0), 0)}`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>
      }
    >
      <StandardTable
        rows={filteredCompanies}
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
          <Typography>{t('deleteConfirmMessage') || 'هل أنت متأكد من حذف هذه الشركة؟'}</Typography>
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

      {/* حوار المستندات */}
      <Dialog open={documentsOpen} onClose={() => setDocumentsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon />
          {t('companyDocuments') || 'مستندات الشركة'} - {selectedCompany?.file_name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('documentsComingSoon') || 'TODO: إضافة عرض المستندات'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentsOpen(false)}>
            {t('close') || 'إغلاق'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default CompaniesPage;
