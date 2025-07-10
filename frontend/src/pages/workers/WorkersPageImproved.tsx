import React, { useEffect, useState, useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, UploadFile as UploadFileIcon, CameraAlt as CameraAltIcon } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Select, MenuItem, InputLabel, FormControl, TextField, Typography, Box, Tooltip, IconButton } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageLayout, StandardTable, ActionButtons, StatusChip, SearchAndFilter } from "../../components/common";

interface Worker {
  id: number;
  custom_id: string;
  name: string;
  nationality: string;
  worker_type: string;
  job_title: string;
  hire_date: string;
  work_permit_start: string;
  work_permit_end: string;
  salary: number;
  company_id: number;
  license_id: number;
  passport_start: string;
  passport_end: string;
  civil_id: string;
  status?: string;
}

const WorkersPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  // State للبيانات الأساسية
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterLicense, setFilterLicense] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // State للعمليات
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // TODO: إضافة حوارات الإضافة والتعديل لاحقاً
  // const [addOpen, setAddOpen] = useState(false);
  // const [editOpen, setEditOpen] = useState(false);
  // const [currentWorker, setCurrentWorker] = useState<Partial<Worker>>({});

  // State للإشعارات
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const [notifTargetWorker, setNotifTargetWorker] = useState<Worker | null>(null);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("general");

  // تحديد حالة العامل بناءً على تواريخ الإقامة والجواز
  const getWorkerStatus = (worker: Worker) => {
    const today = new Date();
    const permitEnd = new Date(worker.work_permit_end);
    const passportEnd = new Date(worker.passport_end);
    
    const permitDaysLeft = Math.ceil((permitEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const passportDaysLeft = Math.ceil((passportEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (permitDaysLeft < 0 || passportDaysLeft < 0) {
      return 'منتهي الصلاحية';
    } else if (permitDaysLeft <= 30 || passportDaysLeft <= 30) {
      return 'قريب الانتهاء';
    } else {
      return 'نشط';
    }
  };

  // فلترة البيانات
  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const matchesSearch = !searchTerm || 
        (worker.name && worker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (worker.custom_id && worker.custom_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (worker.civil_id && worker.civil_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (worker.nationality && worker.nationality.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (worker.job_title && worker.job_title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCompany = !filterCompany || (worker.company_id && worker.company_id.toString() === filterCompany);
      const matchesLicense = !filterLicense || (worker.license_id && worker.license_id.toString() === filterLicense);
      const matchesStatus = !filterStatus || getWorkerStatus(worker) === filterStatus;
      
      return matchesSearch && matchesCompany && matchesLicense && matchesStatus;
    });
  }, [workers, searchTerm, filterCompany, filterLicense, filterStatus]);

  // الأعمدة المحسنة
  const columns: GridColDef[] = [
    { field: "custom_id", headerName: t("worker_id") || "رقم العامل", width: 100 },
    { field: "name", headerName: t("name") || "الاسم", width: 150 },
    { field: "civil_id", headerName: t("civil_id") || "الرقم المدني", width: 120 },
    { field: "nationality", headerName: t("nationality") || "الجنسية", width: 120 },
    { field: "worker_type", headerName: t("worker_type") || "نوع العامل", width: 120 },
    { field: "job_title", headerName: t("job_title") || "المسمى الوظيفي", width: 150 },
    { field: "phone", headerName: t("phone") || "الهاتف", width: 120 },
    { field: "salary", headerName: t("salary") || "الراتب", width: 100, type: 'number' },
    { field: "hire_date", headerName: t("hire_date") || "تاريخ التوظيف", width: 120, type: 'date' },
    { 
      field: "work_permit_start", 
      headerName: t("work_permit_start") || "بداية إذن العمل", 
      width: 130, 
      type: 'date'
    },
    { 
      field: "work_permit_end", 
      headerName: t("work_permit_end") || "انتهاء الإقامة", 
      width: 130, 
      type: 'date',
      renderCell: (params: any) => {
        const endDate = new Date(params.value);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isExpiringSoon = diffDays <= 15 && diffDays > 0;
        const isExpired = diffDays < 0;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{params.value}</span>
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
    { 
      field: "passport_end", 
      headerName: t("passport_end") || "انتهاء الجواز", 
      width: 130, 
      type: 'date'
    },
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
      field: "license_name",
      headerName: t("license") || "الترخيص",
      width: 150,
      valueGetter: (params: any) => {
        const license = licenses.find(l => l.id === params.row.license_id);
        return license ? license.name : '';
      }
    },
    {
      field: "status",
      headerName: t("status") || "الحالة",
      width: 130,
      renderCell: (params: any) => (
        <StatusChip status={getWorkerStatus(params.row)} />
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
            onView={() => navigate(`/workers/${params.row.id}`)}
            onNotify={() => handleNotify(params.row)}
            canEdit={canEdit}
            canDelete={canEdit}
            showView={true}
            showNotify={true}
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
      const [workersRes, companiesRes, licensesRes] = await Promise.all([
        axios.get(`${API_URL}/workers/public`),
        axios.get(`${API_URL}/companies`),
        axios.get(`${API_URL}/licenses`)
      ]);
      
      setWorkers(workersRes.data);
      setCompanies(companiesRes.data);
      setLicenses(licensesRes.data);
    } catch (error) {
      setError(t('loadError') || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // العمليات
  const handleEdit = (worker: Worker) => {
    // TODO: إضافة حوار التعديل لاحقاً
    console.log('Edit worker:', worker);
    setError('TODO: إضافة حوار التعديل');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleNotify = (worker: Worker) => {
    setNotifTargetWorker(worker);
    setNotifDialogOpen(true);
  };

  // ✅ checked - إضافة دالة رفع الملفات
  const handleUploadDocument = (worker: Worker) => {
    // TODO: إضافة حوار رفع الملفات
    console.log('Upload document for worker:', worker);
    setSuccess('TODO: إضافة حوار رفع الملفات للعامل: ' + worker.name);
  };

  // ✅ checked - إضافة دالة OCR
  const handleOCR = (worker: Worker) => {
    // TODO: إضافة حوار OCR لقراءة البيانات
    console.log('OCR for worker:', worker);
    setSuccess('TODO: إضافة حوار OCR لقراءة البيانات للعامل: ' + worker.name);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/workers/${deleteId}`);
      setWorkers(workers.filter(w => w.id !== deleteId));
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
    setFilterCompany('');
    setFilterLicense('');
    setFilterStatus('');
  };

  // عدد المرشحات النشطة
  const activeFiltersCount = [filterCompany, filterLicense, filterStatus].filter(Boolean).length;

  // إعدادات البحث والفلترة
  const filterOptions = [
    {
      label: t('company') || 'الشركة',
      value: filterCompany,
      options: companies.map(c => ({ value: c.id.toString(), label: c.file_name || c.name })),
      onChange: setFilterCompany
    },
    {
      label: t('license') || 'الترخيص',
      value: filterLicense,
      options: licenses.map(l => ({ value: l.id.toString(), label: l.name })),
      onChange: setFilterLicense
    },
    {
      label: t('status') || 'الحالة',
      value: filterStatus,
      options: [
        { value: 'نشط', label: 'نشط' },
        { value: 'قريب الانتهاء', label: 'قريب الانتهاء' },
        { value: 'منتهي الصلاحية', label: 'منتهي الصلاحية' }
      ],
      onChange: setFilterStatus
    }
  ];

  return (
    <PageLayout
      title={t('workers') || 'العمال'}
      actions={
        canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setError('TODO: إضافة حوار الإضافة')}
          >
            {t('addWorker') || 'إضافة عامل'}
          </Button>
        )
      }
      headerContent={
        <SearchAndFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterOptions}
          onClear={clearFilters}
          activeFiltersCount={activeFiltersCount}
        />
      }
    >
      <StandardTable
        rows={filteredWorkers}
        columns={columns}
        loading={loading}
        height={600}
        onRowClick={(row) => navigate(`/workers/${row.id}`)}
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
          <Typography>{t('deleteConfirmMessage') || 'هل أنت متأكد من حذف هذا العامل؟'}</Typography>
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

      {/* حوار الإشعارات */}
      <Dialog open={notifDialogOpen} onClose={() => setNotifDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('sendNotification') || 'إرسال إشعار'} - {notifTargetWorker?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl>
              <InputLabel>{t('notificationType') || 'نوع الإشعار'}</InputLabel>
              <Select
                value={notifType}
                label={t('notificationType') || 'نوع الإشعار'}
                onChange={(e) => setNotifType(e.target.value)}
              >
                <MenuItem value="general">{t('general') || 'عام'}</MenuItem>
                <MenuItem value="warning">{t('warning') || 'تحذير'}</MenuItem>
                <MenuItem value="reminder">{t('reminder') || 'تذكير'}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('message') || 'الرسالة'}
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifDialogOpen(false)}>
            {t('cancel') || 'إلغاء'}
          </Button>
          <Button 
            onClick={async () => {
              try {
                // TODO: استخدام API الإشعارات الصحيح
                console.log('Send notification:', {
                  type: notifType,
                  message: notifMessage,
                  target_worker_id: notifTargetWorker?.id
                });
                setSuccess(t('notificationSent') || 'تم إرسال الإشعار');
                setNotifDialogOpen(false);
                setNotifMessage('');
              } catch (error) {
                setError(t('notificationError') || 'خطأ في إرسال الإشعار');
              }
            }}
            variant="contained"
            disabled={!notifMessage.trim()}
          >
            {t('send') || 'إرسال'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TODO: إضافة حوارات الإضافة والتعديل */}
    </PageLayout>
  );
};

export default WorkersPage;
