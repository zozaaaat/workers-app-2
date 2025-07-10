import React, { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Delete, Edit, Add, Search } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, IconButton, Tooltip } from "@mui/material";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const columns: GridColDef[] = [
    { field: "id", headerName: t("id"), width: 90 },
    { field: "worker", headerName: t("worker"), width: 150, valueGetter: (params: any) => { if (!params || !params.row) return ""; 
      if (!params || !params.row) return '';
      const worker = params.row.worker;
      if (worker) {
        if (worker.custom_id && worker.name) return `${worker.custom_id } - ${worker.name}`;
        if (worker.custom_id) return worker.custom_id;
        if (worker.name) return worker.name;
      }
      return params.row.worker_id || '';
    } },
    { field: "violationType", headerName: t("violationType"), width: 120 },
    { field: "date", headerName: t("date"), width: 120 },
    { field: "actions", headerName: t("actions"), width: 150, renderCell: (params: any) => (
      <Box>
        <Tooltip title={t("edit")}>
          <IconButton 
            onClick={() => {
              setEditViolation(params.row);
              setEditOpen(true);
            }}
            color="primary"
            aria-label={t("edit")}
            disabled={!canEdit}
          >
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("delete")}>
          <IconButton 
            onClick={() => handleDelete(params.row.id)}
            color="error"
            aria-label={t("delete")}
            disabled={!canEdit}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    )}
  ];
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/violations`)
      .then(res => {
        setRows(res.data);
        setFilteredRows(res.data);
      })
      .catch(error => {
        console.error("API Error:", error);
        setError(t('loadError'));
      })
      .finally(() => setLoading(false));
  }, [t]);

  // تصفية البيانات حسب البحث
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRows(rows);
    } else {
      const filtered = rows.filter(row => 
        row.worker?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.worker?.custom_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.violationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.date?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRows(filtered);
    }
  }, [searchTerm, rows]);

  const totalViolations = filteredRows.length;
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/violations/${deleteId}`).catch(error => console.error("API Error:", error));
      setSuccess(t('deleteSuccess'));
      setRows(rows.filter(r => r.id !== deleteId));
    } catch (error) { console.error("API Error:", error);
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
      const updatedRows = [...rows, res.data];
      setRows(updatedRows);
      setFilteredRows(updatedRows);
      setSuccess(t('addSuccess'));
      setAddOpen(false);
      setNewViolation({ worker: '', violationType: '', date: '' });
    } catch (error) {
      console.error("API Error:", error);
      setError(t('addError'));
    }
  };
  const handleEditViolation = async () => {
    if (!validateViolation(editViolation)) {
      setError(t('fillAllFields'));
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/violations/${editViolation.id}`, editViolation);
      const updatedRows = rows.map(r => r.id === editViolation.id ? res.data : r);
      setRows(updatedRows);
      setFilteredRows(updatedRows);
      setSuccess(t('editSuccess'));
      setEditOpen(false);
      setEditViolation(null);
    } catch (error) {
      console.error("API Error:", error);
      setError(t('editError'));
    }
  };
  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>{t("violations")}</Typography>
      {canEdit && (
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          sx={{ mb: 2 }} 
          onClick={() => setAddOpen(true)}
          aria-label={t('add_violation')}
        >
          {t('add_violation')}
        </Button>
      )}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField aria-label="input field" label={t("search_by_worker")} 
          size="small" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}/>
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>
          {t("total_violations")}: {totalViolations}
        </Typography>
      </Box>
      <Box mt={2} style={{ height: 400, width: "100%", position: 'relative' }}>
        {loading && <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor="rgba(255,255,255,0.7)" zIndex={2}><CircularProgress /></Box>}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pagination
          pageSizeOptions={[10, 20, 50, 100]}
          loading={loading}
          autoHeight
          getRowId={(row) => row.id}
          localeText={{
            noRowsLabel: t('no_data'),
            footerRowSelected: (count) => `${count} ${t('selected')}`,
          }}
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
            <TextField aria-label="input field" margin="dense" label={t('worker')} name="worker" value={newViolation.worker} onChange={handleAddChange} fullWidth required error={!newViolation.worker} helperText={!newViolation.worker ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('violationType')} name="violationType" value={newViolation.violationType} onChange={handleAddChange} fullWidth required error={!newViolation.violationType} helperText={!newViolation.violationType ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('date')} name="date" type="date" value={newViolation.date} onChange={handleAddChange} fullWidth required error={!newViolation.date} helperText={!newViolation.date ? t('required') : ''} InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddViolation} variant="contained">{t('add')}</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>{t('edit_violation')}</DialogTitle>
          <DialogContent>
            <TextField aria-label="input field" margin="dense" label={t('worker')} name="worker" value={editViolation?.worker || ''} onChange={handleEditChange} fullWidth required error={editViolation && !editViolation.worker} helperText={editViolation && !editViolation.worker ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('violationType')} name="violationType" value={editViolation?.violationType || ''} onChange={handleEditChange} fullWidth required error={editViolation && !editViolation.violationType} helperText={editViolation && !editViolation.violationType ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('date')} name="date" type="date" value={editViolation?.date || ''} onChange={handleEditChange} fullWidth required error={editViolation && !editViolation.date} helperText={editViolation && !editViolation.date ? t('required') : ''} InputLabelProps={{ shrink: true }} />
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
