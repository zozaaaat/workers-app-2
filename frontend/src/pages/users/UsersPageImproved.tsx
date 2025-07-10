import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Snackbar,
  Alert 
} from "@mui/material";
import { Add, Person, AdminPanelSettings, Group } from "@mui/icons-material";
import axios from "axios";
import { API_URL } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { 
  PageLayout, 
  StandardTable, 
  ActionButtons, 
  StatusChip, 
  SearchAndFilter 
} from "../../components/common";

interface User {
  id?: number;
  username: string;
  role: string;
  email?: string;
  created_at?: string;
  is_active?: boolean;
}

const UsersPageImproved: React.FC = () => {
  useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User & { password?: string }>>({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      setError("تعذر تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = (user?: User) => {
    setEditUser(user || null);
    setForm(user ? { ...user } : { role: "employee" });
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

  const validateUser = (user: Partial<User & { password?: string }>) => {
    if (!user.username || !user.role || (!editUser && !user.password) || (!editUser && !user.email)) {
      return false;
    }
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
      if (e.response?.data?.detail) {
        setError(e.response.data.detail);
      } else {
        setError("حدث خطأ أثناء الحفظ");
      }
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      setSuccess("تم الحذف بنجاح");
      fetchUsers();
    } catch (error) {
      setError("حدث خطأ أثناء الحذف");
    }
  };

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase()) ||
      user.role.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleFilter = (filterType: string, value: string) => {
    let filtered = users;
    
    if (filterType === 'role' && value) {
      filtered = users.filter(user => user.role === value);
    } else if (filterType === 'status' && value) {
      filtered = users.filter(user => {
        if (value === 'active') return user.is_active !== false;
        if (value === 'inactive') return user.is_active === false;
        return true;
      });
    }
    
    setFilteredUsers(filtered);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings fontSize="small" />;
      case 'manager': return <Group fontSize="small" />;
      case 'employee': return <Person fontSize="small" />;
      default: return <Person fontSize="small" />;
    }
  };

  const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'primary';
      case 'employee': return 'info';
      default: return 'default';
    }
  };

  // Define table columns
  const columns = [
    { 
      id: 'username', 
      label: 'اسم المستخدم', 
      render: (user: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getRoleIcon(user.role)}
          {user.username}
        </div>
      )
    },
    { 
      id: 'email', 
      label: 'البريد الإلكتروني', 
      render: (user: User) => user.email || 'غير محدد'
    },
    { 
      id: 'role', 
      label: 'الدور', 
      render: (user: User) => (
        <StatusChip 
          status={user.role} 
          color={getRoleColor(user.role)}
          label={
            user.role === 'admin' ? 'مدير' :
            user.role === 'manager' ? 'مشرف' :
            user.role === 'employee' ? 'موظف' : user.role
          }
        />
      )
    },
    { 
      id: 'status', 
      label: 'الحالة', 
      render: (user: User) => (
        <StatusChip 
          status={user.is_active !== false ? 'active' : 'inactive'}
          color={user.is_active !== false ? 'success' : 'error'}
          label={user.is_active !== false ? 'نشط' : 'غير نشط'}
        />
      )
    },
    { 
      id: 'created_at', 
      label: 'تاريخ الإنشاء', 
      render: (user: User) => user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA') : 'غير محدد'
    },
    { 
      id: 'actions', 
      label: 'العمليات', 
      render: (user: User) => (
        <ActionButtons
          onEdit={() => handleOpen(user)}
          onDelete={() => handleDelete(user.id)}
          editTooltip="تعديل المستخدم"
          deleteTooltip="حذف المستخدم"
        />
      )
    }
  ];

  // Quick stats
  const stats = [
    { 
      label: 'إجمالي المستخدمين', 
      value: users.length, 
      color: 'primary' as const 
    },
    { 
      label: 'المدراء', 
      value: users.filter(u => u.role === 'admin').length, 
      color: 'error' as const 
    },
    { 
      label: 'المشرفين', 
      value: users.filter(u => u.role === 'manager').length, 
      color: 'warning' as const 
    },
    { 
      label: 'الموظفين', 
      value: users.filter(u => u.role === 'employee').length, 
      color: 'info' as const 
    }
  ];

  const filterOptions = [
    { value: '', label: 'جميع الأدوار' },
    { value: 'admin', label: 'مدير' },
    { value: 'manager', label: 'مشرف' },
    { value: 'employee', label: 'موظف' }
  ];

  return (
    <PageLayout
      title="إدارة المستخدمين"
      subtitle="إدارة حسابات المستخدمين والأدوار"
      icon={<Person />}
      stats={stats}
      actions={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          إضافة مستخدم جديد
        </Button>
      }
    >
      <SearchAndFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        filterOptions={filterOptions}
        filterLabel="تصفية حسب الدور"
        searchPlaceholder="البحث في المستخدمين..."
      />

      <StandardTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="لا توجد مستخدمين مسجلين"
      />

      {/* Add/Edit User Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="اسم المستخدم"
            name="username"
            value={form.username || ""}
            onChange={handleFormChange}
            fullWidth
            required
            error={!form.username}
            helperText={!form.username ? 'مطلوب' : ''}
          />
          
          {!editUser && (
            <TextField
              margin="dense"
              label="البريد الإلكتروني"
              name="email"
              type="email"
              value={form.email || ""}
              onChange={handleFormChange}
              fullWidth
              required
              error={!form.email}
              helperText={!form.email ? 'مطلوب' : ''}
            />
          )}
          
          {!editUser && (
            <TextField
              margin="dense"
              label="كلمة المرور"
              name="password"
              type="password"
              value={form.password || ""}
              onChange={handleFormChange}
              fullWidth
              required
              error={!form.password}
              helperText={!form.password ? 'مطلوب' : ''}
            />
          )}
          
          <FormControl fullWidth margin="dense" required error={!form.role}>
            <InputLabel>الدور</InputLabel>
            <Select
              name="role"
              value={form.role || "employee"}
              onChange={handleFormChange}
              label="الدور"
            >
              <MenuItem value="admin">مدير</MenuItem>
              <MenuItem value="manager">مشرف</MenuItem>
              <MenuItem value="employee">موظف</MenuItem>
            </Select>
            {!form.role && (
              <Typography color="error" variant="caption">
                مطلوب
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
          <Button onClick={handleSave} variant="contained">
            {editUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess("")}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={4000} 
        onClose={() => setError("")}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default UsersPageImproved;
