import React, { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Drawer, Divider } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const LeavesPage: React.FC = () => {
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
  const [newLeave, setNewLeave] = useState({ worker: '', type: '', from: '', to: '' });
  const [editLeave, setEditLeave] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
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
    { field: "type", headerName: t("type"), width: 120 },
    { field: "from", headerName: t("from"), width: 120 },
    { field: "to", headerName: t("to"), width: 120 },
    { field: "actions", headerName: t("actions"), width: 150, renderCell: (params: any) => (<><Edit onClick={() => {}} /><Delete onClick={() => handleDelete(params.row.id)} /></>) }
  ];
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/leaves`).then(res => setRows(res.data)).finally(() => setLoading(false));
  }, []);
  const totalLeaves = rows.length;
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/leaves/${deleteId}`);
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
  const validateLeave = (leave: any) => {
    if (!leave.worker || !leave.type || !leave.from || !leave.to) return false;
    return true;
  };
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLeave({ ...newLeave, [e.target.name]: e.target.value });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditLeave({ ...editLeave, [e.target.name]: e.target.value });
  };
  const handleAddLeave = async () => {
    if (!validateLeave(newLeave)) {
      setError(t('fillAllFields'));
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/leaves`, newLeave);
      setRows([...rows, res.data]);
      setSuccess(t('addSuccess'));
      setAddOpen(false);
      setNewLeave({ worker: '', type: '', from: '', to: '' });
    } catch {
      setError(t('addError'));
    }
  };
  const handleEditLeave = async () => {
    if (!validateLeave(editLeave)) {
      setError(t('fillAllFields'));
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/leaves/${editLeave.id}`, editLeave);
      setRows(rows.map(r => r.id === editLeave.id ? res.data : r));
      setSuccess(t('editSuccess'));
      setEditOpen(false);
      setEditLeave(null);
    } catch {
      setError(t('editError'));
    }
  };
  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>{t("leaves")}</Typography>
      {canEdit && <Button variant="contained" startIcon={<Delete />} sx={{ mb: 2 }} onClick={() => setAddOpen(true)}>{t("add_leave")}</Button>}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField label={t("search_by_worker")} size="small" />
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>{t("total_leaves")}: {totalLeaves}</Typography>
      </Box>
      <Box mt={2} style={{ height: 400, width: "100%", position: 'relative' }}>
        {loading && <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor="rgba(255,255,255,0.7)" zIndex={2}><CircularProgress /></Box>}
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          onRowClick={(params) => { setSelected(params.row); setDrawerOpen(true); }}
        />
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>{t('confirmDelete')}</DialogTitle>
          <DialogContent>{t('confirmDelete')}</DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>{t('cancel')}</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">{t('delete')}</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
        <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
          <DialogTitle>{t('add_leave')}</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label={t('worker')} name="worker" value={newLeave.worker} onChange={handleAddChange} fullWidth required error={!newLeave.worker} helperText={!newLeave.worker ? t('required') : ''} />
            <TextField margin="dense" label={t('type')} name="type" value={newLeave.type} onChange={handleAddChange} fullWidth required error={!newLeave.type} helperText={!newLeave.type ? t('required') : ''} />
            <TextField margin="dense" label={t('from')} name="from" type="date" value={newLeave.from} onChange={handleAddChange} fullWidth required error={!newLeave.from} helperText={!newLeave.from ? t('required') : ''} InputLabelProps={{ shrink: true }} />
            <TextField margin="dense" label={t('to')} name="to" type="date" value={newLeave.to} onChange={handleAddChange} fullWidth required error={!newLeave.to} helperText={!newLeave.to ? t('required') : ''} InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddLeave} variant="contained">{t('add')}</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>{t('edit_leave')}</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label={t('worker')} name="worker" value={editLeave?.worker || ''} onChange={handleEditChange} fullWidth required error={editLeave && !editLeave.worker} helperText={editLeave && !editLeave.worker ? t('required') : ''} />
            <TextField margin="dense" label={t('type')} name="type" value={editLeave?.type || ''} onChange={handleEditChange} fullWidth required error={editLeave && !editLeave.type} helperText={editLeave && !editLeave.type ? t('required') : ''} />
            <TextField margin="dense" label={t('from')} name="from" type="date" value={editLeave?.from || ''} onChange={handleEditChange} fullWidth required error={editLeave && !editLeave.from} helperText={editLeave && !editLeave.from ? t('required') : ''} InputLabelProps={{ shrink: true }} />
            <TextField margin="dense" label={t('to')} name="to" type="date" value={editLeave?.to || ''} onChange={handleEditChange} fullWidth required error={editLeave && !editLeave.to} helperText={editLeave && !editLeave.to ? t('required') : ''} InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleEditLeave} variant="contained">{t('save')}</Button>
          </DialogActions>
        </Dialog>
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={2} width={350}>
            {selected && (
              <>
                <Typography variant="h6">{t("leave_details")}</Typography>
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
                <Typography>{t("type")}: {selected.type}</Typography>
                <Typography>{t("from")}: {selected.from}</Typography>
                <Typography>{t("to")}: {selected.to}</Typography>
              </>
            )}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};
export default LeavesPage;
