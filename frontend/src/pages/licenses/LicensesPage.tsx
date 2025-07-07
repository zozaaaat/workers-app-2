import React, { useEffect, useState } from "react";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from '../../api';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Select, MenuItem, InputLabel, FormControl, Drawer } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import type { SelectChangeEvent } from '@mui/material/Select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const LicensesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const [rows, setRows] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newLicense, setNewLicense] = useState({
    licenseType: '',
    expiryDate: '',
    name: '',
    civil_id: '',
    issuing_authority: '',
    status: '',
    issue_date: '',
    labor_count: 0,
    license_number: '',
    address: '',
    company_id: ''
  });
  const [editLicense, setEditLicense] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selected, setSelected] = useState<any>(null);
  // إضافة فلترة التراخيص حسب الرقم المدني للرخصة
  const [searchCivilId, setSearchCivilId] = useState<string>("");
  const filteredRows: any[] = searchCivilId ? rows.filter((l: any) => l.civil_id && l.civil_id.includes(searchCivilId)) : rows;
  useEffect(() => {
    axios.get(`${API_URL}/licenses`).then(res => setRows(res.data));
    axios.get(`${API_URL}/companies`).then(res => setCompanies(res.data));
  }, []);
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/licenses/${deleteId}`);
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
  const validateLicense = (license: any) => {
    if (!license.licenseType || !license.expiryDate || !license.company_id) return false;
    return true;
  };
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLicense({ ...newLicense, [e.target.name]: e.target.value });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditLicense({ ...editLicense, [e.target.name]: e.target.value });
  };
  const handleAddLicense = async () => {
    if (!validateLicense(newLicense)) {
      setError(t('fillAllFields') || 'يرجى تعبئة جميع الحقول');
      return;
    }
    // تطابق الأسماء مع سكيم الباكند
    const payload = {
      name: newLicense.name,
      civil_id: newLicense.civil_id,
      issuing_authority: newLicense.issuing_authority,
      license_type: newLicense.licenseType,
      status: newLicense.status,
      issue_date: newLicense.issue_date,
      expiry_date: newLicense.expiryDate,
      labor_count: Number(newLicense.labor_count),
      license_number: newLicense.license_number,
      address: newLicense.address,
      company_id: Number(newLicense.company_id)
    };
    try {
      const res = await axios.post(`${API_URL}/licenses`, payload);
      setRows([...rows, res.data]);
      setSuccess(t('addSuccess'));
      setAddOpen(false);
      setNewLicense({
        licenseType: '',
        expiryDate: '',
        name: '',
        civil_id: '',
        issuing_authority: '',
        status: '',
        issue_date: '',
        labor_count: 0,
        license_number: '',
        address: '',
        company_id: ''
      });
    } catch (err: any) {
      setError(t('addError') + (err?.response?.data?.detail ? ': ' + JSON.stringify(err.response.data.detail) : ''));
    }
  };
  const handleEditLicense = async () => {
    if (!validateLicense(editLicense)) {
      setError(t('fillAllFields') || 'يرجى تعبئة جميع الحقول');
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/licenses/${editLicense.id}`, editLicense);
      setRows(rows.map(r => r.id === editLicense.id ? res.data : r));
      setSuccess(t('editSuccess'));
      setEditOpen(false);
      setEditLicense(null);
    } catch {
      setError(t('editError'));
    }
  };
  const fillDemoLicense = () => {
    setNewLicense({
      licenseType: 'ترخيص رئيسي',
      expiryDate: '2025-09-30',
      name: 'شركه ميلانو المتحده للاقمشه',
      civil_id: '4666291',
      issuing_authority: 'وزارة التجارة والصناعة',
      status: 'فعال',
      issue_date: '2019-10-15',
      labor_count: 11,
      license_number: '2019/39997',
      address: 'محافظة العاصمة - القبله - القطعة 009 - القسيمة 800438 - شارع مبارك الكبير - سوق الاقمشه بلوك 4 - رقم الوحدة 00021',
      company_id: companies[0]?.id || ''
    });
    setAddOpen(true);
  };
  const handleExpandRow = (id: number) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  // عرض الشجرة: كل شركة رئيسية وتحتها التراخيص المرتبطة بها
  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>{t("licenses")}</Typography>
      {canEdit && (
        <Box display="flex" gap={2} mb={2}>
          <Button variant="contained" startIcon={<Delete />} sx={{ mb: 2 }} onClick={() => setAddOpen(true)}>{t("add_license")}</Button>
          <Button variant="outlined" color="secondary" onClick={fillDemoLicense}>
            إدخال ترخيص تجريبي
          </Button>
        </Box>
      )}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField label={t("search_by_civil_id") || "بحث بالرقم المدني للرخصة"} size="small" value={searchCivilId} onChange={e => setSearchCivilId(e.target.value)} />
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>{t("total_licenses")}: {filteredRows.length}</Typography>
      </Box>
      <Box mt={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
          {companies.map(company => (
            <Box key={company.id} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, background: '#fafbfc' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="primary">{company.file_name || company.name}</Typography>
                  <Typography variant="body2">{t('company')}: {company.file_number}</Typography>
                </Box>
                <Button startIcon={expandedRows.includes(company.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />} onClick={() => handleExpandRow(company.id)}>
                  {expandedRows.includes(company.id) ? t('hide_sub_licenses') : t('show_sub_licenses')}
                </Button>
              </Box>
              {expandedRows.includes(company.id) && (
                <Box mt={2} ml={3}>
                  <Typography variant="subtitle1" color="secondary" mb={1}>{t('licenses')}</Typography>
                  {filteredRows.filter((l: any) => l.company_id === company.id).length === 0 ? (
                    <Typography color="textSecondary">{t('no_licenses')}</Typography>
                  ) : (
                    filteredRows.filter((l: any) => l.company_id === company.id).map((license: any) => (
                      <Box key={license.id} sx={{ border: '1px solid #eee', borderRadius: 1, p: 1, mb: 1, background: '#fff' }} display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body1" fontWeight={600}>{license.name}</Typography>
                          <Typography variant="body2">{t('civil_id')}: {license.civil_id}</Typography>
                          <Typography variant="body2">{t('status')}: {license.status}</Typography>
                          <Typography variant="body2">{t('expiryDate')}: {license.expiry_date}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Button size="small" color="primary" variant="outlined" onClick={() => { setEditLicense(license); setEditOpen(true); }}><Edit fontSize="small" /></Button>
                          <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(license.id)}><Delete fontSize="small" /></Button>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={license.company_id}
                              onChange={e => {
                                const newCompanyId = e.target.value;
                                setEditLicense({ ...license, company_id: newCompanyId });
                                setEditOpen(true);
                              }}
                            >
                              {companies.map(companyOption => (
                                <MenuItem key={companyOption.id} value={companyOption.id}>{companyOption.file_name || companyOption.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <Button variant="outlined" onClick={() => { setSelected(license); setDrawerOpen(true); }}>{t('show_details')}</Button>
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box p={2} width={350}>
          {selected && (
            <>
              <Typography variant="h6">{t("license_details")}</Typography>
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">{t("name")}: <b>{selected.name}</b></Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("civil_id")}: {selected.civil_id}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("company")}: {companies.find(c => c.id === selected.company_id)?.file_name || selected.company_id}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("status")}: {selected.status}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("licenseType")}: {selected.license_type}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("expiryDate")}: {selected.expiry_date}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("issue_date")}: {selected.issue_date}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("issuing_authority")}: {selected.issuing_authority}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("license_number")}: {selected.license_number}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("address")}: {selected.address}</Typography>
                <Typography variant="subtitle2" color="textSecondary">{t("labor_count")}: {selected.labor_count}</Typography>
              </Box>
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
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>{t('add_license')}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label={t('licenseType')} name="licenseType" value={newLicense.licenseType} onChange={handleAddChange} fullWidth required error={!newLicense.licenseType} helperText={!newLicense.licenseType ? t('required') : ''} />
          <TextField margin="dense" label={t('expiryDate')} name="expiryDate" type="date" value={newLicense.expiryDate} onChange={handleAddChange} fullWidth required error={!newLicense.expiryDate} helperText={!newLicense.expiryDate ? t('required') : ''} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label={t('name')} name="name" value={newLicense.name} onChange={handleAddChange} fullWidth required error={!newLicense.name} helperText={!newLicense.name ? t('required') : ''} />
          <TextField margin="dense" label={t('civil_id')} name="civil_id" value={newLicense.civil_id} onChange={handleAddChange} fullWidth required error={!newLicense.civil_id} helperText={!newLicense.civil_id ? t('required') : ''} />
          <TextField margin="dense" label={t('issuing_authority')} name="issuing_authority" value={newLicense.issuing_authority} onChange={handleAddChange} fullWidth required error={!newLicense.issuing_authority} helperText={!newLicense.issuing_authority ? t('required') : ''} />
          <TextField margin="dense" label={t('status')} name="status" value={newLicense.status} onChange={handleAddChange} fullWidth required error={!newLicense.status} helperText={!newLicense.status ? t('required') : ''} />
          <TextField margin="dense" label={t('issue_date')} name="issue_date" type="date" value={newLicense.issue_date} onChange={handleAddChange} fullWidth required error={!newLicense.issue_date} helperText={!newLicense.issue_date ? t('required') : ''} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label={t('labor_count')} name="labor_count" type="number" value={newLicense.labor_count} onChange={handleAddChange} fullWidth required error={!newLicense.labor_count} helperText={!newLicense.labor_count ? t('required') : ''} />
          <TextField margin="dense" label={t('license_number')} name="license_number" value={newLicense.license_number} onChange={handleAddChange} fullWidth required error={!newLicense.license_number} helperText={!newLicense.license_number ? t('required') : ''} />
          <TextField margin="dense" label={t('address')} name="address" value={newLicense.address} onChange={handleAddChange} fullWidth required error={!newLicense.address} helperText={!newLicense.address ? t('required') : ''} />
          <FormControl fullWidth margin="dense">
            <InputLabel id="company-select-label">{t('company')}</InputLabel>
            <Select
              labelId="company-select-label"
              id="add-license-company_id"
              name="company_id"
              value={newLicense.company_id || ''}
              label={t('company')}
              onChange={(e: SelectChangeEvent) => setNewLicense({ ...newLicense, company_id: e.target.value })}
              required
            >
              {companies.map(company => (
                <MenuItem key={company.id} value={company.id}>{company.file_name || company.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleAddLicense} variant="contained">{t('add')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>{t('edit_license')}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label={t('licenseType')} name="licenseType" value={editLicense?.licenseType || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.licenseType} helperText={editLicense && !editLicense.licenseType ? t('required') : ''} />
          <TextField margin="dense" label={t('expiryDate')} name="expiryDate" type="date" value={editLicense?.expiryDate || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.expiryDate} helperText={editLicense && !editLicense.expiryDate ? t('required') : ''} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label={t('name')} name="name" value={editLicense?.name || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.name} helperText={editLicense && !editLicense.name ? t('required') : ''} />
          <TextField margin="dense" label={t('civil_id')} name="civil_id" value={editLicense?.civil_id || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.civil_id} helperText={editLicense && !editLicense.civil_id ? t('required') : ''} />
          <TextField margin="dense" label={t('issuing_authority')} name="issuing_authority" value={editLicense?.issuing_authority || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.issuing_authority} helperText={editLicense && !editLicense.issuing_authority ? t('required') : ''} />
          <TextField margin="dense" label={t('status')} name="status" value={editLicense?.status || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.status} helperText={editLicense && !editLicense.status ? t('required') : ''} />
          <TextField margin="dense" label={t('issue_date')} name="issue_date" type="date" value={editLicense?.issue_date || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.issue_date} helperText={editLicense && !editLicense.issue_date ? t('required') : ''} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label={t('labor_count')} name="labor_count" type="number" value={editLicense?.labor_count || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.labor_count} helperText={editLicense && !editLicense.labor_count ? t('required') : ''} />
          <TextField margin="dense" label={t('license_number')} name="license_number" value={editLicense?.license_number || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.license_number} helperText={editLicense && !editLicense.license_number ? t('required') : ''} />
          <TextField margin="dense" label={t('address')} name="address" value={editLicense?.address || ''} onChange={handleEditChange} fullWidth required error={editLicense && !editLicense.address} helperText={editLicense && !editLicense.address ? t('required') : ''} />
          <FormControl fullWidth margin="dense">
            <InputLabel id="edit-company-select-label">{t('company')}</InputLabel>
            <Select
              labelId="edit-company-select-label"
              id="edit-license-company_id"
              name="company_id"
              value={editLicense?.company_id || ''}
              label={t('company')}
              onChange={e => setEditLicense({ ...editLicense, company_id: e.target.value })}
              required
            >
              {companies.map(company => (
                <MenuItem key={company.id} value={company.id}>{company.file_name || company.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleEditLicense} variant="contained">{t('save')}</Button>
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
export default LicensesPage;
