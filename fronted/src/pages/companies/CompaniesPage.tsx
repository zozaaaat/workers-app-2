import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Paper, Button, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Drawer, List, ListItem, ListItemText, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../api';

interface Company {
  id?: number;
  file_number: string;
  file_status?: string;
  creation_date?: string;
  commercial_registration_number?: string;
  file_name?: string;
  file_classification?: string;
  administration?: string;
  file_type?: string;
  legal_entity?: string;
  ownership_category?: string;
  total_workers?: number;
  total_licenses?: number;
}

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<Partial<Company>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    file_status: '',
    administration: '',
    file_classification: '',
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  const { role } = useAuth();

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/companies");
      setCompanies(res.data);
    } catch (err: any) {
      setError("تعذر تحميل الشركات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line
  }, []);

  const handleOpenDialog = (company?: Company) => {
    setEditCompany(company || null);
    setForm(company ? { ...company } : {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditCompany(null);
    setForm({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        total_workers: form.total_workers ? Number(form.total_workers) : 0,
        total_licenses: form.total_licenses ? Number(form.total_licenses) : 0,
        creation_date: form.creation_date ? form.creation_date : undefined,
      };
      if (editCompany) {
        await api.put(`/companies/${editCompany.id}`, payload);
        setSuccess("تم تحديث الشركة بنجاح");
      } else {
        await api.post("/companies", payload);
        setSuccess("تمت إضافة الشركة بنجاح");
      }
      fetchCompanies();
      handleCloseDialog();
    } catch {
      setError("حدث خطأ أثناء الحفظ");
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/companies/${deleteId}`);
      setSuccess(t('general.delete_success'));
      fetchCompanies();
    } catch {
      setError(t('general.delete_error'));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editCompany || !e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      await api.post(`/companies/${editCompany.id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("تم رفع الملف بنجاح");
    } catch {
      setError("حدث خطأ أثناء رفع الملف");
    } finally {
      setUploading(false);
      fetchCompanies();
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCompanies);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "companies.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("قائمة الشركات", 14, 10);
    (doc as any).autoTable({
      head: [["رقم الملف", "اسم الشركة", "الحالة"]],
      body: filteredCompanies.map(c => [c.file_number, c.file_name, c.file_status]),
      startY: 20,
    });
    doc.save("companies.pdf");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      for (const row of data) {
        try {
          await api.post("/companies", row);
        } catch {}
      }
      setSuccess("تم استيراد البيانات بنجاح");
      fetchCompanies();
    };
    reader.readAsBinaryString(file);
  };

  const handleRowClick = (company: Company) => {
    setSelectedCompany(company);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCompany(null);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=900');
    if (printWindow) {
      printWindow.document.write('<html><head><title>' + t('sidebar.companies') + '</title>');
      printWindow.document.write('<style>body{font-family:Cairo,Arial,sans-serif;direction:rtl;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:center;}th{background:#eee;}</style>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  // بحث
  const filteredCompanies = companies.filter(c =>
    c.file_number.includes(search) || (c.file_name || "").includes(search)
  );

  // فلترة متقدمة
  const advancedFilteredCompanies = companies.filter(c =>
    (c.file_number.includes(search) || (c.file_name || '').includes(search)) &&
    (filter.file_status ? c.file_status === filter.file_status : true) &&
    (filter.administration ? c.administration === filter.administration : true) &&
    (filter.file_classification ? c.file_classification === filter.file_classification : true)
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" mb={2}>الشركات</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <TextField
          label="بحث برقم الملف أو الاسم"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 220 }}
        />
        <TextField
          label="الحالة"
          value={filter.file_status}
          onChange={e => setFilter(f => ({ ...f, file_status: e.target.value }))}
          sx={{ width: 150 }}
        />
        <TextField
          label="الإدارة"
          value={filter.administration}
          onChange={e => setFilter(f => ({ ...f, administration: e.target.value }))}
          sx={{ width: 150 }}
        />
        <TextField
          label="تصنيف الملف"
          value={filter.file_classification}
          onChange={e => setFilter(f => ({ ...f, file_classification: e.target.value }))}
          sx={{ width: 150 }}
        />
        {/* أضف المزيد من الفلاتر حسب الحاجة */}
        <Box flexGrow={1} />
        <Box>
          <Button variant="outlined" sx={{ mx: 1 }} onClick={handleExportExcel}>{t('general.export_excel') || 'تصدير Excel'}</Button>
          <Button variant="outlined" sx={{ mx: 1 }} onClick={handleExportPDF}>{t('general.export_pdf') || 'تصدير PDF'}</Button>
          <Button variant="outlined" sx={{ mx: 1 }} onClick={handlePrint}>{t('general.print') || 'طباعة'}</Button>
          {role === "admin" && (
            <Button variant="outlined" component="label" sx={{ mx: 1 }}>
              استيراد Excel
              <input type="file" hidden accept=".xlsx,.xls" onChange={handleImportExcel} />
            </Button>
          )}
          {role === "admin" && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              إضافة شركة
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
                  <TableCell>{t('general.file_number') || 'رقم الملف'}</TableCell>
                  <TableCell>{t('general.file_name') || 'اسم الشركة'}</TableCell>
                  <TableCell>{t('general.file_status') || 'الحالة'}</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : advancedFilteredCompanies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(company => (
                  <TableRow key={company.id} hover onClick={() => handleRowClick(company)} style={{ cursor: 'pointer' }}>
                    <TableCell>{company.file_number}</TableCell>
                    <TableCell>{company.file_name}</TableCell>
                    <TableCell>{company.file_status}</TableCell>
                    <TableCell>
                      {role === "admin" || role === "employee" ? (
                        <>
                          <IconButton color="primary" onClick={() => handleOpenDialog(company)}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => company.id && handleDelete(company.id)}><DeleteIcon /></IconButton>
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
          count={advancedFilteredCompanies.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>
      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editCompany ? "تعديل شركة" : "إضافة شركة"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label={t('general.file_number') || 'رقم الملف'} name="file_number" value={form.file_number || ""} onChange={handleFormChange} fullWidth required />
          <TextField margin="dense" label={t('general.file_status') || 'حالة الملف'} name="file_status" value={form.file_status || ""} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label={t('general.creation_date') || 'تاريخ الإنشاء'} name="creation_date" type="date" value={form.creation_date || ""} onChange={handleFormChange} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label={t('general.commercial_registration_number') || 'رقم السجل التجاري'} name="commercial_registration_number" value={form.commercial_registration_number || ""} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label={t('general.file_name') || 'اسم الملف'} name="file_name" value={form.file_name || ""} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label={t('general.file_classification') || 'تصنيف الملف'} name="file_classification" value={form.file_classification || ""} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label={t('general.administration') || 'الإدارة'} name="administration" value={form.administration || ""} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label={t('general.file_type') || 'نوع الملف'} name="file_type" value={form.file_type || ""} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label={t('general.legal_entity') || 'الكيان القانوني'} name="legal_entity" value={form.legal_entity || ""} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label={t('general.ownership_category') || 'فئة الملكية'} name="ownership_category" value={form.ownership_category || ""} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label={t('general.total_workers') || 'إجمالي العمال'} name="total_workers" type="number" value={form.total_workers || ""} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label={t('general.total_licenses') || 'إجمالي التراخيص'} name="total_licenses" type="number" value={form.total_licenses || ""} onChange={handleFormChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('general.cancel')}</Button>
          {role === "admin" || role === "employee" ? (
            <Button onClick={handleSave} variant="contained">{t('general.save')}</Button>
          ) : null}
          {editCompany && role === "admin" && (
            <Button
              variant="outlined"
              component="label"
              disabled={uploading}
              sx={{ ml: 1 }}
            >
              {uploading ? "جاري الرفع..." : "رفع مستند"}
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* تأكيد الحذف */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('general.confirm_delete_title') || 'تأكيد الحذف'}</DialogTitle>
        <DialogContent>{t('general.confirm_delete_msg') || 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع.'}</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('general.cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">{t('general.delete')}</Button>
        </DialogActions>
      </Dialog>
      {/* Drawer لعرض التفاصيل */}
      <Drawer anchor="left" open={detailsOpen} onClose={handleCloseDetails} sx={{ zIndex: 1301 }}>
        <Box sx={{ width: 350, p: 3 }}>
          <Typography variant="h6" mb={2}>{t('sidebar.companies')} - {selectedCompany?.file_name}</Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem><ListItemText primary={t('general.file_number') + ': ' + (selectedCompany?.file_number || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.file_status') + ': ' + (selectedCompany?.file_status || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.commercial_registration_number') + ': ' + (selectedCompany?.commercial_registration_number || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.file_classification') + ': ' + (selectedCompany?.file_classification || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.administration') + ': ' + (selectedCompany?.administration || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.file_type') + ': ' + (selectedCompany?.file_type || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.legal_entity') + ': ' + (selectedCompany?.legal_entity || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.ownership_category') + ': ' + (selectedCompany?.ownership_category || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.total_workers') + ': ' + (selectedCompany?.total_workers || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.total_licenses') + ': ' + (selectedCompany?.total_licenses || '')} /></ListItem>
            <ListItem><ListItemText primary={t('general.creation_date') + ': ' + (selectedCompany?.creation_date || '')} /></ListItem>
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

export default CompaniesPage;
