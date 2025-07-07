import React, { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Drawer, Divider } from "@mui/material";

const EndOfServicePage: React.FC = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
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
    { field: "reason", headerName: t("reason"), width: 200 },
    { field: "date", headerName: t("date"), width: 120 },
    { field: "actions", headerName: t("actions"), width: 150, renderCell: (params: any) => (<><Edit /><Delete onClick={() => handleDelete(params.row.id)} /></>) }
  ];
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/end_of_service`)
      .then(res => setRows(res.data))
      .finally(() => setLoading(false));
  }, []);
  const totalEndOfService = rows.length;
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/end_of_service/${deleteId}`);
      setSuccess(t('deleteSuccess'));
      setRows(rows.filter(r => r.id !== deleteId));
    } catch {
      setError(t('deleteError'));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };
  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>{t("end_of_service")}</Typography>
      <Button variant="contained" startIcon={<Delete />} sx={{ mb: 2 }}>{t("add_end_of_service")}</Button>
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField label={t("search_by_worker")} size="small" />
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>{t("total_end_of_service")}: {totalEndOfService}</Typography>
      </Box>
      <Box mt={2} style={{ height: 400, width: "100%", position: 'relative' }}>
        {loading && <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor="rgba(255,255,255,0.7)" zIndex={2}><CircularProgress /></Box>}
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          onRowClick={(params) => { setSelected(params.row); setDrawerOpen(true); }}
        />
      </Box>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box p={2} width={350}>
          {selected && (
            <>
              <Typography variant="h6">{t("end_of_service_details")}</Typography>
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
              <Typography>{t("reason")}: {selected.reason}</Typography>
              <Typography>{t("date")}: {selected.date}</Typography>
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
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};
export default EndOfServicePage;
