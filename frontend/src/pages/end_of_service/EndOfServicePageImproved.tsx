import React, { useEffect, useState, useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, AssignmentInd as EndServiceIcon } from "@mui/icons-material";
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
  hire_date: string;
  salary: number;
  company?: { file_name: string };
}

interface EndOfService {
  id: number;
  worker_id: number;
  worker?: Worker;
  reason: string;
  date: string;
  last_working_date: string;
  end_of_service_benefits: number;
  vacation_balance: number;
  final_settlement: number;
  status: string;
  notes?: string;
  created_at: string;
  processed_by?: string;
}

const EndOfServicePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  // State للبيانات
  const [endOfServices, setEndOfServices] = useState<EndOfService[]>([]);
  const [loading, setLoading] = useState(false);

  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // State للعمليات
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEndOfService, setSelectedEndOfService] = useState<EndOfService | null>(null);

  // حساب مدة الخدمة
  const calculateServiceDuration = (hireDate: string, endDate: string) => {
    const start = new Date(hireDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return `${years} سنة ${months} شهر`;
  };

  // فلترة البيانات
  const filteredEndOfServices = useMemo(() => {
    return endOfServices.filter(endOfService => {
      const matchesSearch = !searchTerm || 
        (endOfService.worker?.name && endOfService.worker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (endOfService.worker?.custom_id && endOfService.worker.custom_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (endOfService.reason && endOfService.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesReason = !filterReason || endOfService.reason === filterReason;
      const matchesStatus = !filterStatus || endOfService.status === filterStatus;
      const matchesMonth = !filterMonth || 
        new Date(endOfService.date).getMonth() === parseInt(filterMonth);
      
      return matchesSearch && matchesReason && matchesStatus && matchesMonth;
    });
  }, [endOfServices, searchTerm, filterReason, filterStatus, filterMonth]);

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
    { field: "reason", headerName: t("reason") || "سبب انتهاء الخدمة", width: 150 },
    { 
      field: "date", 
      headerName: t("date") || "تاريخ انتهاء الخدمة", 
      width: 130, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    { 
      field: "last_working_date", 
      headerName: t("lastWorkingDate") || "آخر يوم عمل", 
      width: 120, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    {
      field: "service_duration",
      headerName: t("serviceDuration") || "مدة الخدمة",
      width: 130,
      valueGetter: (params: any) => {
        if (params.row?.worker?.hire_date && params.row?.last_working_date) {
          return calculateServiceDuration(params.row.worker.hire_date, params.row.last_working_date);
        }
        return '';
      }
    },
    { 
      field: "end_of_service_benefits", 
      headerName: t("endOfServiceBenefits") || "مكافأة نهاية الخدمة", 
      width: 140, 
      type: 'number',
      valueFormatter: (params: any) => {
        return params ? `${params.toLocaleString()} ريال` : '';
      }
    },
    { 
      field: "vacation_balance", 
      headerName: t("vacationBalance") || "رصيد الإجازات", 
      width: 120, 
      type: 'number',
      valueFormatter: (params: any) => {
        return params ? `${params.toLocaleString()} ريال` : '';
      }
    },
    { 
      field: "final_settlement", 
      headerName: t("finalSettlement") || "التسوية النهائية", 
      width: 130, 
      type: 'number',
      valueFormatter: (params: any) => {
        return params ? `${params.toLocaleString()} ريال` : '';
      }
    },
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
    { field: "processed_by", headerName: t("processedBy") || "تمت المعالجة بواسطة", width: 130 },
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
      const response = await axios.get(`${API_URL}/end_of_service`);
      setEndOfServices(response.data);
    } catch (error) {
      setError(t('loadError') || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // العمليات
  const handleEdit = (endOfService: EndOfService) => {
    // TODO: إضافة حوار التعديل
    console.log('Edit end of service:', endOfService);
    setError('TODO: إضافة حوار التعديل');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleViewDetails = (endOfService: EndOfService) => {
    setSelectedEndOfService(endOfService);
    setDetailsOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/end_of_service/${deleteId}`);
      setEndOfServices(endOfServices.filter(e => e.id !== deleteId));
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
    setFilterReason('');
    setFilterStatus('');
    setFilterMonth('');
  };

  // عدد المرشحات النشطة
  const activeFiltersCount = [filterReason, filterStatus, filterMonth].filter(Boolean).length;

  // الحصول على قيم فريدة للفلترة
  const uniqueReasons = [...new Set(endOfServices.map(e => e.reason).filter(Boolean))];
  const uniqueStatuses = [...new Set(endOfServices.map(e => e.status).filter(Boolean))];

  // إحصائيات
  const stats = {
    total: endOfServices.length,
    totalBenefits: endOfServices.reduce((sum, e) => sum + (e.end_of_service_benefits || 0), 0),
    totalVacationBalance: endOfServices.reduce((sum, e) => sum + (e.vacation_balance || 0), 0),
    totalFinalSettlement: endOfServices.reduce((sum, e) => sum + (e.final_settlement || 0), 0),
    thisMonth: endOfServices.filter(e => 
      new Date(e.date).getMonth() === new Date().getMonth() &&
      new Date(e.date).getFullYear() === new Date().getFullYear()
    ).length
  };

  // إعدادات البحث والفلترة
  const filterOptions = [
    {
      label: t('reason') || 'سبب انتهاء الخدمة',
      value: filterReason,
      options: uniqueReasons.map(reason => ({ value: reason, label: reason })),
      onChange: setFilterReason
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
      title={t('end_of_service') || 'نهاية الخدمة'}
      actions={
        canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setError('TODO: إضافة حوار الإضافة')}
          >
            {t('addEndOfService') || 'إضافة نهاية خدمة'}
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
              label={`إجمالي الحالات: ${stats.total}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`إجمالي المكافآت: ${stats.totalBenefits.toLocaleString()} ريال`}
              color="success"
              variant="outlined"
            />
            <Chip 
              label={`رصيد الإجازات: ${stats.totalVacationBalance.toLocaleString()} ريال`}
              color="info"
              variant="outlined"
            />
            <Chip 
              label={`التسويات النهائية: ${stats.totalFinalSettlement.toLocaleString()} ريال`}
              color="warning"
              variant="outlined"
            />
          </Box>
        </Box>
      }
    >
      <StandardTable
        rows={filteredEndOfServices}
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
          <Typography>{t('deleteConfirmMessage') || 'هل أنت متأكد من حذف هذا السجل؟'}</Typography>
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

      {/* حوار تفاصيل نهاية الخدمة */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EndServiceIcon />
          {t('endOfServiceDetails') || 'تفاصيل نهاية الخدمة'} - {selectedEndOfService?.worker?.name}
        </DialogTitle>
        <DialogContent>
          {selectedEndOfService && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* معلومات العامل */}
              <Box>
                <Typography variant="h6" gutterBottom>معلومات العامل:</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  <Typography><strong>الاسم:</strong> {selectedEndOfService.worker?.name}</Typography>
                  <Typography><strong>رقم العامل:</strong> {selectedEndOfService.worker?.custom_id}</Typography>
                  <Typography><strong>الرقم المدني:</strong> {selectedEndOfService.worker?.civil_id}</Typography>
                  <Typography><strong>المسمى الوظيفي:</strong> {selectedEndOfService.worker?.job_title}</Typography>
                  <Typography><strong>الجنسية:</strong> {selectedEndOfService.worker?.nationality}</Typography>
                  <Typography><strong>تاريخ التوظيف:</strong> {selectedEndOfService.worker?.hire_date ? new Date(selectedEndOfService.worker.hire_date).toLocaleDateString('ar-SA') : ''}</Typography>
                  <Typography><strong>الراتب:</strong> {selectedEndOfService.worker?.salary?.toLocaleString()} ريال</Typography>
                  <Typography><strong>الشركة:</strong> {selectedEndOfService.worker?.company?.file_name}</Typography>
                </Box>
              </Box>

              {/* تفاصيل نهاية الخدمة */}
              <Box>
                <Typography variant="h6" gutterBottom>تفاصيل نهاية الخدمة:</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Typography><strong>سبب انتهاء الخدمة:</strong> {selectedEndOfService.reason}</Typography>
                  <Typography><strong>تاريخ انتهاء الخدمة:</strong> {new Date(selectedEndOfService.date).toLocaleDateString('ar-SA')}</Typography>
                  <Typography><strong>آخر يوم عمل:</strong> {new Date(selectedEndOfService.last_working_date).toLocaleDateString('ar-SA')}</Typography>
                  <Typography><strong>مدة الخدمة:</strong> {selectedEndOfService.worker?.hire_date ? calculateServiceDuration(selectedEndOfService.worker.hire_date, selectedEndOfService.last_working_date) : ''}</Typography>
                  <Typography><strong>تمت المعالجة بواسطة:</strong> {selectedEndOfService.processed_by || 'غير محدد'}</Typography>
                </Box>
              </Box>

              {/* التسويات المالية */}
              <Box>
                <Typography variant="h6" gutterBottom>التسويات المالية:</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Typography><strong>مكافأة نهاية الخدمة:</strong> {selectedEndOfService.end_of_service_benefits?.toLocaleString()} ريال</Typography>
                  <Typography><strong>رصيد الإجازات:</strong> {selectedEndOfService.vacation_balance?.toLocaleString()} ريال</Typography>
                  <Typography><strong>التسوية النهائية:</strong> {selectedEndOfService.final_settlement?.toLocaleString()} ريال</Typography>
                </Box>
              </Box>

              {/* الحالة والملاحظات */}
              <Box>
                <Typography variant="h6" gutterBottom>الحالة والملاحظات:</Typography>
                <Box sx={{ mb: 2 }}>
                  <StatusChip status={selectedEndOfService.status} />
                </Box>
                {selectedEndOfService.notes && (
                  <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>ملاحظات:</strong> {selectedEndOfService.notes}
                    </Typography>
                  </Box>
                )}
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

export default EndOfServicePage;
