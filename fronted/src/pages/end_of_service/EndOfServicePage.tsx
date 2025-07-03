import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Paper, Button, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Drawer, List, ListItem, ListItemText, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from '@mui/icons-material/Print';
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../api';

interface Entitlement {
  id: number;
  worker_name: string;
  company?: string;
  calculation_date?: string;
  calculated_amount?: number;
  notes?: string;
}

const EntitlementsPage: React.FC = () => {
  const [records, setRecords] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editRecord, setEditRecord] = useState<Entitlement | null>(null);
  const [form, setForm] = useState<Partial<Entitlement>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ company: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Entitlement | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  const { role } = useAuth();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/entitlements");
      setRecords(res.data);
    } catch {
      setError(t('general.load_error') || "تعذر تحميل المستحقات");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRecords(); }, []);

  const handleOpenDialog = (record?: Entitlement) => {
    setEditRecord(record || null);
    setForm(record ? { ...record } : {});
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditRecord(null);
    setForm({});
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    try {
      if (editRecord) {
        await api.put(`/entitlements/${editRecord.id}`, form);
        setSuccess(t('general.edit_success') || "تم التحديث بنجاح");
      } else {
        await api.post("/entitlements", form);
        setSuccess(t('general.add_success') || "تمت الإضافة بنجاح");
      }
      fetchRecords();
      handleCloseDialog();
    } catch {
      setError(t('general.save_error') || "حدث خطأ أثناء الحفظ");
    }
  };
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/entitlements/${deleteId}`);
      setSuccess(t('general.delete_success'));
      fetchRecords();
    } catch {
      setError(t('general.delete_error'));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };
  const handleRowClick = (record: Entitlement) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRecord(null);
  };
  // فلترة متقدمة
  const advancedFilteredRecords = records.filter(r =>
    (r.worker_name.includes(search) || (r.company || '').includes(search)) &&
    (filter.company ? r.company === filter.company : true)
  );
  // طباعة
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=900');
    if (printWindow) {
      printWindow.document.write('<html><head><title>' + t('sidebar.entitlements') + '</title>');
      printWindow.document.write('<style>body{font-family:Cairo,Arial,sans-serif;direction:rtl;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:center;}th{background:#eee;}</style>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" mb={2}>{t('sidebar.entitlements')}</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <TextField
          label={t('general.search') + ' باسم العامل أو الشركة'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 220 }}
        />
        <TextField
          label={t('general.company')}
          value={filter.company}
          onChange={e => setFilter(f => ({ ...f, company: e.target.value }))}
          sx={{ width: 150 }}
        />
        <Box flexGrow={1} />
        <Box>
          <Button variant="outlined" sx={{ mx: 1 }} onClick={handlePrint} startIcon={<PrintIcon />}>{t('general.print')}</Button>
          {role === "admin" && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              {t('general.add')}
            </Button>
          )}
        </Box>
      </Box>
      <Paper>
        <div ref={printRef} style={{ display: 'block' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('general.worker_name')}</TableCell>
                  <TableCell>{t('general.company')}</TableCell>
                  <TableCell>{t('general.calculation_date')}</TableCell>
                  <TableCell>{t('general.calculated_amount')}</TableCell>
                  <TableCell>{t('general.notes')}</TableCell>
                  <TableCell>{t('general.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : advancedFilteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(record => (
                  <TableRow key={record.id} hover onClick={() => handleRowClick(record)} style={{ cursor: 'pointer' }}>
                    <TableCell>{record.worker_name}</TableCell>
                    <TableCell>{record.company}</TableCell>
                    <TableCell>{record.calculation_date}</TableCell>
                    <TableCell>{record.calculated_amount}</TableCell>
                    <TableCell>{record.notes}</TableCell>
                    <TableCell>
                      {role === "admin" || role === "employee" ? (
                        <>
                          <IconButton color="primary" onClick={e => { e.stopPropagation(); handleOpenDialog(record); }}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(record.id); }}><DeleteIcon /></IconButton>
                        </>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <TablePagination
          component="div"
          count={advancedFilteredRecords.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>
      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editRecord ? t('general.edit') : t('general.add')}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label={t('general.worker_name')}
            name="worker_name"
            value={form.worker_name || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.company')}
            name="company"
            value={form.company || ""}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label={t('general.calculation_date')}
            name="calculation_date"
            type="date"
            value={form.calculation_date || ""}
            onChange={handleFormChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label={t('general.calculated_amount')}
            name="calculated_amount"
            type="number"
            value={form.calculated_amount || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.notes')}
            name="notes"
            value={form.notes || ""}
            onChange={handleFormChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('general.cancel')}</Button>
          {role === "admin" || role === "employee" ? (
            <Button onClick={handleSave} variant="contained">{t('general.save')}</Button>
          ) : null}
        </DialogActions>
      </Dialog>
      {/* تأكيد الحذف */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('general.confirm_delete_title')}</DialogTitle>
        <DialogContent>{t('general.confirm_delete_msg')}</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('general.cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">{t('general.delete')}</Button>
        </DialogActions>
      </Dialog>
      {/* Drawer لعرض التفاصيل */}
      <Drawer anchor="left" open={detailsOpen} onClose={handleCloseDetails} sx={{ zIndex: 1301 }}>
        <Box sx={{ width: 350, p: 3 }}>
          <Typography variant="h6" mb={2}>{t('sidebar.entitlements')} - {selectedRecord?.worker_name}</Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem><ListItemText primary={t('general.company') + ': ' + (selectedRecord?.company || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.calculation_date') + ': ' + (selectedRecord?.calculation_date || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.calculated_amount') + ': ' + (selectedRecord?.calculated_amount || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.notes') + ': ' + (selectedRecord?.notes || '')} /></ListItem>
          </List>
          <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={handleCloseDetails}>{t('general.cancel')}</Button>
        </Box>
      </Drawer>
      {/* Snackbar */}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}> 
        <Alert severity="error">{error}</Alert> 
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}> 
        <Alert severity="success">{success}</Alert> 
      </Snackbar>
    </Box>
  );
};

export default EntitlementsPage;
