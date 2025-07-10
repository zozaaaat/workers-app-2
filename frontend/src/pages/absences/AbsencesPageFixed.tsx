import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  Snackbar,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Info, Edit, Search } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import { useAuth } from "../../context/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";

// تعريف نوع العامل
interface Worker {
  id: number;
  name: string;
  custom_id: string;
  civil_id?: string;
  job_title?: string;
  nationality?: string;
  company?: { file_name: string };
  license?: { name: string };
}

// تعريف نوع الغياب
interface Absence {
  id: number;
  worker_id: number;
  worker?: Worker;
  date: string;
  reason: string;
  is_excused: boolean;
  deduction?: {
    id: number;
    amount: number;
    reason: string;
  };
}

const AbsencesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({ worker_id: "", date: "", reason: "", is_excused: false });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "info" | "success" | "error" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Absence | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // فلترة البيانات
  const filteredAbsences = absences.filter(absence => 
    absence.worker?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    absence.worker?.custom_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    absence.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    absence.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchAbsences = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/absences/`);
      setAbsences(res.data);
    } catch (error) {
      console.error("API Error:", error);
      setSnackbar({ open: true, message: t("error_loading_data"), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/absences/${deleteId}`);
      setAbsences(absences.filter(abs => abs.id !== deleteId));
      setSnackbar({ open: true, message: t("delete_success"), severity: "success" });
    } catch (error) {
      console.error("API Error:", error);
      setSnackbar({ open: true, message: t("delete_error"), severity: "error" });
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/absences/${editingId}`, form);
        setAbsences(absences.map(abs => abs.id === editingId ? res.data : abs));
        setSnackbar({ open: true, message: t("update_success"), severity: "success" });
      } else {
        const res = await axios.post(`${API_URL}/absences/`, form);
        setAbsences([...absences, res.data]);
        setSnackbar({ open: true, message: t("create_success"), severity: "success" });
      }
      setOpenForm(false);
      setForm({ worker_id: "", date: "", reason: "", is_excused: false });
      setEditingId(null);
    } catch (error) {
      console.error("API Error:", error);
      setSnackbar({ open: true, message: t("save_error"), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (absence: Absence) => {
    setForm({
      worker_id: absence.worker_id.toString(),
      date: absence.date,
      reason: absence.reason,
      is_excused: absence.is_excused
    });
    setEditingId(absence.id);
    setOpenForm(true);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: t("id"), width: 90 },
    { 
      field: "worker", 
      headerName: t("worker"), 
      width: 200, 
      valueGetter: (params: any) => {
        if (!params || !params.row) return '';
        const worker = params.row.worker;
        if (!worker) return params.row.worker_id || '';
        if (worker.custom_id && worker.name) return `${worker.custom_id} - ${worker.name}`;
        if (worker.custom_id) return worker.custom_id;
        if (worker.name) return worker.name;
        return params.row.worker_id || '';
      }
    },
    { field: "date", headerName: t("date"), width: 120 },
    { field: "reason", headerName: t("reason"), width: 180 },
    { 
      field: "is_excused", 
      headerName: t("is_excused"), 
      width: 120, 
      renderCell: (params: any) => params.value ? t("excused") : t("unexcused") 
    },
    {
      field: "actions",
      headerName: t("actions"),
      width: 160,
      renderCell: (params: any) => (
        <Box>
          <Tooltip title={t("details")}>
            <IconButton 
              onClick={() => { setSelected(params.row); setDrawerOpen(true); }}
              aria-label={t("details")}
            >
              <Info />
            </IconButton>
          </Tooltip>
          {canEdit && (
            <>
              <Tooltip title={t("edit")}>
                <IconButton 
                  onClick={() => handleEdit(params.row)}
                  color="primary"
                  aria-label={t("edit")}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("delete")}>
                <IconButton 
                  onClick={() => handleDelete(params.row.id)}
                  color="error"
                  aria-label={t("delete")}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>{t("absences")}</Typography>
      
      <Box display="flex" gap={2} mb={2}>
        {canEdit && (
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setOpenForm(true)}
            aria-label={t("add_absence")}
          >
            {t("add_absence")}
          </Button>
        )}
        
        <TextField 
          label={t("search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          aria-label={t("search")}
        />
      </Box>

      <Box mt={2} style={{ height: 400, width: "100%", position: 'relative' }}>
        {loading && (
          <Box 
            position="absolute" 
            top={0} 
            left={0} 
            width="100%" 
            height="100%" 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            bgcolor="rgba(255,255,255,0.7)" 
            zIndex={2}
          >
            <CircularProgress />
          </Box>
        )}
        
        <DataGrid
          rows={filteredAbsences}
          columns={columns}
          autoHeight
          checkboxSelection={false}
          disableRowSelectionOnClick
        />
      </Box>

      {/* نموذج الإضافة/التعديل */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? t("edit_absence") : t("add_absence")}</DialogTitle>
          <DialogContent>
            <TextField aria-label="input field" margin="dense"
              label={t("worker_id")}
              name="worker_id"
              value={form.worker_id}
              onChange={(e) => setForm({ ...form, worker_id: e.target.value })}
              fullWidth
              required
              type="number"
            />
            <TextField aria-label="input field" margin="dense"
              label={t("date")}
              name="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField aria-label="input field" margin="dense"
              label={t("reason")}
              name="reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              fullWidth
              required
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_excused}
                  onChange={(e) => setForm({ ...form, is_excused: e.target.checked })}
                  name="is_excused"
                />
              }
              label={t("is_excused")}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>{t("cancel")}</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingId ? t("update") : t("create")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* نافذة التأكيد للحذف */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t("confirm_delete")}</DialogTitle>
        <DialogContent>
          <Typography>{t("delete_confirm_message")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t("cancel")}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* درج التفاصيل */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box p={2} width={350}>
          {selected && (
            <>
              <Typography variant="h6">{t("absence_details")}</Typography>
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">{t("worker_id")}:</Typography>
                <Typography fontWeight={700}>{selected.worker?.custom_id || selected.worker_id}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary" mt={1}>{t("worker")}:</Typography>
                <Typography>{selected.worker?.name || selected.worker_id}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary" mt={1}>{t("date")}:</Typography>
                <Typography>{selected.date}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary" mt={1}>{t("reason")}:</Typography>
                <Typography>{selected.reason}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary" mt={1}>{t("is_excused")}:</Typography>
                <Typography>{selected.is_excused ? t("excused") : t("unexcused")}</Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              {selected.worker && (
                <Box>
                  <Typography variant="h6" mb={1}>{t("worker_details")}</Typography>
                  <Typography variant="subtitle2" color="textSecondary">{t("civil_id")}:</Typography>
                  <Typography>{selected.worker.civil_id || '-'}</Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary" mt={1}>{t("job_title")}:</Typography>
                  <Typography>{selected.worker.job_title || '-'}</Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary" mt={1}>{t("nationality")}:</Typography>
                  <Typography>{selected.worker.nationality || '-'}</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Drawer>

      {/* إشعارات */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AbsencesPage;
