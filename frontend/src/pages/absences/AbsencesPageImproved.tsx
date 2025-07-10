import React, { useEffect, useState, useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, EventBusy as AbsenceIcon } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Typography, Box, Chip, FormControlLabel, Checkbox } from "@mui/material";
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
  license?: { name: string };
}

interface Absence {
  id: number;
  worker_id: number;
  worker?: Worker;
  date: string;
  reason: string;
  is_excused: boolean;
  created_at: string;
  deduction?: {
    id: number;
    amount: number;
  };
}

const AbsencesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  // State للبيانات
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(false);

  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExcused, setFilterExcused] = useState('');
  const [filterDeducted, setFilterDeducted] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // State للعمليات
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);

  // فلترة البيانات
  const filteredAbsences = useMemo(() => {
    return absences.filter(absence => {
      const matchesSearch = !searchTerm || 
        (absence.worker?.name && absence.worker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (absence.worker?.custom_id && absence.worker.custom_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (absence.reason && absence.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesExcused = !filterExcused || 
        (filterExcused === 'true' && absence.is_excused) ||
        (filterExcused === 'false' && !absence.is_excused);
      
      const matchesDeducted = !filterDeducted || 
        (filterDeducted === 'true' && absence.deduction) ||
        (filterDeducted === 'false' && !absence.deduction);
      
      const matchesMonth = !filterMonth || 
        new Date(absence.date).getMonth() === parseInt(filterMonth);
      
      return matchesSearch && matchesExcused && matchesDeducted && matchesMonth;
    });
  }, [absences, searchTerm, filterExcused, filterDeducted, filterMonth]);

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
      field: "date", 
      headerName: t("date") || "التاريخ", 
      width: 120, 
      type: 'date',
      valueFormatter: (params: any) => {
        return params ? new Date(params).toLocaleDateString('ar-SA') : '';
      }
    },
    { field: "reason", headerName: t("reason") || "السبب", width: 200 },
    {
      field: "is_excused",
      headerName: t("excused") || "معذور",
      width: 100,
      renderCell: (params: any) => (
        <Chip 
          label={params.row.is_excused ? t('yes') || 'نعم' : t('no') || 'لا'}
          color={params.row.is_excused ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      field: "deduction_amount",
      headerName: t("deductionAmount") || "مبلغ الخصم",
      width: 120,
      type: 'number',
      valueGetter: (params: any) => {
        return params.row?.deduction?.amount || 0;
      }
    },
    {
      field: "has_deduction",
      headerName: t("deducted") || "تم الخصم",
      width: 100,
      renderCell: (params: any) => (
        <Chip 
          label={params.row.deduction ? t('yes') || 'نعم' : t('no') || 'لا'}
          color={params.row.deduction ? 'warning' : 'default'}
          size="small"
        />
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
      const absencesRes = await axios.get(`${API_URL}/absences`);
      setAbsences(absencesRes.data);
    } catch (error) {
      setError(t('loadError') || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // العمليات
  const handleEdit = (absence: Absence) => {
    // TODO: إضافة حوار التعديل
    console.log('Edit absence:', absence);
    setError('TODO: إضافة حوار التعديل');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleViewDetails = (absence: Absence) => {
    setSelectedAbsence(absence);
    setDetailsOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/absences/${deleteId}`);
      setAbsences(absences.filter(a => a.id !== deleteId));
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
    setFilterExcused('');
    setFilterDeducted('');
    setFilterMonth('');
  };

  // عدد المرشحات النشطة
  const activeFiltersCount = [filterExcused, filterDeducted, filterMonth].filter(Boolean).length;

  // إحصائيات
  const stats = {
    total: absences.length,
    excused: absences.filter(a => a.is_excused).length,
    deducted: absences.filter(a => a.deduction).length,
    thisMonth: absences.filter(a => 
      new Date(a.date).getMonth() === new Date().getMonth() &&
      new Date(a.date).getFullYear() === new Date().getFullYear()
    ).length
  };

  // إعدادات البحث والفلترة
  const filterOptions = [
    {
      label: t('excused') || 'معذور',
      value: filterExcused,
      options: [
        { value: 'true', label: t('yes') || 'نعم' },
        { value: 'false', label: t('no') || 'لا' }
      ],
      onChange: setFilterExcused
    },
    {
      label: t('deducted') || 'مخصوم',
      value: filterDeducted,
      options: [
        { value: 'true', label: t('yes') || 'نعم' },
        { value: 'false', label: t('no') || 'لا' }
      ],
      onChange: setFilterDeducted
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
      title={t('absences') || 'الغيابات'}
      actions={
        canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setError('TODO: إضافة حوار الإضافة')}
          >
            {t('addAbsence') || 'إضافة غياب'}
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
              label={`إجمالي الغيابات: ${stats.total}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`معذور: ${stats.excused}`}
              color="success"
              variant="outlined"
            />
            <Chip 
              label={`مخصوم: ${stats.deducted}`}
              color="warning"
              variant="outlined"
            />
            <Chip 
              label={`هذا الشهر: ${stats.thisMonth}`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>
      }
    >
      <StandardTable
        rows={filteredAbsences}
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
          <Typography>{t('deleteConfirmMessage') || 'هل أنت متأكد من حذف هذا الغياب؟'}</Typography>
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

      {/* حوار تفاصيل الغياب */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AbsenceIcon />
          {t('absenceDetails') || 'تفاصيل الغياب'}
        </DialogTitle>
        <DialogContent>
          {selectedAbsence && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Typography><strong>العامل:</strong> {selectedAbsence.worker?.name}</Typography>
                <Typography><strong>رقم العامل:</strong> {selectedAbsence.worker?.custom_id}</Typography>
                <Typography><strong>المسمى الوظيفي:</strong> {selectedAbsence.worker?.job_title}</Typography>
                <Typography><strong>الجنسية:</strong> {selectedAbsence.worker?.nationality}</Typography>
                <Typography><strong>التاريخ:</strong> {new Date(selectedAbsence.date).toLocaleDateString('ar-SA')}</Typography>
                <Typography><strong>السبب:</strong> {selectedAbsence.reason}</Typography>
                <Typography><strong>الشركة:</strong> {selectedAbsence.worker?.company?.file_name}</Typography>
                <Typography><strong>تاريخ الإدخال:</strong> {new Date(selectedAbsence.created_at).toLocaleDateString('ar-SA')}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <FormControlLabel
                  control={<Checkbox checked={selectedAbsence.is_excused} disabled />}
                  label="معذور"
                />
                <FormControlLabel
                  control={<Checkbox checked={!!selectedAbsence.deduction} disabled />}
                  label="تم الخصم"
                />
              </Box>
              
              {selectedAbsence.deduction && (
                <Box sx={{ p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
                  <Typography><strong>مبلغ الخصم:</strong> {selectedAbsence.deduction.amount} ريال</Typography>
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

export default AbsencesPage;
