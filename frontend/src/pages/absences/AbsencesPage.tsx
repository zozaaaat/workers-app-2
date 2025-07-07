import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  Snackbar,
  Tooltip,
  useTheme,
  useMediaQuery,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Divider
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Info, Edit } from "@mui/icons-material";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { API_URL } from '../../api';
import { saveAs } from "file-saver";
import CircularProgress from "@mui/material/CircularProgress";

// تعريف نوع العامل
interface Worker {
  id: number;
  name: string;
  civil_id?: string;
  nationality?: string;
  job_title?: string;
  custom_id?: string; // معرف العرض الذكي
  company?: any;
  company_id?: any;
  license?: any;
  license_id?: any;
  // ...أي حقول أخرى تحتاجها...
}

interface Deduction {
  id: number;
  worker_id: number;
  amount: number;
  reason: string;
  date: string;
}

// تحديث نوع Absence ليشمل بيانات العامل
interface Absence {
  id: number;
  worker_id: number;
  date: string;
  reason?: string;
  is_excused: boolean;
  deduction_id?: number;
  worker?: Worker;
  deduction?: Deduction;
}

const AbsencesPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({ worker_id: "", date: "", reason: "", is_excused: false });
  const [selected, setSelected] = useState<Absence | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [filterWorker, setFilterWorker] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [filterExcused, setFilterExcused] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const fetchAbsences = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/absences/`);
      setAbsences(res.data);
    } catch (e) {
      setSnackbar({ open: true, message: t("error_loading_data"), severity: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (absence: Absence) => {
    setForm({
      worker_id: String(absence.worker_id),
      date: absence.date,
      reason: absence.reason || "",
      is_excused: absence.is_excused,
    });
    setEditId(absence.id);
    setOpenForm(true);
  };

  // التحقق من صحة النموذج
  const validateAbsence = (form: any) => {
    if (!form.worker_id || !form.date) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAbsence(form)) {
      setSnackbar({ open: true, message: t('fillAllFields') || 'يرجى تعبئة جميع الحقول المطلوبة', severity: 'error' });
      return;
    }
    try {
      if (editId) {
        await axios.put(`${API_URL}/absences/${editId}`, form);
        setSnackbar({ open: true, message: t("updated_successfully"), severity: "success" });
      } else {
        await axios.post(`${API_URL}/absences/`, form);
        setSnackbar({ open: true, message: t("added_successfully"), severity: "success" });
      }
      setOpenForm(false);
      setEditId(null);
      fetchAbsences();
    } catch (e) {
      setSnackbar({ open: true, message: t("error_saving_data"), severity: "error" });
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/absences/${deleteId}`);
      setSuccess(t('deleteSuccess'));
      setAbsences(absences.filter(r => r.id !== deleteId));
    } catch {
      setError(t('deleteError'));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const filteredAbsences = absences.filter(abs => {
    let match = true;
    if (filterWorker && abs.worker?.name) match = match && abs.worker.name.includes(filterWorker);
    if (filterFrom) match = match && abs.date >= filterFrom;
    if (filterTo) match = match && abs.date <= filterTo;
    if (filterExcused) match = match && (filterExcused === "excused" ? abs.is_excused : !abs.is_excused);
    return match;
  });

  // إحصائيات
  const totalAbsences = absences.length;
  const excusedAbsences = absences.filter(a => a.is_excused).length;
  const unexcusedAbsences = absences.filter(a => !a.is_excused).length;
  const absencesByWorker: { [key: string]: number } = {};
  absences.forEach(a => {
    const name = a.worker?.name || a.worker_id;
    absencesByWorker[name] = (absencesByWorker[name] || 0) + 1;
  });
  const mostAbsentWorker = Object.entries(absencesByWorker).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  
  const columns: GridColDef[] = [
    { field: "id", headerName: t("id"), width: 70 },
    { field: "worker", headerName: t("worker"), width: 180, valueGetter: (params: any) => {
      if (!params || !params.row) return '';
      const worker = params.row.worker;
      if (worker) {
        if (worker.custom_id && worker.name) return `${worker.custom_id} - ${worker.name}`;
        if (worker.custom_id) return worker.custom_id;
        if (worker.name) return worker.name;
      }
      return params.row.worker_id || '';
    } },
    { field: "date", headerName: t("date"), width: 120 },
    { field: "reason", headerName: t("reason"), width: 180 },
    { field: "is_excused", headerName: t("is_excused"), width: 120, renderCell: (params: any) => params.value ? t("excused") : t("unexcused") },
    { field: "deduction", headerName: t("deduction"), width: 180, valueGetter: (params: any) => {
      if (!params || !params.row) return t("no_deduction");
      return params.row.deduction ? `${params.row.deduction.amount} - ${params.row.deduction.reason}` : t("no_deduction");
    } },
    {
      field: "actions",
      headerName: t("actions"),
      width: 160,
      renderCell: (params: any) => (
        <>
          <span><Tooltip title={t("details")}><IconButton onClick={() => { setSelected(params.row); setDrawerOpen(true); }}><Info /></IconButton></Tooltip></span>
          <span><Tooltip title={t("edit")}><IconButton color="primary" onClick={() => handleEdit(params.row)}><Edit /></IconButton></Tooltip></span>
          <span><Tooltip title={t("delete")}><IconButton color="error" onClick={() => { handleDelete(params.row.id); }}><Delete /></IconButton></Tooltip></span>
        </>
      )
    }
  ];

  const handleExportExcel = () => {
    const data = filteredAbsences.map(abs => ({
      id: abs.id,
      worker: abs.worker?.custom_id || abs.worker_id,
      date: abs.date,
      reason: abs.reason,
      is_excused: abs.is_excused ? t("excused") : t("unexcused"),
      deduction: abs.deduction ? `${abs.deduction.amount} - ${abs.deduction.reason}` : t("no_deduction"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absences");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "absences.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(t("absences"), 10, 10);
    (doc as any).autoTable({
      head: [[t("id"), t("worker"), t("date"), t("reason"), t("is_excused"), t("deduction")]],
      body: filteredAbsences.map(abs => [
        abs.id,
        abs.worker?.custom_id || abs.worker_id,
        abs.date,
        abs.reason,
        abs.is_excused ? t("excused") : t("unexcused"),
        abs.deduction ? `${abs.deduction.amount} - ${abs.deduction.reason}` : t("no_deduction")
      ]),
    });
    doc.save("absences.pdf");
  };

  const fillDemoAbsence = () => {
    setForm({
      worker_id: "1", // غيّر الرقم حسب ID العامل التجريبي بعد إضافته
      date: "2025-07-01",
      reason: "تجربة غياب",
      is_excused: true
    });
    setOpenForm(true);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>{t("absences")}</Typography>
      <Box display="flex" gap={2} mb={2}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenForm(true)}>{t("add_absence")}</Button>
        <Button variant="outlined" color="secondary" onClick={fillDemoAbsence}>
          إدخال غياب تجريبي
        </Button>
      </Box>
      <Box mt={2} display="flex" gap={2} flexWrap="wrap">
        <TextField label={t("worker")} value={filterWorker} onChange={e => setFilterWorker(e.target.value)} size="small" />
        <TextField label={t("from_date")} type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label={t("to_date")} type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <FormControl size="small" style={{ minWidth: 120 }}>
          <InputLabel id="absence-type-label">{t("absence_type")}</InputLabel>
          <Select
            labelId="absence-type-label"
            value={filterExcused}
            label={t("absence_type")}
            onChange={e => setFilterExcused(e.target.value)}
            inputProps={{ 'aria-label': t("absence_type") }}
          >
            <MenuItem value="">{t("all")}</MenuItem>
            <MenuItem value="excused">{t("excused")}</MenuItem>
            <MenuItem value="unexcused">{t("unexcused")}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportExcel}>{t("export_excel")}</Button>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handleExportPDF}>{t("export_pdf")}</Button>
      </Box>
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        {/* إحصائيات absences */}
        <div style={{ flex: '1 1 25%', minWidth: 200, padding: 8 }}>
          <Card><CardContent><Typography variant="h6">{t("total_absences")}</Typography><Typography>{totalAbsences}</Typography></CardContent></Card>
        </div>
        <div style={{ flex: '1 1 25%', minWidth: 200, padding: 8 }}>
          <Card><CardContent><Typography variant="h6">{t("excused_absences")}</Typography><Typography>{excusedAbsences}</Typography></CardContent></Card>
        </div>
        <div style={{ flex: '1 1 25%', minWidth: 200, padding: 8 }}>
          <Card><CardContent><Typography variant="h6">{t("unexcused_absences")}</Typography><Typography>{unexcusedAbsences}</Typography></CardContent></Card>
        </div>
        <div style={{ flex: '1 1 25%', minWidth: 200, padding: 8 }}>
          <Card><CardContent><Typography variant="h6">{t("most_absent_worker")}</Typography><Typography>{mostAbsentWorker}</Typography></CardContent></Card>
        </div>
      </Box>
      <Box mt={2} style={{ height: 400, width: "100%", position: 'relative' }}>
        {loading && <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor="rgba(255,255,255,0.7)" zIndex={2}><CircularProgress /></Box>}
        <DataGrid
          rows={filteredAbsences}
          columns={columns}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50, 100]}
          loading={loading}
          autoHeight
        />
      </Box>
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{editId ? t("edit_absence") : t("add_absence")}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              name="worker_id"
              label={t('worker_id')}
              type="number"
              fullWidth
              value={form.worker_id}
              onChange={handleFormChange}
              required
              error={!form.worker_id}
              helperText={!form.worker_id ? t('required') : ''}
            />
            <TextField
              margin="dense"
              name="date"
              label={t('date')}
              type="date"
              fullWidth
              value={form.date}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              required
              error={!form.date}
              helperText={!form.date ? t('required') : ''}
            />
            <TextField
              margin="dense"
              name="reason"
              label={t('reason')}
              fullWidth
              value={form.reason}
              onChange={handleFormChange}
            />
            <FormControlLabel
              control={<Checkbox checked={form.is_excused} onChange={handleFormChange} name="is_excused" />}
              label={t('is_excused')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenForm(false); setEditId(null); }}>{t("cancel")}</Button>
            <Button type="submit" variant="contained">{t("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box p={2} width={isMobile ? 250 : 350}>
          {selected && (
            <>
              <Typography variant="h6">{t("absence_details")}</Typography>
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">{t("worker_id")}:</Typography>
                <Typography fontWeight={700}>{selected.worker?.custom_id || selected.worker_id}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("worker")}:</Typography>
                <Typography>{selected.worker?.name || selected.worker_id}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("civil_id")}:</Typography>
                <Typography>{selected.worker?.civil_id || '-'}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("job_title")}:</Typography>
                <Typography>{selected.worker?.job_title || '-'}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("nationality")}:</Typography>
                <Typography>{selected.worker?.nationality || '-'}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("company")}:</Typography>
                <Typography>{selected.worker?.company?.file_name || selected.worker?.company_id || '-'}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("license")}:</Typography>
                <Typography>{selected.worker?.license?.name || selected.worker?.license_id || '-'}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography>{t("date")}: {selected.date}</Typography>
              <Typography>{t("reason")}: {selected.reason}</Typography>
              <Typography>{t("is_excused")}: {selected.is_excused ? t("excused") : t("unexcused")}</Typography>
              {selected.deduction ? (
                <>
                  <Typography>{t("deduction_amount")}: {selected.deduction.amount}</Typography>
                  <Typography>{t("deduction_reason")}: {selected.deduction.reason}</Typography>
                  <Typography>{t("deduction_date")}: {selected.deduction.date}</Typography>
                </>
              ) : (
                <Typography>{t("no_deduction")}</Typography>
              )}
            </>
          )}
        </Box>
      </Drawer>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>{t('confirmDelete')}</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">{t('delete')}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} message={snackbar.message} />
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AbsencesPage;
