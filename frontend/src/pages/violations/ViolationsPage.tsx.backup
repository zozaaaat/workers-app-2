import React, { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const ViolationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newViolation, setNewViolation] = useState({ worker: '', violationType: '', date: '' });
  const [editViolation, setEditViolation] = useState<any>(null);
  const columns: GridColDef[] = [
    { field: "id", headerName: t("id"), width: 90 },
    { field: "worker", headerName: t("worker"), width: 150, valueGetter: (params: any) => {
      const worker = params.row.worker;
      if (worker) {
        if (worker.custom_id && worker.name) return `${worker.custom_id} - ${worker.name}`;
        if (worker.custom_id) return worker.custom_id;
        if (worker.name) return worker.name;
      }
      return params.row.worker_id || '';
    } },
    { field: "violationType", headerName: t("violationType"), width: 120 },
    { field: "date", headerName: t("date"), width: 120 },
    { field: "actions", headerName: t("actions"), width: 150, renderCell: () => (<><Edit /><Delete /></>) }
  ];
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/violations`).then(res => setRows(res.data)).finally(() => setLoading(false));
  }, []);
  const totalViolations = rows.length;
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/violations/${deleteId}`);
      setSuccess(t('deleteSuccess'));
      setRows(rows.filter(r => r.id !== deleteId));
    } catch {
      setError(t('deleteError'));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };
  // التحقق من صحة النموذج
  const validateViolation = (violation: any) => {
    if (!violation.worker || !violation.violationType || !violation.date) return false;
    return true;
  };
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewViolation({ ...newViolation, [e.target.name]: e.target.value });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditViolation({ ...editViolation, [e.target.name]: e.target.value });
  };
  const handleAddViolation = async () => {
    if (!validateViolation(newViolation)) {
      setError(t('fillAllFields'));
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/violations`, newViolation);
      setRows([...rows, res.data]);
      setSuccess(t('addSuccess'));
      setAddOpen(false);
      setNewViolation({ worker: '', violationType: '', date: '' });
    } catch {
      setError(t('addError'));
    }
  };
  const handleEditOpen = (violation: any) => {
    setEditViolation(violation);
    setEditOpen(true);
  };
  const handleEditViolation = async () => {
    if (!validateViolation(editViolation)) {
      setError(t('fillAllFields'));
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/violations/${editViolation.id}`, editViolation);
      setRows(rows.map(r => r.id === editViolation.id ? res.data : r));
      setSuccess(t('editSuccess'));
      setEditOpen(false);
      setEditViolation(null);
    } catch {
      setError(t('editError'));
    }
  };
  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>{t("violations")}</Typography>
      {canEdit && <Button variant="contained" startIcon={<Delete />} sx={{ mb: 2 }} onClick={() => setAddOpen(true)}>{t('add_violation')}</Button>}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField label={t("search_by_worker")} size="small" />
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>{t("total_violations")}: {totalViolations}</Typography>
      </Box>
      <Box mt={2} style={{ height: 400, width: "100%", position: 'relative' }}>
        {loading && <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor="rgba(255,255,255,0.7)" zIndex={2}><CircularProgress /></Box>}
        <DataGrid
          rows={rows}
          columns={columns.map(col =>
            col.field === "actions"
              ? { ...col, renderCell: canEdit ? (params => (
                <>
                  <Edit onClick={() => handleEditOpen(params.row)} style={{ cursor: 'pointer', color: '#1976d2', marginRight: 8 }} />
                  <Delete onClick={e => { e.stopPropagation(); handleDelete(params.row.id); }} style={{ cursor: 'pointer', color: 'red' }} />
                </>
              )) : () => null }
              : col
          )}
          pagination
          pageSizeOptions={[10, 20, 50, 100]}
          loading={loading}
          autoHeight
        />
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>{t('confirmDelete')}</DialogTitle>
          <DialogContent>{t('confirmDelete')}</DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>{t('cancel')}</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">{t('delete')}</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
          <DialogTitle>{t('add_violation')}</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label={t('worker')} name="worker" value={newViolation.worker} onChange={handleAddChange} fullWidth required error={!newViolation.worker} helperText={!newViolation.worker ? t('required') : ''} />
            <TextField margin="dense" label={t('violationType')} name="violationType" value={newViolation.violationType} onChange={handleAddChange} fullWidth required error={!newViolation.violationType} helperText={!newViolation.violationType ? t('required') : ''} />
            <TextField margin="dense" label={t('date')} name="date" type="date" value={newViolation.date} onChange={handleAddChange} fullWidth required error={!newViolation.date} helperText={!newViolation.date ? t('required') : ''} InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddViolation} variant="contained">{t('add')}</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>{t('edit_violation')}</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label={t('worker')} name="worker" value={editViolation?.worker || ''} onChange={handleEditChange} fullWidth required error={editViolation && !editViolation.worker} helperText={editViolation && !editViolation.worker ? t('required') : ''} />
            <TextField margin="dense" label={t('violationType')} name="violationType" value={editViolation?.violationType || ''} onChange={handleEditChange} fullWidth required error={editViolation && !editViolation.violationType} helperText={editViolation && !editViolation.violationType ? t('required') : ''} />
            <TextField margin="dense" label={t('date')} name="date" type="date" value={editViolation?.date || ''} onChange={handleEditChange} fullWidth required error={editViolation && !editViolation.date} helperText={editViolation && !editViolation.date ? t('required') : ''} InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleEditViolation} variant="contained">{t('save')}</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};
export default ViolationsPage;
