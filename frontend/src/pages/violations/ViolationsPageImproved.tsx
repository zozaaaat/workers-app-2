import React, { useEffect, useState, useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, Gavel as ViolationIcon } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Typography, Box, Chip } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { PageLayout, StandardTable, ActionButtons, StatusChip, SearchAndFilter } from "../../components/common";

interface Worker {
  id: number;
  name: string;
  custom_id: string;
  civil_id: string;
  job_title: string;
  nationality: string;
  company?: { file_name: string };
}

interface Violation {
  id: number;
  worker_id: number;
  worker?: Worker;
  violationType: string;
  date: string;
  description?: string;
  severity: string;
  action_taken?: string;
  status: string;
  created_at: string;
  reported_by?: string;
}

const ViolationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  // State للبيانات
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);

  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // State للعمليات
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  // فلترة البيانات
  const filteredViolations = useMemo(() => {
    return violations.filter(violation => {
      const matchesSearch = !searchTerm || 
        (violation.worker?.name && violation.worker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (violation.worker?.custom_id && violation.worker.custom_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (violation.violationType && violation.violationType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (violation.description && violation.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = !filterType || violation.violationType === filterType;
      const matchesSeverity = !filterSeverity || violation.severity === filterSeverity;
      const matchesStatus = !filterStatus || violation.status === filterStatus;
      const matchesMonth = !filterMonth || 
        new Date(violation.date).getMonth() === parseInt(filterMonth);
      
      return matchesSearch && matchesType && matchesSeverity && matchesStatus && matchesMonth;
    });
  }, [violations, searchTerm, filterType, filterSeverity, filterStatus, filterMonth]);

  // الأعمدة
  const columns: GridColDef[] = [
    { field: "id", headerName: t("id") || "المعرف", width: 80 },
    {
      field: "worker_name",
      headerName: t("worker") || "العامل",
      width: 200,
      valueGetter: (params: any) => {
        const worker = params.row?.worker;
        if (worker) {
          return worker.custom_id && worker.name ? 
            `${worker.custom_id} - ${worker.name}` : 
            worker.custom_id || worker.name;
        }
        return params.row?.worker_id || '';
      }
    },
    {
      field: "worker_job",
      headerName: t("jobTitle") || "المسمى الوظيفي",
      width: 130,
      valueGetter: (params: any) => {
        return params.row?.worker?.job_title || '';
      }
    },
    {
      field: "worker_nationality",
      headerName: t("nationality") || "الجنسية",
      width: 120,
      valueGetter: (params: any) => {
        return params.row?.worker?.nationality || '';
      }
    },
    { field: "violationType", headerName: t("violationType") || "نوع المخالفة", width: 150 },
    { 
      field: "date", 
      headerName: t("date") || "التاريخ", 
      width: 120, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    { field: "description", headerName: t("description") || "الوصف", width: 200 },
    {
      field: "severity",
      headerName: t("severity") || "الخطورة",
      width: 100,
      renderCell: (params: any) => {
        const getSeverityColor = (severity: string) => {
          switch (severity?.toLowerCase()) {
            case 'high':
            case 'عالية':
              return 'error';
            case 'medium':
            case 'متوسطة':
              return 'warning';
            case 'low':
            case 'منخفضة':
              return 'success';
            default:
              return 'default';
          }
        };
        
        return (
          <Chip 
            label={params.value}
            color={getSeverityColor(params.value) as any}
            size="small"
          />
        );
      }
    },
    { field: "action_taken", headerName: t("actionTaken") || "الإجراء المتخذ", width: 150 },
    {
      field: "status",
      headerName: t("status") || "الحالة",
      width: 120,
      renderCell: (params: any) => (
        <StatusChip status={params.value} />
      )
    },
    {
      field: "company_name",
      headerName: t("company") || "الشركة",
      width: 150,
      valueGetter: (params: any) => {
        return params.row?.worker?.company?.file_name || '';
      }
    },
    { field: "reported_by", headerName: t("reportedBy") || "أبلغ بواسطة", width: 120 },
    { 
      field: "created_at", 
      headerName: t("createdAt") || "تاريخ الإدخال", 
      width: 130, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    {
      field: "actions",
      headerName: t("actions") || "العمليات",
      width: 150,
      renderCell: (params: any) => (
        <ActionButtons
          onEdit={() => handleEdit(params.row)}
          onDelete={() => handleDelete(params.row.id)}
          onView={() => handleViewDetails(params.row)}
          canEdit={canEdit}
          canDelete={canEdit}
          showView={true}
        />
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
      const response = await axios.get(`${API_URL}/violations`);
      setViolations(response.data);
    } catch (error) {
      setError(t('loadError') || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // العمليات
  const handleEdit = (violation: Violation) => {
    // TODO: إضافة حوار التعديل
    console.log('Edit violation:', violation);
    setError('TODO: إضافة حوار التعديل');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleViewDetails = (violation: Violation) => {
    setSelectedViolation(violation);
    setDetailsOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/violations/${deleteId}`);
      setViolations(violations.filter(v => v.id !== deleteId));
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
    setFilterType('');
    setFilterSeverity('');
    setFilterStatus('');
    setFilterMonth('');
  };

  // عدد المرشحات النشطة
  const activeFiltersCount = [filterType, filterSeverity, filterStatus, filterMonth].filter(Boolean).length;

  // الحصول على قيم فريدة للفلترة
  const uniqueTypes = [...new Set(violations.map(v => v.violationType).filter(Boolean))];
  const uniqueStatuses = [...new Set(violations.map(v => v.status).filter(Boolean))];

  // إحصائيات
  const stats = {
    total: violations.length,
    high: violations.filter(v => v.severity?.toLowerCase() === 'high' || v.severity === 'عالية').length,
    medium: violations.filter(v => v.severity?.toLowerCase() === 'medium' || v.severity === 'متوسطة').length,
    low: violations.filter(v => v.severity?.toLowerCase() === 'low' || v.severity === 'منخفضة').length,
    resolved: violations.filter(v => v.status?.toLowerCase() === 'resolved' || v.status === 'محلولة').length,
    thisMonth: violations.filter(v => 
      new Date(v.date).getMonth() === new Date().getMonth() &&
      new Date(v.date).getFullYear() === new Date().getFullYear()
    ).length
  };

  // إعدادات البحث والفلترة
  const filterOptions = [
    {
      label: t('violationType') || 'نوع المخالفة',
      value: filterType,
      options: uniqueTypes.map(type => ({ value: type, label: type })),
      onChange: setFilterType
    },
    {
      label: t('severity') || 'الخطورة',
      value: filterSeverity,
      options: [
        { value: 'عالية', label: 'عالية' },
        { value: 'متوسطة', label: 'متوسطة' },
        { value: 'منخفضة', label: 'منخفضة' }
      ],
      onChange: setFilterSeverity
    },
    {
      label: t('status') || 'الحالة',
      value: filterStatus,
      options: uniqueStatuses.map(status => ({ value: status, label: status })),
      onChange: setFilterStatus
    },
    {
      label: t('month') || 'الشهر',
      value: filterMonth,
      options: [
        { value: '0', label: 'يناير' },
        { value: '1', label: 'فبراير' },
        { value: '2', label: 'مارس' },
        { value: '3', label: 'أبريل' },
        { value: '4', label: 'مايو' },
        { value: '5', label: 'يونيو' },
        { value: '6', label: 'يوليو' },
        { value: '7', label: 'أغسطس' },
        { value: '8', label: 'سبتمبر' },
        { value: '9', label: 'أكتوبر' },
        { value: '10', label: 'نوفمبر' },
        { value: '11', label: 'ديسمبر' }
      ],
      onChange: setFilterMonth
    }
  ];

  return (
    <PageLayout
      title={t('violations') || 'المخالفات'}
      actions={
        canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setError('TODO: إضافة حوار الإضافة')}
          >
            {t('addViolation') || 'إضافة مخالفة'}
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
              label={`إجمالي المخالفات: ${stats.total}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`عالية الخطورة: ${stats.high}`}
              color="error"
              variant="outlined"
            />
            <Chip 
              label={`متوسطة الخطورة: ${stats.medium}`}
              color="warning"
              variant="outlined"
            />
            <Chip 
              label={`منخفضة الخطورة: ${stats.low}`}
              color="success"
              variant="outlined"
            />
            <Chip 
              label={`محلولة: ${stats.resolved}`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>
      }
    >
      <StandardTable
        rows={filteredViolations}
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
          <Typography>{t('deleteConfirmMessage') || 'هل أنت متأكد من حذف هذه المخالفة؟'}</Typography>
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

      {/* حوار تفاصيل المخالفة */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ViolationIcon />
          {t('violationDetails') || 'تفاصيل المخالفة'}
        </DialogTitle>
        <DialogContent>
          {selectedViolation && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Typography><strong>العامل:</strong> {selectedViolation.worker?.name}</Typography>
                <Typography><strong>رقم العامل:</strong> {selectedViolation.worker?.custom_id}</Typography>
                <Typography><strong>المسمى الوظيفي:</strong> {selectedViolation.worker?.job_title}</Typography>
                <Typography><strong>الجنسية:</strong> {selectedViolation.worker?.nationality}</Typography>
                <Typography><strong>نوع المخالفة:</strong> {selectedViolation.violationType}</Typography>
                <Typography><strong>التاريخ:</strong> {new Date(selectedViolation.date).toLocaleDateString('ar-SA')}</Typography>
                <Typography><strong>الخطورة:</strong> {selectedViolation.severity}</Typography>
                <Typography><strong>الحالة:</strong> {selectedViolation.status}</Typography>
                <Typography><strong>أبلغ بواسطة:</strong> {selectedViolation.reported_by || 'غير محدد'}</Typography>
                <Typography><strong>الشركة:</strong> {selectedViolation.worker?.company?.file_name}</Typography>
              </Box>
              
              {selectedViolation.description && (
                <Box>
                  <Typography variant="h6" gutterBottom>الوصف:</Typography>
                  <Typography>{selectedViolation.description}</Typography>
                </Box>
              )}
              
              {selectedViolation.action_taken && (
                <Box sx={{ p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>الإجراء المتخذ:</Typography>
                  <Typography>{selectedViolation.action_taken}</Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <StatusChip status={selectedViolation.status} />
                <Chip 
                  label={selectedViolation.severity}
                  color={
                    selectedViolation.severity?.toLowerCase() === 'high' || selectedViolation.severity === 'عالية' ? 'error' :
                    selectedViolation.severity?.toLowerCase() === 'medium' || selectedViolation.severity === 'متوسطة' ? 'warning' :
                    'success'
                  }
                  size="small"
                />
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

export default ViolationsPage;
