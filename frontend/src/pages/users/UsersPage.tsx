import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import { API_URL } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

interface User {
  id?: number;
  username: string;
  role: string;
  email?: string;
}

const UsersPage: React.FC = () => {
  useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User & { password?: string }>>({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
    } catch {
      setError("تعذر تحميل المستخدمين");
    }
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleOpen = (u?: User) => {
    setEditUser(u || null);
    setForm(u ? { ...u } : { role: "employee" }); // افتراضي موظف عند الإضافة
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
    setForm({});
  };
  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  // التحقق من صحة النموذج
  const validateUser = (user: Partial<User & { password?: string }>) => {
    if (!user.username || !user.role || (!editUser && !user.password) || (!editUser && !user.email)) return false;
    return true;
  };
  const handleSave = async () => {
    if (!validateUser(form)) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    try {
      if (editUser) {
        await axios.put(`${API_URL}/users/${editUser.id}`, {
          username: form.username,
          email: form.email,
          role: form.role,
        });
        setSuccess("تم التعديل بنجاح");
      } else {
        await axios.post(`${API_URL}/users`, {
          username: form.username,
          email: form.email,
          role: form.role,
          password: form.password
        });
        setSuccess("تمت الإضافة بنجاح");
      }
      fetchUsers();
      handleClose();
    } catch (e: any) {
      if (e.response?.data?.detail) setError(e.response.data.detail);
      else setError("حدث خطأ أثناء الحفظ");
    }
  };
  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      setSuccess("تم الحذف بنجاح");
      fetchUsers();
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="#7b2ff2" sx={{ letterSpacing: 1, animation: 'fadeInDown 1s' }}>{t('add')} {t('admin')}</Typography>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => handleOpen()}>{t('add')} {t('user')}</Button>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('username')}</TableCell>
              <TableCell>{t('role')}</TableCell>
              <TableCell>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(u)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(u.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editUser ? t('edit') : t('add')} {t('user')}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label={t('username')} name="username" value={form.username || ""} onChange={handleFormChange} fullWidth required error={!form.username} helperText={!form.username ? t('required') : ''} />
          {!editUser && (
            <TextField margin="dense" label={t('email')} name="email" value={form.email || ""} onChange={handleFormChange} fullWidth required error={!form.email} helperText={!form.email ? t('required') : ''} />
          )}
          {!editUser && (
            <TextField margin="dense" label={t('password')} name="password" type="password" value={form.password || ""} onChange={handleFormChange} fullWidth required error={!form.password} helperText={!form.password ? t('required') : ''} />
          )}
          <FormControl fullWidth margin="dense" required error={!form.role}>
            <InputLabel id="role-label">{t('role')}</InputLabel>
            <Select
              name="role"
              labelId="role-label"
              value={form.role || "employee"}
              onChange={handleFormChange}
              label={t('role')}
              inputProps={{ 'aria-label': t('role') }}
            >
              <MenuItem value="admin">{t('admin')}</MenuItem>
              <MenuItem value="manager">{t('manager')}</MenuItem>
              <MenuItem value="employee">{t('employee')}</MenuItem>
            </Select>
            {!form.role && <Typography color="error" variant="caption">{t('required')}</Typography>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          <Button onClick={handleSave} variant="contained">{t('save')}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}><Alert severity="success">{success}</Alert></Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}><Alert severity="error">{error}</Alert></Snackbar>
    </Box>
  );
};

export default UsersPage;
