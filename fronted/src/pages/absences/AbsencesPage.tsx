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
  Grid
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Info, Edit } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { API_URL } from '../../api';

// تعريف نوع العامل
interface Worker {
  id: number;
  name: string;
  civil_id?: string;
  nationality?: string;
  job_title?: string;
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [filterWorker, setFilterWorker] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [filterExcused, setFilterExcused] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);

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
      worker_id: absence.worker_id,
      date: absence.date,
      reason: absence.reason || "",
      is_excused: absence.is_excused,
    });
    setEditId(absence.id);
    setOpenForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await axios.delete(`${API_URL}/absences/${selected.id}`);
      setSnackbar({ open: true, message: t("deleted_successfully"), severity: "success" });
      setConfirmDelete(false);
      fetchAbsences();
    } catch (e) {
      setSnackbar({ open: true, message: t("error_deleting_data"), severity: "error" });
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
    { field: "worker", headerName: t("worker"), width: 180, valueGetter: (params: any) => params.row.worker?.name || params.row.worker_id },
    { field: "date", headerName: t("date"), width: 120 },
    { field: "reason", headerName: t("reason"), width: 180 },
    { field: "is_excused", headerName: t("is_excused"), width: 120, renderCell: (params: any) => params.value ? t("excused") : t("unexcused") },
    { field: "deduction", headerName: t("deduction"), width: 180, valueGetter: (params: any) => params.row.deduction ? `${params.row.deduction.amount} - ${params.row.deduction.reason}` : t("no_deduction") },
    {
      field: "actions",
      headerName: t("actions"),
      width: 160,
      renderCell: (params: any) => (
        <>
          <Tooltip title={t("details")}><IconButton onClick={() => { setSelected(params.row); setDrawerOpen(true); }}><Info /></IconButton></Tooltip>
          <Tooltip title={t("edit")}><IconButton color="primary" onClick={() => handleEdit(params.row)}><Edit /></IconButton></Tooltip>
          <Tooltip title={t("delete")}><IconButton color="error" onClick={() => { setSelected(params.row); setConfirmDelete(true); }}><Delete /></IconButton></Tooltip>
        </>
      )
    }
  ];

  const handleExportExcel = () => {
    const data = filteredAbsences.map(abs => ({
      id: abs.id,
      worker: abs.worker?.name || abs.worker_id,
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
    doc.autoTable({
      head: [[t("id"), t("worker"), t("date"), t("reason"), t("is_excused"), t("deduction")]],
      body: filteredAbsences.map(abs => [
        abs.id,
        abs.worker?.name || abs.worker_id,
        abs.date,
        abs.reason,
        abs.is_excused ? t("excused") : t("unexcused"),
        abs.deduction ? `${abs.deduction.amount} - ${abs.deduction.reason}` : t("no_deduction")
      ]),
    });
    doc.save("absences.pdf");
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>{t("absences")}</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => setOpenForm(true)}>{t("add_absence")}</Button>
      <Box mt={2} display="flex" gap={2} flexWrap="wrap">
        <TextField label={t("worker")} value={filterWorker} onChange={e => setFilterWorker(e.target.value)} size="small" />
        <TextField label={t("from_date")} type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label={t("to_date")} type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <FormControl size="small" style={{ minWidth: 120 }}>
          <InputLabel>{t("absence_type")}</InputLabel>
          <Select value={filterExcused} label={t("absence_type")} onChange={e => setFilterExcused(e.target.value)}>
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
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} md={3}>
          <Card><CardContent><Typography variant="h6">{t("total_absences")}</Typography><Typography>{totalAbsences}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card><CardContent><Typography variant="h6">{t("excused_absences")}</Typography><Typography>{excusedAbsences}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card><CardContent><Typography variant="h6">{t("unexcused_absences")}</Typography><Typography>{unexcusedAbsences}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card><CardContent><Typography variant="h6">{t("most_absent_worker")}</Typography><Typography>{mostAbsentWorker}</Typography></CardContent></Card>
        </Grid>
      </Grid>
      <Box mt={2} style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={filteredAbsences}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
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
              label={t('worker_id') || 'العامل'}
              type="number"
              fullWidth
              value={form.worker_id}
              onChange={handleFormChange}
              required
            />
            <TextField
              margin="dense"
              name="date"
              label={t('date') || 'التاريخ'}
              type="date"
              fullWidth
              value={form.date}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              margin="dense"
              name="reason"
              label={t('reason') || 'السبب'}
              fullWidth
              value={form.reason}
              onChange={handleFormChange}
            />
            <FormControlLabel
              control={<Checkbox checked={form.is_excused} onChange={handleFormChange} name="is_excused" />}
              label={t('is_excused') || 'غياب بعذر'}
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
              <Typography>{t("worker")}: {selected.worker?.name || selected.worker_id}</Typography>
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
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>{t("confirm_delete")}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>{t("cancel")}</Button>
          <Button color="error" onClick={handleDelete}>{t("delete")}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
};

export default AbsencesPage;
