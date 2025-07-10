import React, { useEffect, useState, useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, MoneyOff as DeductionIcon } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Typography, Box, Chip } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { PageLayout, StandardTable, ActionButtons, SearchAndFilter } from "../../components/common";

interface Worker {
  id: number;
  name: string;
  custom_id: string;
  civil_id: string;
  job_title: string;
  nationality: string;
  company?: { file_name: string };
}

interface Deduction {
  id: number;
  worker_id: number;
  worker?: Worker;
  amount: number;
  reason: string;
  date: string;
  created_at: string;
  absence_id?: number;
}

const DeductionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  // State للبيانات
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(false);

  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterAmountRange, setFilterAmountRange] = useState('');

  // State للعمليات
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | null>(null);

  // فلترة البيانات
  const filteredDeductions = useMemo(() => {
    return deductions.filter(deduction => {
      const matchesSearch = !searchTerm || 
        (deduction.worker?.name && deduction.worker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deduction.worker?.custom_id && deduction.worker.custom_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deduction.reason && deduction.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deduction.amount && deduction.amount.toString().includes(searchTerm));
      
      const matchesMonth = !filterMonth || 
        new Date(deduction.date).getMonth() === parseInt(filterMonth);
      
      const matchesAmountRange = !filterAmountRange || 
        (filterAmountRange === 'low' && deduction.amount < 100) ||
        (filterAmountRange === 'medium' && deduction.amount >= 100 && deduction.amount <= 500) ||
        (filterAmountRange === 'high' && deduction.amount > 500);
      
      return matchesSearch && matchesMonth && matchesAmountRange;
    });
  }, [deductions, searchTerm, filterMonth, filterAmountRange]);

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
    { 
      field: "amount", 
      headerName: t("amount") || "المبلغ", 
      width: 120, 
      type: 'number',
      valueFormatter: (params: any) => {
        return `${params} ريال`;
      }
    },
    { field: "reason", headerName: t("reason") || "السبب", width: 200 },
    { 
      field: "date", 
      headerName: t("date") || "التاريخ", 
      width: 120, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    {
      field: "company_name",
      headerName: t("company") || "الشركة",
      width: 150,
      valueGetter: (params: any) => {
        return params.row?.worker?.company?.file_name || '';
      }
    },
    {
      field: "type",
      headerName: t("type") || "النوع",
      width: 100,
      renderCell: (params: any) => (
        <Chip 
          label={params.row.absence_id ? 'غياب' : 'يدوي'}
          color={params.row.absence_id ? 'warning' : 'default'}
          size="small"
        />
      )
    },
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
      const response = await axios.get(`${API_URL}/deductions`);
      setDeductions(response.data);
    } catch (error) {
      setError(t('loadError') || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // العمليات
  const handleEdit = (deduction: Deduction) => {
    // TODO: إضافة حوار التعديل
    console.log('Edit deduction:', deduction);
    setError('TODO: إضافة حوار التعديل');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleViewDetails = (deduction: Deduction) => {
    setSelectedDeduction(deduction);
    setDetailsOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/deductions/${deleteId}`);
      setDeductions(deductions.filter(d => d.id !== deleteId));
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
    setFilterMonth('');
    setFilterAmountRange('');
  };

  // عدد المرشحات النشطة
  const activeFiltersCount = [filterMonth, filterAmountRange].filter(Boolean).length;

  // إحصائيات
  const stats = {
    total: deductions.length,
    totalAmount: deductions.reduce((sum, d) => sum + d.amount, 0),
    autoDeductions: deductions.filter(d => d.absence_id).length,
    manualDeductions: deductions.filter(d => !d.absence_id).length,
    thisMonth: deductions.filter(d => 
      new Date(d.date).getMonth() === new Date().getMonth() &&
      new Date(d.date).getFullYear() === new Date().getFullYear()
    ).length
  };

  // إعدادات البحث والفلترة
  const filterOptions = [
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
    },
    {
      label: t('amountRange') || 'نطاق المبلغ',
      value: filterAmountRange,
      options: [
        { value: 'low', label: 'أقل من 100 ريال' },
        { value: 'medium', label: '100 - 500 ريال' },
        { value: 'high', label: 'أكثر من 500 ريال' }
      ],
      onChange: setFilterAmountRange
    }
  ];

  return (
    <PageLayout
      title={t('deductions') || 'الخصومات'}
      actions={
        canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setError('TODO: إضافة حوار الإضافة')}
          >
            {t('addDeduction') || 'إضافة خصم'}
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
              label={`إجمالي الخصومات: ${stats.total}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`المبلغ الإجمالي: ${stats.totalAmount.toLocaleString()} ريال`}
              color="error"
              variant="outlined"
            />
            <Chip 
              label={`خصم غياب: ${stats.autoDeductions}`}
              color="warning"
              variant="outlined"
            />
            <Chip 
              label={`خصم يدوي: ${stats.manualDeductions}`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>
      }
    >
      <StandardTable
        rows={filteredDeductions}
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
          <Typography>{t('deleteConfirmMessage') || 'هل أنت متأكد من حذف هذا الخصم؟'}</Typography>
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

      {/* حوار تفاصيل الخصم */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeductionIcon />
          {t('deductionDetails') || 'تفاصيل الخصم'}
        </DialogTitle>
        <DialogContent>
          {selectedDeduction && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Typography><strong>العامل:</strong> {selectedDeduction.worker?.name}</Typography>
                <Typography><strong>رقم العامل:</strong> {selectedDeduction.worker?.custom_id}</Typography>
                <Typography><strong>المسمى الوظيفي:</strong> {selectedDeduction.worker?.job_title}</Typography>
                <Typography><strong>الجنسية:</strong> {selectedDeduction.worker?.nationality}</Typography>
                <Typography><strong>المبلغ:</strong> {selectedDeduction.amount.toLocaleString()} ريال</Typography>
                <Typography><strong>السبب:</strong> {selectedDeduction.reason}</Typography>
                <Typography><strong>التاريخ:</strong> {new Date(selectedDeduction.date).toLocaleDateString('ar-SA')}</Typography>
                <Typography><strong>الشركة:</strong> {selectedDeduction.worker?.company?.file_name}</Typography>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={selectedDeduction.absence_id ? 'خصم غياب' : 'خصم يدوي'}
                  color={selectedDeduction.absence_id ? 'warning' : 'default'}
                />
              </Box>
              
              {selectedDeduction.absence_id && (
                <Box sx={{ p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>ملاحظة:</strong> هذا الخصم تم تطبيقه تلقائياً بسبب غياب غير مبرر
                  </Typography>
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

export default DeductionsPage;
