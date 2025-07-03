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

interface License {
  id: number;
  license_number: string;
  worker_name?: string;
  company?: string;
  issue_date?: string;
  expiry_date?: string;
  status?: string;
  type?: string;
}

const LicensesPage: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editLicense, setEditLicense] = useState<License | null>(null);
  // استخدم نوع مناسب للفورم ليشمل جميع الحقول المطلوبة
  interface LicenseForm {
    license_number?: string;
    worker_name?: string;
    company?: string;
    issue_date?: string;
    expiry_date?: string;
    status?: string;
    type?: string;
  }
  const [form, setForm] = useState<LicenseForm>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ status: '', type: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  const { role } = useAuth();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/licenses");
      setLicenses(res.data);
    } catch {
      setError(t('general.load_error') || "تعذر تحميل التراخيص");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLicenses(); }, []);

  const handleOpenDialog = (license?: License) => {
    setEditLicense(license || null);
    setForm(license ? { ...license } : {});
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditLicense(null);
    setForm({});
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    try {
      if (editLicense) {
        await api.put(`/licenses/${editLicense.id}`, form);
        setSuccess(t('general.edit_success') || "تم التحديث بنجاح");
      } else {
        await api.post("/licenses", form);
        setSuccess(t('general.add_success') || "تمت الإضافة بنجاح");
      }
      fetchLicenses();
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
      await api.delete(`/licenses/${deleteId}`);
      setSuccess(t('general.delete_success'));
      fetchLicenses();
    } catch {
      setError(t('general.delete_error'));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };
  const handleRowClick = (license: License) => {
    setSelectedLicense(license);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedLicense(null);
  };
  // فلترة متقدمة
  const advancedFilteredLicenses = licenses.filter(l =>
    (l.license_number.includes(search) || (l.worker_name || '').includes(search)) &&
    (filter.status ? l.status === filter.status : true) &&
    (filter.type ? l.type === filter.type : true)
  );
  // طباعة
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=900');
    if (printWindow) {
      printWindow.document.write('<html><head><title>' + t('sidebar.licenses') + '</title>');
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
      <Typography variant="h5" mb={2}>{t('sidebar.licenses')}</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <TextField
          label={t('general.search') + ' برقم الترخيص أو اسم العامل'}
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
          label={t('general.type')}
          value={filter.type}
          onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
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
                  <TableCell>{t('general.license_number') || 'رقم الترخيص'}</TableCell>
                  <TableCell>{t('general.worker_name') || 'اسم العامل'}</TableCell>
                  <TableCell>{t('general.company') || 'الشركة'}</TableCell>
                  <TableCell>{t('general.issue_date') || 'تاريخ الإصدار'}</TableCell>
                  <TableCell>{t('general.expiry_date') || 'تاريخ الانتهاء'}</TableCell>
                  <TableCell>{t('general.status') || 'الحالة'}</TableCell>
                  <TableCell>{t('general.actions') || 'الإجراءات'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : advancedFilteredLicenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(license => (
                  <TableRow key={license.id} hover onClick={() => handleRowClick(license)} style={{ cursor: 'pointer' }}>
                    <TableCell>{license.license_number}</TableCell>
                    <TableCell>{license.worker_name}</TableCell>
                    <TableCell>{license.company}</TableCell>
                    <TableCell>{license.issue_date}</TableCell>
                    <TableCell>{license.expiry_date}</TableCell>
                    <TableCell>{license.status}</TableCell>
                    <TableCell>
                      {role === "admin" || role === "employee" ? (
                        <>
                          <IconButton color="primary" onClick={e => { e.stopPropagation(); handleOpenDialog(license); }}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(license.id); }}><DeleteIcon /></IconButton>
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
          count={advancedFilteredLicenses.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>
      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editLicense ? t('general.edit') : t('general.add')}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label={t('general.license_number') || 'رقم الترخيص'}
            name="license_number"
            value={form.license_number || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.worker_name') || 'اسم العامل'}
            name="worker_name"
            value={form.worker_name || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.company') || 'الشركة'}
            name="company"
            value={form.company || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.issue_date') || 'تاريخ الإصدار'}
            name="issue_date"
            type="date"
            value={form.issue_date || ""}
            onChange={handleFormChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label={t('general.expiry_date') || 'تاريخ الانتهاء'}
            name="expiry_date"
            type="date"
            value={form.expiry_date || ""}
            onChange={handleFormChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label={t('general.status') || 'الحالة'}
            name="status"
            value={form.status || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label={t('general.type') || 'نوع الترخيص'}
            name="type"
            value={form.type || ""}
            onChange={handleFormChange}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('general.cancel') || 'إلغاء'}</Button>
          {role === "admin" || role === "employee" ? (
            <Button onClick={handleSave} variant="contained">{t('general.save') || 'حفظ'}</Button>
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
          <Typography variant="h6" mb={2}>{t('sidebar.licenses')} - {selectedLicense?.license_number}</Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem><ListItemText primary={(t('general.worker_name') || 'اسم العامل') + ': ' + (selectedLicense?.worker_name || '')} /></ListItem>
            <ListItem><ListItemText primary={(t('general.company') || 'الشركة') + ': ' + (selectedLicense?.company || '')} /></ListItem>
            <ListItem><ListItemText primary={(t('general.license_number') || 'رقم الترخيص') + ': ' + (selectedLicense?.license_number || '')} /></ListItem>
            <ListItem><ListItemText primary={(t('general.license_type') || 'نوع الترخيص') + ': ' + (selectedLicense?.type || '')} /></ListItem>
            <ListItem><ListItemText primary={(t('general.status') || 'الحالة') + ': ' + (selectedLicense?.status || '')} /></ListItem>
            <ListItem><ListItemText primary={(t('general.issue_date') || 'تاريخ الإصدار') + ': ' + (selectedLicense?.issue_date || '')} /></ListItem>
            <ListItem><ListItemText primary={(t('general.expiry_date') || 'تاريخ الانتهاء') + ': ' + (selectedLicense?.expiry_date || '')} /></ListItem>
          </List>
          <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={handleCloseDetails}>{t('general.cancel') || 'إلغاء'}</Button>
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

export default LicensesPage;
