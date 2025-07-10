import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Button, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Drawer, List, ListItem, ListItemText, Divider, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import FolderIcon from "@mui/icons-material/Folder";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../api';
import { useAuth } from "../../context/AuthContext";
import { addNotification, updateNotificationAction } from "../../api_notifications";
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DescriptionIcon from '@mui/icons-material/Description';
import CompanyDocuments from '../../components/CompanyDocuments';

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
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const [notifTargetCompany, setNotifTargetCompany] = useState<Company | null>(null);
  const [notifType, setNotifType] = useState("general");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifDate, setNotifDate] = useState("");
  const [notifIcon, setNotifIcon] = useState("");
  const [notifColor, setNotifColor] = useState("");
  const [notifEmoji, setNotifEmoji] = useState("");
  const [notifFile, setNotifFile] = useState<File | null>(null);
  const [notifSchedule, setNotifSchedule] = useState("");
  const [notifActionRequired, setNotifActionRequired] = useState("");
  const [companyNotifications, setCompanyNotifications] = useState<any[]>([]);
  const [notifListDialogOpen, setNotifListDialogOpen] = useState(false);
  const [selectedNotifCompany, setSelectedNotifCompany] = useState<Company | null>(null);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedDocumentCompany, setSelectedDocumentCompany] = useState<Company | null>(null);

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
    setLoading(true);
    axios.get(`${API_URL}/companies`).then(res => setCompanies(res.data)).finally(() => setLoading(false));
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

  // التحقق من صحة النموذج
  const validateCompany = (company: Partial<Company>) => {
    if (!company.file_number || !company.file_name) return false;
    return true;
  };

  const handleSave = async () => {
    if (!validateCompany(form)) {
      setError(t('fill_required_fields'));
      return;
    }
    try {
      const payload = {
        ...form,
        total_workers: form.total_workers ? Number(form.total_workers) : 0,
        total_licenses: form.total_licenses ? Number(form.total_licenses) : 0,
        creation_date: form.creation_date ? form.creation_date : undefined,
      };
      if (editCompany) {
        await api.put(`/companies/${editCompany.id}`, payload);
        setSuccess(t('updated_successfully'));
      } else {
        await api.post("/companies", payload);
        setSuccess(t('added_successfully'));
      }
      fetchCompanies();
      handleCloseDialog();
    } catch {
      setError(t('error_saving_data'));
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
      setSuccess(t('file_uploaded_successfully'));
    } catch {
      setError(t('error_uploading_file'));
    } finally {
      setUploading(false);
      fetchCompanies();
    }
  };

  const handleRowClick = (company: Company) => {
    setSelectedCompany(company);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCompany(null);
  };

  const handleSendCompanyNotif = async () => {
    if (!notifTargetCompany) return;
    let message = `(${notifTargetCompany.file_name || notifTargetCompany.file_number}) ${notifMessage}`;
    const notifObj: any = { message, type: notifType };
    if (notifDate) notifObj.expires_at = notifDate;
    if (notifIcon) notifObj.icon = notifIcon;
    if (notifColor) notifObj.color = notifColor;
    if (notifEmoji) notifObj.emoji = notifEmoji;
    if (notifSchedule) notifObj.scheduled_at = notifSchedule;
    if (notifActionRequired) notifObj.action_required = notifActionRequired;
    if (notifFile) {
      const formData = new FormData();
      formData.append("file", notifFile);
      formData.append("notification", new Blob([JSON.stringify(notifObj)], { type: 'application/json' }));
      await axios.post(`${API_URL}/notifications/with-attachment`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await addNotification(message, notifType, undefined, notifIcon, notifColor, notifEmoji);
    }
    setNotifDialogOpen(false);
    setNotifMessage("");
    setNotifType("general");
    setNotifDate("");
    setNotifIcon("");
    setNotifColor("");
    setNotifEmoji("");
    setNotifFile(null);
    setNotifSchedule("");
    setNotifActionRequired("");
    setSuccess("تم إرسال الإشعار بنجاح");
  };

  const handleAction = async (notif: any, action: string) => {
    await updateNotificationAction(notif.id, action);
    setCompanyNotifications(companyNotifications.map(n => n.id === notif.id ? { ...n, action_status: action } : n));
  };

  // فلترة متقدمة
  const advancedFilteredCompanies = companies.filter(c =>
    (c.file_number.includes(search) || (c.file_name || '').includes(search))
  );

  // إحصائيات
  const totalCompanies = companies.length;

  const fillDemoCompany = () => {
    setForm({
      file_number: "100161310",
      file_status: "فعال",
      creation_date: "2020-01-06",
      file_name: "شركه ميلانو المتحده للاقمشه",
      commercial_registration_number: "428886",
      file_classification: "تجاري عادي",
      administration: "محافظة العاصمة كويتي",
      file_type: "تجاري عادي",
      legal_entity: "شركة ذات مسؤلية محدودة",
      ownership_category: "شركة",
      total_workers: 77,
      total_licenses: 13
    });
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" mb={2}>{t('companies')}</Typography>
      {canEdit && (
        <Box display="flex" gap={2} mb={2}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            {t('add_company') || 'إضافة شركة'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={fillDemoCompany}>
            إدخال بيانات تجريبية
          </Button>
        </Box>
      )}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField aria-label="input field" label={t('search_by_name')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>{t('total_companies')}: {totalCompanies}</Typography>
      </Box>
      <Box mt={2} style={{ height: 400, width: "100%", position: 'relative' }}>
        {loading && <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor="rgba(255,255,255,0.7)" zIndex={2}><CircularProgress /></Box>}
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
                      {canEdit && (
                        <>
                          <IconButton color="primary" onClick={() => handleOpenDialog(company)}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => company.id && handleDelete(company.id)}><DeleteIcon /></IconButton>
                          <IconButton color="warning" onClick={e => { e.stopPropagation(); setNotifTargetCompany(company); setNotifDialogOpen(true); }} title="إشعار للشركة">
                            <AddAlertIcon />
                          </IconButton>
                          <Button variant="outlined" size="small" sx={{ mx: 1 }} onClick={() => { setSelectedNotifCompany(company); setNotifListDialogOpen(true); }}>
                            عرض الإشعارات
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ mx: 1 }} 
                            onClick={() => { 
                              setSelectedDocumentCompany(company); 
                              setDocumentsDialogOpen(true); 
                            }} 
                            startIcon={<FolderIcon />}
                          >
                            المستندات
                          </Button>
                        </>
                      )}
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
      </Box>
      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editCompany ? t('edit_company') : t('add_company')}</DialogTitle>
        <DialogContent>
          <TextField aria-label="input field" margin="dense" label={t('general.file_number') || 'رقم الملف'} name="file_number" value={form.file_number || ""} onChange={handleFormChange} fullWidth required error={!form.file_number} helperText={!form.file_number ? t('required') : ''} />
          <TextField aria-label="input field" margin="dense" label={t('general.file_status') || 'حالة الملف'} name="file_status" value={form.file_status || ""} onChange={handleFormChange} fullWidth />
          <TextField aria-label="input field" margin="dense" label={t('general.creation_date') || 'تاريخ الإنشاء'} name="creation_date" type="date" value={form.creation_date || ""} onChange={handleFormChange} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField aria-label="input field" margin="dense" label={t('general.commercial_registration_number') || 'رقم السجل التجاري'} name="commercial_registration_number" value={form.commercial_registration_number || ""} onChange={handleFormChange} fullWidth />
          <TextField aria-label="input field" margin="dense" label={t('general.file_name') || 'اسم الملف'} name="file_name" value={form.file_name || ""} onChange={handleFormChange} fullWidth required error={!form.file_name} helperText={!form.file_name ? t('required') : ''} />
          <TextField aria-label="input field" margin="dense" label={t('general.file_classification') || 'تصنيف الملف'} name="file_classification" value={form.file_classification || ""} onChange={handleFormChange} fullWidth />
          <TextField aria-label="input field" margin="dense" label={t('general.administration') || 'الإدارة'} name="administration" value={form.administration || ""} onChange={handleFormChange} fullWidth />
          <TextField aria-label="input field" margin="dense" label={t('general.file_type') || 'نوع الملف'} name="file_type" value={form.file_type || ""} onChange={handleFormChange} fullWidth />
          <TextField aria-label="input field" margin="dense" label={t('general.legal_entity') || 'الكيان القانوني'} name="legal_entity" value={form.legal_entity || ""} onChange={handleFormChange} fullWidth />
          <TextField aria-label="input field" margin="dense" label={t('general.ownership_category') || 'فئة الملكية'} name="ownership_category" value={form.ownership_category || ""} onChange={handleFormChange} fullWidth />
          <TextField aria-label="input field" margin="dense" label={t('general.total_workers') || 'إجمالي العمال'} name="total_workers" type="number" value={form.total_workers || ""} onChange={handleFormChange} fullWidth />
          <TextField aria-label="input field" margin="dense" label={t('general.total_licenses') || 'إجمالي التراخيص'} name="total_licenses" type="number" value={form.total_licenses || ""} onChange={handleFormChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('general.cancel')}</Button>
          <Button onClick={handleSave} variant="contained">{t('general.save')}</Button>
          {editCompany && (
            <Button
              variant="outlined"
              component="label"
              disabled={uploading}
              sx={{ ml: 1 }}
            >
              {uploading ? t('uploading') : t('upload_document')}
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
      {/* Dialog لإشعار الشركة */}
      <Dialog open={notifDialogOpen} onClose={() => setNotifDialogOpen(false)}>
        <DialogTitle>{t('new_company_notification')}</DialogTitle>
        <DialogContent>
          <Typography>الشركة: {notifTargetCompany?.file_name || notifTargetCompany?.file_number}</Typography>
          {/* معاينة مباشرة */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={2} mt={1}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', background: notifColor || '#e3e3e3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 2px 8px #0001', mb: 1 }}>
              {notifEmoji ? notifEmoji : notifIcon === 'info' ? <InfoIcon fontSize="large" sx={{ color: '#fff' }} /> : notifIcon === 'assignment' ? <AssignmentIndIcon fontSize="large" sx={{ color: '#fff' }} /> : notifIcon === 'description' ? <DescriptionIcon fontSize="large" sx={{ color: '#fff' }} /> : notifIcon === 'alert' ? <AddAlertIcon fontSize="large" sx={{ color: '#fff' }} /> : <span style={{ color: '#888', fontSize: 22 }}>?</span>}
            </Box>
            <Typography variant="caption" color="text.secondary">معاينة شكل الإشعار</Typography>
          </Box>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>نوع الإشعار</InputLabel>
            <Select value={notifType} label="نوع الإشعار" onChange={e => setNotifType(e.target.value)}>
              <MenuItem value="general">{t('general')}</MenuItem>
              <MenuItem value="permit">{t('permit')}</MenuItem>
              <MenuItem value="passport">{t('passport')}</MenuItem>
            </Select>
          </FormControl>
          <TextField aria-label="input field" fullWidth label="نص الإشعار" sx={{ mt: 2 }} value={notifMessage} onChange={e => setNotifMessage(e.target.value)} multiline rows={2} />
          <TextField aria-label="input field" fullWidth label="تاريخ انتهاء الإشعار (اختياري)" sx={{ mt: 2 }} type="date" InputLabelProps={{ shrink: true }} value={notifDate} onChange={e => setNotifDate(e.target.value)} />
          <TextField aria-label="input field" fullWidth label="جدولة الإشعار (اختياري)" type="datetime-local" sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} value={notifSchedule} onChange={e => setNotifSchedule(e.target.value)} />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>رمز (اختياري)</InputLabel>
            <Select value={notifIcon} label="رمز (اختياري)" onChange={e => setNotifIcon(e.target.value)} disabled={!!notifEmoji}>
              <MenuItem value=""><em>بدون</em></MenuItem>
              <MenuItem value="info"><InfoIcon /> Info</MenuItem>
              <MenuItem value="assignment"><AssignmentIndIcon /> Assignment</MenuItem>
              <MenuItem value="description"><DescriptionIcon /> Description</MenuItem>
              <MenuItem value="alert"><AddAlertIcon /> Alert</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>لون (اختياري)</InputLabel>
            <Select value={notifColor} label="لون (اختياري)" onChange={e => setNotifColor(e.target.value)}>
              <MenuItem value=""><em>افتراضي</em></MenuItem>
              <MenuItem value="#1976d2"><span style={{ background: '#1976d2', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> أزرق</MenuItem>
              <MenuItem value="#43a047"><span style={{ background: '#43a047', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> أخضر</MenuItem>
              <MenuItem value="#fbc02d"><span style={{ background: '#fbc02d', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> أصفر</MenuItem>
              <MenuItem value="#e53935"><span style={{ background: '#e53935', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> أحمر</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>إيموجي (اختياري)</InputLabel>
            <Select value={notifEmoji} label="إيموجي (اختياري)" onChange={e => setNotifEmoji(e.target.value)} disabled={!!notifIcon}>
              <MenuItem value=""><em>بدون</em></MenuItem>
              <MenuItem value="🎉">🎉 {t('celebration')}</MenuItem>
              <MenuItem value="⚠️">⚠️ {t('warning')}</MenuItem>
              <MenuItem value="✅">✅ {t('confirm')}</MenuItem>
              <MenuItem value="📢">📢 {t('announcement')}</MenuItem>
              <MenuItem value="🔔">🔔 {t('notification')}</MenuItem>
            </Select>
          </FormControl>
          <TextField aria-label="input field" label="إيموجي مخصص" value={notifEmoji} onChange={e => setNotifEmoji(e.target.value)} inputProps={{ maxLength: 2, style: { fontSize: 24, textAlign: 'center' } }} sx={{ width: 80, mt: 2 }} disabled={!!notifIcon} placeholder="😊" />
          <Box display="flex" alignItems="center" gap={1} mt={2}>
            <FormControl sx={{ minWidth: 100 }}>
              <InputLabel>لون مخصص</InputLabel>
              <Select value={notifColor} label="لون مخصص" onChange={e => setNotifColor(e.target.value)}>
                <MenuItem value=""><em>افتراضي</em></MenuItem>
                <MenuItem value="#1976d2"><span style={{ background: '#1976d2', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> أزرق</MenuItem>
                <MenuItem value="#43a047"><span style={{ background: '#43a047', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> أخضر</MenuItem>
                <MenuItem value="#fbc02d"><span style={{ background: '#fbc02d', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> أصفر</MenuItem>
                <MenuItem value="#e53935"><span style={{ background: '#e53935', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> أحمر</MenuItem>
              </Select>
            </FormControl>
            <input type="color" value={notifColor || '#e3e3e3'} onChange={e => setNotifColor(e.target.value)} style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8 }} title="اختر لون مخصص" />
          </Box>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>إجراء تفاعلي (اختياري)</InputLabel>
            <Select value={notifActionRequired} label="إجراء تفاعلي (اختياري)" onChange={e => setNotifActionRequired(e.target.value)}>
              <MenuItem value=""><em>بدون</em></MenuItem>
              <MenuItem value="confirm">{t('confirm')}</MenuItem>
              <MenuItem value="approve">{t('approve')}</MenuItem>
              <MenuItem value="reject">{t('reject')}</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            إرفاق ملف (اختياري)
            <input type="file" hidden onChange={e => setNotifFile(e.target.files?.[0] || null)} />
          </Button>
          {notifFile && <Typography variant="body2" color="primary">{notifFile.name}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifDialogOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleSendCompanyNotif} variant="contained" disabled={!notifMessage}>{t('send')}</Button>
        </DialogActions>
      </Dialog>
      {/* نافذة عرض إشعارات الشركة */}
      <Dialog open={notifListDialogOpen} onClose={() => setNotifListDialogOpen(false)}>
        <DialogTitle>إشعارات الشركة {selectedNotifCompany?.file_name || selectedNotifCompany?.file_number}</DialogTitle>
        <DialogContent>
          {/* جلب إشعارات الشركة من API أو من كل الإشعارات حسب الاسم/الرقم */}
          {/* هنا مثال افتراضي: companyNotifications */}
          {companyNotifications.length === 0 ? (
            <Typography>لا يوجد إشعارات لهذه الشركة</Typography>
          ) : (
            companyNotifications.map(n => (
              <Box key={n.id} display="flex" alignItems="center" mb={1}>
                {/* عرض الرمز/الإيموجي/اللون */}
                {n.emoji && <span style={{ fontSize: 22, marginRight: 6 }}>{n.emoji}</span>}
                {n.icon && n.icon === 'info' && <InfoIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                {n.icon && n.icon === 'assignment' && <AssignmentIndIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                {n.icon && n.icon === 'description' && <DescriptionIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                {!n.icon && !n.emoji && <InfoIcon sx={{ color: '#757575', mr: 0.5 }} />}
                <Typography variant="body2">{n.message}</Typography>
                {/* عرض المرفق */}
                {n.attachment && (
                  <Button size="small" href={`/${n.attachment}`} target="_blank" sx={{ ml: 1 }}>
                    تحميل المرفق
                  </Button>
                )}
                {/* أزرار التفاعل */}
                {n.action_required && (
                  <Box display="inline-flex" gap={1} ml={1}>
                    {n.action_status === "pending" || !n.action_status ? (
                      <>
                        <Button size="small" color="success" variant="outlined" onClick={() => handleAction(n, "confirmed")}>تأكيد</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleAction(n, "rejected")}>رفض</Button>
                      </>
                    ) : (
                      <Typography variant="body2" color={n.action_status === "confirmed" ? "success.main" : "error.main"}>
                        {n.action_status === "confirmed" ? "تم التأكيد" : "تم الرفض"}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifListDialogOpen(false)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      {/* نافذة إدارة المستندات */}
      {selectedDocumentCompany && (
        <CompanyDocuments
          company={{
            id: selectedDocumentCompany.id!,
            file_name: selectedDocumentCompany.file_name || '',
            file_number: selectedDocumentCompany.file_number
          }}
          open={documentsDialogOpen}
          onClose={() => {
            setDocumentsDialogOpen(false);
            setSelectedDocumentCompany(null);
          }}
        />
      )}
    </Box>
  );
};

export default CompaniesPage;
