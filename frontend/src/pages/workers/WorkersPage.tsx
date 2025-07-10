import React, { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { addNotification, updateNotificationAction } from "../../api_notifications";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import { useNavigate } from "react-router-dom";

const WorkersPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    civil_id: '',
    name: '',
    nationality: '',
    worker_type: '',
    job_title: '',
    hire_date: '',
    work_permit_start: '',
    work_permit_end: '',
    salary: '',
    company_id: '',
    license_id: '',
    passport_start: '',
    passport_end: ''
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editWorker, setEditWorker] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [filterCompany, setFilterCompany] = useState('');
  const [filterLicense, setFilterLicense] = useState('');
  const [searchName, setSearchName] = useState('');
  const [notify, setNotify] = useState<string | null>(null);
  const [workerNotifications, setWorkerNotifications] = useState<any[]>([]);
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const [addNotifDialogOpen, setAddNotifDialogOpen] = useState(false);
  const [notifType, setNotifType] = useState("general");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifDate, setNotifDate] = useState("");
  const [notifTargetWorker, setNotifTargetWorker] = useState<any>(null);
  const [notifIcon, setNotifIcon] = useState("");
  const [notifColor, setNotifColor] = useState("");
  const [notifEmoji, setNotifEmoji] = useState("");
  const [notifFile, setNotifFile] = useState<File | null>(null);
  const [notifSchedule, setNotifSchedule] = useState("");
  const [notifActionRequired, setNotifActionRequired] = useState("");
  const navigate = useNavigate();
  // تحديث الأعمدة لتمرير params: any
  const columns: GridColDef[] = [
    { field: "custom_id", headerName: t("worker_id"), width: 100 },
    { field: "name", headerName: t("name"), width: 150 },
    { field: "nationality", headerName: t("nationality"), width: 120 },
    { field: "worker_type", headerName: t("worker_type"), width: 120 },
    { field: "job_title", headerName: t("job_title"), width: 120 },
    { field: "salary", headerName: t("salary"), width: 100 },
    { field: "hire_date", headerName: t("hire_date"), width: 110 },
    { field: "work_permit_start", headerName: t("work_permit_start"), width: 120 },
    { field: "work_permit_end", headerName: t("work_permit_end"), width: 120 },
    { field: "passport_start", headerName: t("passport_start"), width: 120 },
    { field: "passport_end", headerName: t("passport_end"), width: 120 },
    { field: "company_id", headerName: t("company"), width: 180, valueGetter: (params: any) => {
      if (!params || !params.row) return '';
      const company = companies.find(c => c.id === params.row.company_id);
      return company ? company.file_name || company.name : params.row.company_id;
    } },
    { field: "license_id", headerName: t("license"), width: 180, valueGetter: (params: any) => {
      if (!params || !params.row) return '';
      const license = licenses.find(l => l.id === params.row.license_id);
      return license ? license.name : params.row.license_id;
    } },
    { field: "id", headerName: "ID", width: 80 },
    { field: "actions", headerName: t("actions"), width: 180, renderCell: (params: any) => (
      <>
        <Edit onClick={() => handleEditOpen(params.row)} style={{ cursor: 'pointer', color: '#1976d2', marginRight: 8 }} />
        <Delete onClick={e => { e.stopPropagation(); handleDelete(params.row.id); }} style={{ cursor: 'pointer', color: 'red' }} />
        <AddAlertIcon onClick={e => { e.stopPropagation(); setNotifTargetWorker(params.row); setAddNotifDialogOpen(true); }} style={{ cursor: 'pointer', color: '#fbc02d', marginLeft: 8 }} titleAccess="إشعار للعامل" />
      </>
    )}
  ];
  const canEdit = user?.role === "admin" || user?.role === "manager";
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/workers/public`)
      .then(res => {
        const data = res.data.map((row: any, idx: number) => ({
          ...row,
          id: row.id ?? row.custom_id ?? idx // ضمان وجود id فريد لكل صف
        }));
        setRows(data);
      })
      .finally(() => setLoading(false));
    axios.get(`${API_URL}/companies`).then(res => setCompanies(res.data));
    axios.get(`${API_URL}/licenses`).then(res => setLicenses(res.data));
  }, []);
  // إحصائيات
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/workers/${deleteId}`);
      setSuccess(t('deleteSuccess'));
      setRows(rows.filter(r => r.id !== deleteId));
    } catch {
      setError(t('deleteError'));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };
  const handleAddChange = (e: any) => {
    setNewWorker({ ...newWorker, [e.target.name]: e.target.value });
  };
  const handleEditChange = (e: any) => {
    setEditWorker({ ...editWorker, [e.target.name]: e.target.value });
  };
  // التحقق من صحة النموذج
  const validateWorker = (worker: any) => {
    return (
      !!worker.civil_id &&
      !!worker.name &&
      !!worker.nationality &&
      !!worker.worker_type &&
      !!worker.job_title &&
      !!worker.hire_date &&
      !!worker.work_permit_start &&
      !!worker.work_permit_end &&
      !!worker.salary &&
      !!worker.company_id
    );
  };
  const handleAddWorker = async () => {
    if (!validateWorker(newWorker)) {
      setError(t('fillAllFields') || 'يرجى تعبئة جميع الحقول');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/workers`, newWorker);
      setRows([...rows, res.data]);
      setSuccess(t('addSuccess'));
      setAddOpen(false);
      setNewWorker({
        civil_id: '',
        name: '',
        nationality: '',
        worker_type: '',
        job_title: '',
        hire_date: '',
        work_permit_start: '',
        work_permit_end: '',
        salary: '',
        company_id: '',
        license_id: '',
        passport_start: '',
        passport_end: ''
      });
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setError(t('duplicateCivilId') || 'رقم المدني مكرر. يوجد عامل بنفس الرقم المدني.');
      } else {
        setError(t('addError'));
      }
    }
  };
  const handleEditOpen = (worker: any) => {
    setEditWorker(worker);
    setEditOpen(true);
  };
  const handleEditWorker = async () => {
    if (!validateWorker(editWorker)) {
      setError(t('fillAllFields') || 'يرجى تعبئة جميع الحقول');
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/workers/${editWorker.id}`, editWorker);
      setRows(rows.map(r => r.id === editWorker.id ? res.data : r));
      setSuccess(t('editSuccess'));
      setEditOpen(false);
      setEditWorker(null);
    } catch {
      setError(t('editError'));
    }
  };
  const fillDemoWorker = () => {
    setNewWorker({
      civil_id: '123456789',
      name: 'عامل تجريبي - ميلانو',
      nationality: 'مصري',
      worker_type: 'وافد',
      job_title: 'عامل',
      hire_date: '2022-01-01',
      work_permit_start: '2022-01-01',
      work_permit_end: '2025-01-01',
      salary: '250',
      company_id: '1',
      license_id: '1',
      passport_start: '2021-01-01',
      passport_end: '2026-01-01'
    });
    setAddOpen(true);
  };
  // منطق التلوين والتنبيه
  const getRowClassName = (params: any) => {
    const now = new Date();
    const permitEnd = params.row.work_permit_end ? new Date(params.row.work_permit_end) : null;
    if (permitEnd) {
      const diff = (permitEnd.getTime() - now.getTime()) / (1000 * 3600 * 24);
      if (diff < 15) return 'row-red';
      if (diff < 60) return 'row-yellow';
    }
    return '';
  };
  // تحويل التنبيهات إلى Snackbar
  useEffect(() => {
    rows.forEach(worker => {
      if (worker.passport_end) {
        const passEnd = new Date(worker.passport_end);
        const now = new Date();
        const diff = (passEnd.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diff < 365 && diff > 360) {
          const msg = `تنبيه: جواز العامل ${worker.name} ينتهي خلال سنة!`;
          setNotify(msg);
          addNotification(msg, "passport");
        }
      }
      if (worker.work_permit_end) {
        const permitEnd = new Date(worker.work_permit_end);
        const now = new Date();
        const diff = (permitEnd.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diff < 60 && diff > 59) {
          const msg = `تنبيه: إقامة العامل ${worker.name} تنتهي خلال شهرين!`;
          setNotify(msg);
          addNotification(msg, "permit");
        }
        if (diff < 15 && diff > 14) {
          const msg = `تنبيه: إقامة العامل ${worker.name} تنتهي خلال 15 يوم!`;
          setNotify(msg);
          addNotification(msg, "permit");
        }
      }
    });
  }, [rows]);
  const filteredRows = rows.filter(row => {
    const companyMatch = !filterCompany || row.company_id == filterCompany;
    const licenseMatch = !filterLicense || row.license_id == filterLicense;
    const nameMatch = !searchName || row.name?.toLowerCase().includes(searchName.toLowerCase());
    return companyMatch && licenseMatch && nameMatch;
  });
  const handleRowClick = (params: any) => {
    navigate(`/workers/${params.row.id}`);
  };
  const handleSendWorkerNotif = async () => {
    if (!notifTargetWorker) return;
    let message = `(${notifTargetWorker.name}) ${notifMessage}`;
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
    setAddNotifDialogOpen(false);
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
    setWorkerNotifications(workerNotifications.map(n => n.id === notif.id ? { ...n, action_status: action } : n));
  };
  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>{t("workers")}</Typography>
      {canEdit && (
        <Box display="flex" gap={2} mb={2}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => setAddOpen(true)}>{t("add_worker")}</Button>
          <Button variant="outlined" color="secondary" onClick={fillDemoWorker}>
            إدخال عامل تجريبي
          </Button>
        </Box>
      )}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField aria-label="input field" label={t("search_by_name")} size="small" id="search-by-name" value={searchName} onChange={e => setSearchName(e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('company')}</InputLabel>
          <Select value={filterCompany} label={t('company')} onChange={e => setFilterCompany(e.target.value)}>
            <MenuItem value="">{t('all')}</MenuItem>
            {companies.map(company => (
              <MenuItem key={company.id} value={company.id}>{company.file_name || company.name} {company.custom_id ? `(${company.custom_id})` : ''}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('license')}</InputLabel>
          <Select value={filterLicense} label={t('license')} onChange={e => setFilterLicense(e.target.value)}>
            <MenuItem value="">{t('all')}</MenuItem>
            {licenses.map(license => (
              <MenuItem key={license.id} value={license.id}>{license.name} {license.custom_id ? `(${license.custom_id})` : ''}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>{t("total_workers")}: {filteredRows.length}</Typography>
      </Box>
      <Box mt={2} style={{ height: 400, width: "100%", position: 'relative' }}>
        {loading && <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor="rgba(255,255,255,0.7)" zIndex={2}><CircularProgress /></Box>}
        <DataGrid
          rows={filteredRows}
          columns={columns.map(col =>
            col.field === "actions"
              ? { ...col, renderCell: canEdit ? (params => (
                <>
                  <Edit onClick={() => handleEditOpen(params.row)} style={{ cursor: 'pointer', color: '#1976d2', marginRight: 8 }} />
                  <Delete onClick={e => { e.stopPropagation(); handleDelete(params.row.id); }} style={{ cursor: 'pointer', color: 'red' }} />
                  <AddAlertIcon onClick={e => { e.stopPropagation(); setNotifTargetWorker(params.row); setAddNotifDialogOpen(true); }} style={{ cursor: 'pointer', color: '#fbc02d', marginLeft: 8 }} titleAccess="إشعار للعامل" />
                </>
              )) : () => null }
              : col
          )}
          onRowClick={handleRowClick}
          getRowClassName={getRowClassName}
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
          <DialogTitle>{t('add_worker')}</DialogTitle>
          <DialogContent>
            <TextField aria-label="input field" margin="dense" label={t('civil_id')} name="civil_id" id="add-worker-civil_id" value={newWorker.civil_id} onChange={handleAddChange} fullWidth required error={!newWorker.civil_id} helperText={!newWorker.civil_id ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('name')} name="name" id="add-worker-name" value={newWorker.name} onChange={handleAddChange} fullWidth required error={!newWorker.name} helperText={!newWorker.name ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('nationality')} name="nationality" id="add-worker-nationality" value={newWorker.nationality} onChange={handleAddChange} fullWidth required error={!newWorker.nationality} helperText={!newWorker.nationality ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('worker_type')} name="worker_type" id="add-worker-worker_type" value={newWorker.worker_type} onChange={handleAddChange} fullWidth required error={!newWorker.worker_type} helperText={!newWorker.worker_type ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('job_title')} name="job_title" id="add-worker-job_title" value={newWorker.job_title} onChange={handleAddChange} fullWidth required error={!newWorker.job_title} helperText={!newWorker.job_title ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('hire_date')} name="hire_date" id="add-worker-hire_date" type="date" value={newWorker.hire_date} onChange={handleAddChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField aria-label="input field" margin="dense" label={t('work_permit_start')} name="work_permit_start" id="add-worker-work_permit_start" type="date" value={newWorker.work_permit_start} onChange={handleAddChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField aria-label="input field" margin="dense" label={t('work_permit_end')} name="work_permit_end" id="add-worker-work_permit_end" type="date" value={newWorker.work_permit_end} onChange={handleAddChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField aria-label="input field" margin="dense" label={t('salary')} name="salary" id="add-worker-salary" value={newWorker.salary} onChange={handleAddChange} fullWidth required error={!newWorker.salary} helperText={!newWorker.salary ? t('required') : ''} />
            <FormControl fullWidth margin="dense">
              <InputLabel id="company-select-label">{t('company')}</InputLabel>
              <Select
                labelId="company-select-label"
                id="add-worker-company_id"
                name="company_id"
                value={newWorker.company_id}
                label={t('company')}
                onChange={handleAddChange}
                required
              >
                {companies.map(company => (
                  <MenuItem key={company.id} value={company.id}>{company.file_name || company.name} {company.custom_id ? `(${company.custom_id})` : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel id="license-select-label">{t('license')}</InputLabel>
              <Select
                labelId="license-select-label"
                id="add-worker-license_id"
                name="license_id"
                value={newWorker.license_id}
                label={t('license')}
                onChange={handleAddChange}
              >
                <MenuItem value="">{t('no_license')}</MenuItem>
                {licenses.map(license => (
                  <MenuItem key={license.id} value={license.id}>{license.name} {license.custom_id ? `(${license.custom_id})` : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField aria-label="input field" margin="dense" label={t('passport_start')} name="passport_start" id="add-worker-passport_start" type="date" value={newWorker.passport_start} onChange={handleAddChange} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField aria-label="input field" margin="dense" label={t('passport_end')} name="passport_end" id="add-worker-passport_end" type="date" value={newWorker.passport_end} onChange={handleAddChange} fullWidth InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddWorker} variant="contained">{t('add')}</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>{t('edit_worker')}</DialogTitle>
          <DialogContent>
            <TextField aria-label="input field" margin="dense" label={t('civil_id')} name="civil_id" id="edit-worker-civil_id" value={editWorker?.civil_id || ''} onChange={handleEditChange} fullWidth required error={editWorker && !editWorker.civil_id} helperText={editWorker && !editWorker.civil_id ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('name')} name="name" id="edit-worker-name" value={editWorker?.name || ''} onChange={handleEditChange} fullWidth required error={editWorker && !editWorker.name} helperText={editWorker && !editWorker.name ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('nationality')} name="nationality" id="edit-worker-nationality" value={editWorker?.nationality || ''} onChange={handleEditChange} fullWidth required error={editWorker && !editWorker.nationality} helperText={editWorker && !editWorker.nationality ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('worker_type')} name="worker_type" id="edit-worker-worker_type" value={editWorker?.worker_type || ''} onChange={handleEditChange} fullWidth required error={editWorker && !editWorker.worker_type} helperText={editWorker && !editWorker.worker_type ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('job_title')} name="job_title" id="edit-worker-job_title" value={editWorker?.job_title || ''} onChange={handleEditChange} fullWidth required error={editWorker && !editWorker.job_title} helperText={editWorker && !editWorker.job_title ? t('required') : ''} />
            <TextField aria-label="input field" margin="dense" label={t('hire_date')} name="hire_date" id="edit-worker-hire_date" type="date" value={editWorker?.hire_date || ''} onChange={handleEditChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField aria-label="input field" margin="dense" label={t('work_permit_start')} name="work_permit_start" id="edit-worker-work_permit_start" type="date" value={editWorker?.work_permit_start || ''} onChange={handleEditChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField aria-label="input field" margin="dense" label={t('work_permit_end')} name="work_permit_end" id="edit-worker-work_permit_end" type="date" value={editWorker?.work_permit_end || ''} onChange={handleEditChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField aria-label="input field" margin="dense" label={t('salary')} name="salary" id="edit-worker-salary" value={editWorker?.salary || ''} onChange={handleEditChange} fullWidth required error={editWorker && !editWorker.salary} helperText={editWorker && !editWorker.salary ? t('required') : ''} />
            <FormControl fullWidth margin="dense">
              <InputLabel id="edit-company-select-label">{t('company')}</InputLabel>
              <Select
                labelId="edit-company-select-label"
                id="edit-worker-company_id"
                name="company_id"
                value={editWorker?.company_id || ''}
                label={t('company')}
                onChange={handleEditChange}
                required
              >
                {companies.map(company => (
                  <MenuItem key={company.id} value={company.id}>{company.file_name || company.name} {company.custom_id ? `(${company.custom_id})` : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel id="edit-license-select-label">{t('license')}</InputLabel>
              <Select
                labelId="edit-license-select-label"
                id="edit-worker-license_id"
                name="license_id"
                value={editWorker?.license_id || ''}
                label={t('license')}
                onChange={handleEditChange}
              >
                <MenuItem value="">{t('no_license')}</MenuItem>
                {licenses.map(license => (
                  <MenuItem key={license.id} value={license.id}>{license.name} {license.custom_id ? `(${license.custom_id})` : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField aria-label="input field" margin="dense" label={t('passport_start')} name="passport_start" id="edit-worker-passport_start" type="date" value={editWorker?.passport_start || ''} onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField aria-label="input field" margin="dense" label={t('passport_end')} name="passport_end" id="edit-worker-passport_end" type="date" value={editWorker?.passport_end || ''} onChange={handleEditChange} fullWidth InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleEditWorker} variant="contained">{t('save')}</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={notifDialogOpen} onClose={() => setNotifDialogOpen(false)}>
          <DialogTitle>إشعارات العامل {notifTargetWorker?.name}</DialogTitle>
          <DialogContent>
            {workerNotifications.length === 0 ? (
              <Typography>لا يوجد إشعارات لهذا العامل</Typography>
            ) : (
              workerNotifications.map(n => (
                <Box key={n.id} display="flex" alignItems="center" mb={1}>
                  {/* عرض الرمز/الإيموجي/اللون */}
                  {n.emoji && <span style={{ fontSize: 22, marginRight: 6 }}>{n.emoji}</span>}
                  {n.icon && n.icon === 'info' && <InfoIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                  {n.icon && n.icon === 'assignment' && <AssignmentIndIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                  {n.icon && n.icon === 'description' && <DescriptionIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                  {n.icon && n.icon === 'alert' && <AddAlertIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
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
                          <Button size="small" color="success" variant="outlined" onClick={() => handleAction(n, "confirmed")}>{t('confirm')}</Button>
                          <Button size="small" color="error" variant="outlined" onClick={() => handleAction(n, "rejected")}>{t('reject')}</Button>
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
            <Button onClick={() => setNotifDialogOpen(false)}>{t('close')}</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={addNotifDialogOpen} onClose={() => setAddNotifDialogOpen(false)}>
          <DialogTitle>{t('new_worker_notification')}</DialogTitle>
          <DialogContent>
            <Typography>{t('worker')}: {notifTargetWorker?.name}</Typography>
            {/* معاينة مباشرة */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={2} mt={1}>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', background: notifColor || '#e3e3e3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 2px 8px #0001', mb: 1 }}>
                {notifEmoji ? notifEmoji : notifIcon === 'info' ? <InfoIcon fontSize="large" sx={{ color: '#fff' }} /> : notifIcon === 'assignment' ? <AssignmentIndIcon fontSize="large" sx={{ color: '#fff' }} /> : notifIcon === 'description' ? <DescriptionIcon fontSize="large" sx={{ color: '#fff' }} /> : notifIcon === 'alert' ? <AddAlertIcon fontSize="large" sx={{ color: '#fff' }} /> : <span style={{ color: '#888', fontSize: 22 }}>?</span>}
              </Box>
              <Typography variant="caption" color="text.secondary">معاينة شكل الإشعار</Typography>
            </Box>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{t('notification_type')}</InputLabel>
              <Select value={notifType} label={t('notification_type')} onChange={e => setNotifType(e.target.value)}>
                <MenuItem value="general">{t('general')}</MenuItem>
                <MenuItem value="permit">{t('permit')}</MenuItem>
                <MenuItem value="passport">{t('passport')}</MenuItem>
              </Select>
            </FormControl>
            <TextField aria-label="input field" fullWidth label={t('notification_text')} sx={{ mt: 2 }} value={notifMessage} onChange={e => setNotifMessage(e.target.value)} multiline rows={2} />
            <TextField aria-label="input field" fullWidth label={t('notification_expiry') + ' (' + t('optional') + ')'} sx={{ mt: 2 }} type="date" InputLabelProps={{ shrink: true }} value={notifDate} onChange={e => setNotifDate(e.target.value)} />
            <TextField aria-label="input field" fullWidth label={t('notification_schedule') + ' (' + t('optional') + ')'} type="datetime-local" sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} value={notifSchedule} onChange={e => setNotifSchedule(e.target.value)} />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{t('icon') + ' (' + t('optional') + ')'}</InputLabel>
              <Select value={notifIcon} label={t('icon') + ' (' + t('optional') + ')'} onChange={e => setNotifIcon(e.target.value)} disabled={!!notifEmoji}>
                <MenuItem value=""><em>{t('none')}</em></MenuItem>
                <MenuItem value="info"><InfoIcon /> Info</MenuItem>
                <MenuItem value="assignment"><AssignmentIndIcon /> Assignment</MenuItem>
                <MenuItem value="description"><DescriptionIcon /> Description</MenuItem>
                <MenuItem value="alert"><AddAlertIcon /> Alert</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{t('color') + ' (' + t('optional') + ')'}</InputLabel>
              <Select value={notifColor} label={t('color') + ' (' + t('optional') + ')'} onChange={e => setNotifColor(e.target.value)}>
                <MenuItem value=""><em>{t('default')}</em></MenuItem>
                <MenuItem value="#1976d2"><span style={{ background: '#1976d2', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> {t('blue')}</MenuItem>
                <MenuItem value="#43a047"><span style={{ background: '#43a047', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> {t('green')}</MenuItem>
                <MenuItem value="#fbc02d"><span style={{ background: '#fbc02d', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> {t('yellow')}</MenuItem>
                <MenuItem value="#e53935"><span style={{ background: '#e53935', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> {t('red')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{t('emoji') + ' (' + t('optional') + ')'}</InputLabel>
              <Select value={notifEmoji} label={t('emoji') + ' (' + t('optional') + ')'} onChange={e => setNotifEmoji(e.target.value)} disabled={!!notifIcon}>
                <MenuItem value=""><em>{t('none')}</em></MenuItem>
                <MenuItem value="🎉">🎉 {t('celebration')}</MenuItem>
                <MenuItem value="⚠️">⚠️ {t('warning')}</MenuItem>
                <MenuItem value="✅">✅ {t('confirm')}</MenuItem>
                <MenuItem value="📢">📢 {t('announcement')}</MenuItem>
                <MenuItem value="🔔">🔔 {t('notification')}</MenuItem>
              </Select>
            </FormControl>
            <TextField aria-label="input field" label={t('custom_emoji')} value={notifEmoji} onChange={e => setNotifEmoji(e.target.value)} inputProps={{ maxLength: 2, style: { fontSize: 24, textAlign: 'center' } }} sx={{ width: 80, mt: 2 }} disabled={!!notifIcon} placeholder="😊" />
            <Box display="flex" alignItems="center" gap={1} mt={2}>
              <FormControl sx={{ minWidth: 100 }}>
                <InputLabel>{t('custom_color')}</InputLabel>
                <Select value={notifColor} label={t('custom_color')} onChange={e => setNotifColor(e.target.value)}>
                  <MenuItem value=""><em>{t('default')}</em></MenuItem>
                  <MenuItem value="#1976d2"><span style={{ background: '#1976d2', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> {t('blue')}</MenuItem>
                  <MenuItem value="#43a047"><span style={{ background: '#43a047', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> {t('green')}</MenuItem>
                  <MenuItem value="#fbc02d"><span style={{ background: '#fbc02d', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> {t('yellow')}</MenuItem>
                  <MenuItem value="#e53935"><span style={{ background: '#e53935', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} /> {t('red')}</MenuItem>
                </Select>
              </FormControl>
              <input type="color" value={notifColor || '#e3e3e3'} onChange={e => setNotifColor(e.target.value)} style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8 }} title="اختر لون مخصص" />
            </Box>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{t('action_required') + ' (' + t('optional') + ')'}</InputLabel>
              <Select value={notifActionRequired} label={t('action_required') + ' (' + t('optional') + ')'} onChange={e => setNotifActionRequired(e.target.value)}>
                <MenuItem value=""><em>{t('none')}</em></MenuItem>
                <MenuItem value="confirm">{t('confirm')}</MenuItem>
                <MenuItem value="approve">{t('approve')}</MenuItem>
                <MenuItem value="reject">{t('reject')}</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" component="label" sx={{ mt: 2 }}>
              {t('attach_file')} ({t('optional')})
              <input type="file" hidden onChange={e => setNotifFile(e.target.files?.[0] || null)} />
            </Button>
            {notifFile && <Typography variant="body2" color="primary">{notifFile.name}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddNotifDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSendWorkerNotif} variant="contained" disabled={!notifMessage}>{t('send')}</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
        <Snackbar open={!!notify} autoHideDuration={6000} onClose={() => setNotify(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="warning" onClose={() => setNotify(null)}>{notify}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};
export default WorkersPage;
