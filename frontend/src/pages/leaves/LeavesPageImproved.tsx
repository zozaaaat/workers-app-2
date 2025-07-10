import React, { useEffect, useState, useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, EventAvailable as LeaveIcon } from "@mui/icons-material";
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

interface Leave {
  id: number;
  worker_id: number;
  worker?: Worker;
  type: string;
  from: string;
  to: string;
  days: number;
  reason?: string;
  status: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
}

const LeavesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  // State للبيانات
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);

  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // State للعمليات
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  // حساب عدد الأيام تلقائياً
  const calculateDays = (from: string, to: string) => {
    const startDate = new Date(from);
    const endDate = new Date(to);
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  // فلترة البيانات
  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      const matchesSearch = !searchTerm || 
        (leave.worker?.name && leave.worker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (leave.worker?.custom_id && leave.worker.custom_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (leave.type && leave.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = !filterType || leave.type === filterType;
      const matchesStatus = !filterStatus || leave.status === filterStatus;
      const matchesMonth = !filterMonth || 
        new Date(leave.from).getMonth() === parseInt(filterMonth);
      
      return matchesSearch && matchesType && matchesStatus && matchesMonth;
    });
  }, [leaves, searchTerm, filterType, filterStatus, filterMonth]);

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
    { field: "type", headerName: t("type") || "نوع الإجازة", width: 130 },
    { 
      field: "from", 
      headerName: t("from") || "من تاريخ", 
      width: 120, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    { 
      field: "to", 
      headerName: t("to") || "إلى تاريخ", 
      width: 120, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    { 
      field: "days", 
      headerName: t("days") || "عدد الأيام", 
      width: 100, 
      type: 'number',
      valueGetter: (params: any) => {
        return params.row.days || calculateDays(params.row.from, params.row.to);
      }
    },
    { field: "reason", headerName: t("reason") || "السبب", width: 200 },
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
    { field: "approved_by", headerName: t("approvedBy") || "موافق بواسطة", width: 130 },
    { 
      field: "approved_at", 
      headerName: t("approvedAt") || "تاريخ الموافقة", 
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
      const response = await axios.get(`${API_URL}/leaves`);
      setLeaves(response.data);
    } catch (error) {
      setError(t('loadError') || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // العمليات
  const handleEdit = (leave: Leave) => {
    // TODO: إضافة حوار التعديل
    console.log('Edit leave:', leave);
    setError('TODO: إضافة حوار التعديل');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleViewDetails = (leave: Leave) => {
    setSelectedLeave(leave);
    setDetailsOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/leaves/${deleteId}`);
      setLeaves(leaves.filter(l => l.id !== deleteId));
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
    setFilterStatus('');
    setFilterMonth('');
  };

  // عدد المرشحات النشطة
  const activeFiltersCount = [filterType, filterStatus, filterMonth].filter(Boolean).length;

  // الحصول على قيم فريدة للفلترة
  const uniqueTypes = [...new Set(leaves.map(l => l.type).filter(Boolean))];
  const uniqueStatuses = [...new Set(leaves.map(l => l.status).filter(Boolean))];

  // إحصائيات
  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'approved').length,
    pending: leaves.filter(l => l.status === 'pending').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
    totalDays: leaves.reduce((sum, l) => sum + (l.days || calculateDays(l.from, l.to)), 0)
  };

  // إعدادات البحث والفلترة
  const filterOptions = [
    {
      label: t('type') || 'نوع الإجازة',
      value: filterType,
      options: uniqueTypes.map(type => ({ value: type, label: type })),
      onChange: setFilterType
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
      title={t('leaves') || 'الإجازات'}
      actions={
        canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setError('TODO: إضافة حوار الإضافة')}
          >
            {t('addLeave') || 'إضافة إجازة'}
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
              label={`إجمالي الإجازات: ${stats.total}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`موافق عليها: ${stats.approved}`}
              color="success"
              variant="outlined"
            />
            <Chip 
              label={`في انتظار: ${stats.pending}`}
              color="warning"
              variant="outlined"
            />
            <Chip 
              label={`مرفوضة: ${stats.rejected}`}
              color="error"
              variant="outlined"
            />
            <Chip 
              label={`إجمالي الأيام: ${stats.totalDays}`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>
      }
    >
      <StandardTable
        rows={filteredLeaves}
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
          <Typography>{t('deleteConfirmMessage') || 'هل أنت متأكد من حذف هذه الإجازة؟'}</Typography>
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

      {/* حوار تفاصيل الإجازة */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LeaveIcon />
          {t('leaveDetails') || 'تفاصيل الإجازة'}
        </DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Typography><strong>العامل:</strong> {selectedLeave.worker?.name}</Typography>
                <Typography><strong>رقم العامل:</strong> {selectedLeave.worker?.custom_id}</Typography>
                <Typography><strong>المسمى الوظيفي:</strong> {selectedLeave.worker?.job_title}</Typography>
                <Typography><strong>الجنسية:</strong> {selectedLeave.worker?.nationality}</Typography>
                <Typography><strong>نوع الإجازة:</strong> {selectedLeave.type}</Typography>
                <Typography><strong>من تاريخ:</strong> {new Date(selectedLeave.from).toLocaleDateString('ar-SA')}</Typography>
                <Typography><strong>إلى تاريخ:</strong> {new Date(selectedLeave.to).toLocaleDateString('ar-SA')}</Typography>
                <Typography><strong>عدد الأيام:</strong> {selectedLeave.days || calculateDays(selectedLeave.from, selectedLeave.to)}</Typography>
                <Typography><strong>السبب:</strong> {selectedLeave.reason || 'غير محدد'}</Typography>
                <Typography><strong>الشركة:</strong> {selectedLeave.worker?.company?.file_name}</Typography>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <StatusChip status={selectedLeave.status} />
              </Box>
              
              {selectedLeave.approved_by && (
                <Box sx={{ p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                  <Typography><strong>موافق بواسطة:</strong> {selectedLeave.approved_by}</Typography>
                  <Typography><strong>تاريخ الموافقة:</strong> {selectedLeave.approved_at ? new Date(selectedLeave.approved_at).toLocaleDateString('ar-SA') : 'غير محدد'}</Typography>
                </Box>
              )}
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

export default LeavesPage;
