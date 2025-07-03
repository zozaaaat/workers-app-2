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

interface Violation {
  id: number;
  worker_name: string;
  company?: string;
  violation_type?: string;
  date?: string;
  penalty?: string;
  notes?: string;
}

const ViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editViolation, setEditViolation] = useState<Violation | null>(null);
  interface ViolationForm {
    worker_id?: number;
    description?: string;
    penalty_amount?: number;
    date?: string;
  }
  const [form, setForm] = useState<ViolationForm>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ violation_type: '', company: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  const { role } = useAuth();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/violations");
      setViolations(res.data);
    } catch {
      setError(t('general.load_error') || "تعذر تحميل المخالفات");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchViolations(); }, []);

  const handleOpenDialog = (violation?: Violation) => {
    setEditViolation(violation || null);
    setForm(violation ? { ...violation } : {});
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditViolation(null);
    setForm({});
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    try {
      if (editViolation) {
        await api.put(`/violations/${editViolation.id}`, form);
        setSuccess(t('general.edit_success') || "تم التحديث بنجاح");
      } else {
        await api.post("/violations", form);
        setSuccess(t('general.add_success') || "تمت الإضافة بنجاح");
      }
      fetchViolations();
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
      await api.delete(`/violations/${deleteId}`);
      setSuccess(t('general.delete_success'));
      fetchViolations();
    } catch {
      setError(t('general.delete_error'));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };
  const handleRowClick = (violation: Violation) => {
    setSelectedViolation(violation);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedViolation(null);
  };
  // فلترة متقدمة
  const advancedFilteredViolations = violations.filter(v =>
    (v.worker_name.includes(search) || (v.company || '').includes(search)) &&
    (filter.violation_type ? v.violation_type === filter.violation_type : true) &&
    (filter.company ? v.company === filter.company : true)
  );
  // طباعة
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=900');
    if (printWindow) {
      printWindow.document.write('<html><head><title>' + t('sidebar.violations') + '</title>');
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
      <Typography variant="h5" mb={2}>{t('sidebar.violations')}</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <TextField
          label={t('general.search') + ' باسم العامل أو الشركة'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 220 }}
        />
        <TextField
          label={t('general.violation_type')}
          value={filter.violation_type}
          onChange={e => setFilter(f => ({ ...f, violation_type: e.target.value }))}
          sx={{ width: 150 }}
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
                  <TableCell>{t('general.violation_type')}</TableCell>
                  <TableCell>{t('general.date')}</TableCell>
                  <TableCell>{t('general.penalty')}</TableCell>
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
                ) : advancedFilteredViolations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(violation => (
                  <TableRow key={violation.id} hover onClick={() => handleRowClick(violation)} style={{ cursor: 'pointer' }}>
                    <TableCell>{violation.worker_name}</TableCell>
                    <TableCell>{violation.company}</TableCell>
                    <TableCell>{violation.violation_type}</TableCell>
                    <TableCell>{violation.date}</TableCell>
                    <TableCell>{violation.penalty}</TableCell>
                    <TableCell>
                      {role === "admin" || role === "employee" ? (
                        <>
                          <IconButton color="primary" onClick={e => { e.stopPropagation(); handleOpenDialog(violation); }}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(violation.id); }}><DeleteIcon /></IconButton>
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
          count={advancedFilteredViolations.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>
      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editViolation ? t('general.edit') : t('general.add')}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label={t('general.worker_id') || 'العامل'}
            name="worker_id"
            type="number"
            value={form.worker_id || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.description') || 'الوصف'}
            name="description"
            value={form.description || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.penalty_amount') || 'قيمة الغرامة'}
            name="penalty_amount"
            type="number"
            value={form.penalty_amount || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.date') || 'التاريخ'}
            name="date"
            type="date"
            value={form.date || ""}
            onChange={handleFormChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
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
          <Typography variant="h6" mb={2}>{t('sidebar.violations')} - {selectedViolation?.worker_name}</Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem><ListItemText primary={t('general.company') + ': ' + (selectedViolation?.company || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.violation_type') + ': ' + (selectedViolation?.violation_type || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.date') + ': ' + (selectedViolation?.date || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.penalty') + ': ' + (selectedViolation?.penalty || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.notes') + ': ' + (selectedViolation?.notes || '')} /></ListItem>
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

export default ViolationsPage;
