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

interface Worker {
  id?: number;
  civil_id: string;
  name: string;
  nationality: string;
  worker_type: string;
  job_title: string;
  hire_date: string;
  work_permit_start: string;
  work_permit_end: string;
  salary: number;
  company_id: number;
  status?: string;
  phone?: string;
  address?: string;
}

const WorkersPage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [form, setForm] = useState<Partial<Worker>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ status: '', company_id: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  const { role } = useAuth();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchWorkers = React.useCallback(async () => {
    setLoading(true);
    try {
      // إرسال skip و limit كأرقام صحيحة
      const paramsObj = { skip: 0, limit: 100 } as const;
      const query = new URLSearchParams(window.location.search);
      const licenseId = query.get('licenseId');
      const endpoint = licenseId ? `/workers/by-license/${licenseId}` : '/workers';
      const res = await api.get(endpoint, { params: paramsObj });
      setWorkers(res.data);
    } catch {
      setError(t('general.load_error') || "تعذر تحميل العمال");
    } finally {
      setLoading(false);
    }
  }, [api, t]);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const handleOpenDialog = (worker?: Worker) => {
    setEditWorker(worker || null);
    setForm(worker ? { ...worker } : {});
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditWorker(null);
    setForm({});
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    try {
      // تأكد من تحويل الحقول الرقمية
      const payload = {
        ...form,
        salary: form.salary ? Number(form.salary) : 0,
        company_id: form.company_id ? Number(form.company_id) : undefined,
        hire_date: form.hire_date ? form.hire_date : undefined,
        work_permit_start: form.work_permit_start ? form.work_permit_start : undefined,
        work_permit_end: form.work_permit_end ? form.work_permit_end : undefined,
      };
      if (editWorker) {
        await api.put(`/workers/${editWorker.id}`, payload);
        setSuccess(t('general.edit_success') || "تم التحديث بنجاح");
      } else {
        await api.post("/workers", payload);
        setSuccess(t('general.add_success') || "تمت الإضافة بنجاح");
      }
      fetchWorkers();
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
      await api.delete(`/workers/${deleteId}`);
      setSuccess(t('general.delete_success'));
      fetchWorkers();
    } catch {
      setError(t('general.delete_error'));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };
  const handleRowClick = (worker: Worker) => {
    setSelectedWorker(worker);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedWorker(null);
  };
  // فلترة متقدمة
  const advancedFilteredWorkers = workers.filter(w =>
    (w.name?.includes(search) || w.civil_id?.includes(search) || w.nationality?.includes(search)) &&
    (filter.status ? w.status === filter.status : true) &&
    (filter.company_id ? w.company_id === Number(filter.company_id) : true)
  );
  // طباعة
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=900');
    if (printWindow) {
      printWindow.document.write('<html><head><title>' + t('sidebar.workers') + '</title>');
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
      <Typography variant="h5" mb={2}>{t('sidebar.workers')}</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <TextField
          label={t('general.search') + ' بالاسم أو الهوية'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 220 }}
        />
        <TextField
          label={t('general.status')}
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          sx={{ width: 150 }}
        />
        <TextField
          label={t('general.company')}
          value={filter.company_id}
          onChange={e => setFilter(f => ({ ...f, company_id: e.target.value }))}
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
                  <TableCell>{t('general.civil_id')}</TableCell>
                  <TableCell>{t('general.name')}</TableCell>
                  <TableCell>{t('general.nationality')}</TableCell>
                  <TableCell>{t('general.worker_type')}</TableCell>
                  <TableCell>{t('general.job_title')}</TableCell>
                  <TableCell>{t('general.hire_date')}</TableCell>
                  <TableCell>{t('general.company_id')}</TableCell>
                  <TableCell>{t('general.status')}</TableCell>
                  <TableCell>{t('general.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : advancedFilteredWorkers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(worker => (
                  <TableRow key={worker.id} hover onClick={() => handleRowClick(worker)} style={{ cursor: 'pointer' }}>
                    <TableCell>{worker.civil_id}</TableCell>
                    <TableCell>{worker.name}</TableCell>
                    <TableCell>{worker.nationality}</TableCell>
                    <TableCell>{worker.worker_type}</TableCell>
                    <TableCell>{worker.job_title}</TableCell>
                    <TableCell>{worker.hire_date}</TableCell>
                    <TableCell>{worker.company_id}</TableCell>
                    <TableCell>{worker.status}</TableCell>
                    <TableCell>
                      {role === "admin" || role === "employee" ? (
                        <>
                          <IconButton color="primary" onClick={e => { e.stopPropagation(); handleOpenDialog(worker); }}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(worker.id!); }}><DeleteIcon /></IconButton>
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
          count={advancedFilteredWorkers.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>
      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editWorker ? t('general.edit') : t('general.add')}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label={t('general.civil_id') || 'الرقم المدني'} name="civil_id" value={form.civil_id || ""} onChange={handleFormChange} fullWidth required />
          <TextField
            margin="dense"
            label={t('general.name') || 'اسم العامل'}
            name="name"
            value={form.name || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.nationality') || 'الجنسية'}
            name="nationality"
            value={form.nationality || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.worker_type') || 'نوع العامل'}
            name="worker_type"
            value={form.worker_type || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.job_title') || 'المسمى الوظيفي'}
            name="job_title"
            value={form.job_title || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.hire_date') || 'تاريخ التعيين'}
            name="hire_date"
            type="date"
            value={form.hire_date || ""}
            onChange={handleFormChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label={t('general.work_permit_start') || 'بداية تصريح العمل'}
            name="work_permit_start"
            type="date"
            value={form.work_permit_start || ""}
            onChange={handleFormChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label={t('general.work_permit_end') || 'نهاية تصريح العمل'}
            name="work_permit_end"
            type="date"
            value={form.work_permit_end || ""}
            onChange={handleFormChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label={t('general.salary') || 'الراتب'}
            name="salary"
            type="number"
            value={form.salary || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.company_id') || 'الشركة'}
            name="company_id"
            type="number"
            value={form.company_id || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.status') || 'الحالة'}
            name="status"
            value={form.status || ""}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label={t('general.phone') || 'الهاتف'}
            name="phone"
            value={form.phone || ""}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label={t('general.address') || 'العنوان'}
            name="address"
            value={form.address || ""}
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
          <Typography variant="h6" mb={2}>{t('sidebar.workers')} - {selectedWorker?.name}</Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem><ListItemText primary={t('general.civil_id') + ': ' + (selectedWorker?.civil_id || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.name') + ': ' + (selectedWorker?.name || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.nationality') + ': ' + (selectedWorker?.nationality || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.worker_type') + ': ' + (selectedWorker?.worker_type || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.job_title') + ': ' + (selectedWorker?.job_title || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.hire_date') + ': ' + (selectedWorker?.hire_date || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.company_id') + ': ' + (selectedWorker?.company_id || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.status') + ': ' + (selectedWorker?.status || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.phone') + ': ' + (selectedWorker?.phone || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.address') + ': ' + (selectedWorker?.address || '')} /></ListItem>
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

export default WorkersPage;
