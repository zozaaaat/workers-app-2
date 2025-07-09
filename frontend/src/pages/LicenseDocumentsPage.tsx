import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Snackbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab
} from '@mui/material';
import {
  Upload as UploadIcon,
  Search as SearchIcon,
  Delete,
  Edit as EditIcon,
  Visibility,
  Add as AddIcon,
  CloudUpload,
  Archive as ArchiveIcon,
  InsertDriveFile as FileIcon,
  Notifications as NotificationsIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  AccountBalance as BankIcon,
  Build as MaintenanceIcon,
  ElectricBolt as UtilityIcon,
  Gavel as LegalIcon,
  TrendingUp as FinancialIcon,
  MoreHoriz as OtherIcon
} from '@mui/icons-material';
import axios from 'axios';

// أنواع البيانات
interface LicenseDocument {
  id: number;
  license_id: number;
  filename: string;
  original_filename: string;
  document_type: string;
  description?: string;
  license_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  license_status?: string;
  upload_date: string;
  notification_sent: boolean;
}

interface ArchiveDocument {
  id: number;
  filename: string;
  original_filename: string;
  archive_type: string;
  category: string;
  title: string;
  description?: string;
  contract_number?: string;
  amount?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  party_name?: string;
  party_contact?: string;
  payment_date?: string;
  payment_method?: string;
  reference_number?: string;
  company_id?: number;
  license_id?: number;
  is_recurring: boolean;
  next_due_date?: string;
  status: string;
  upload_date: string;
}

interface DocumentNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  due_date: string;
  priority: string;
  document_id: number;
  company_id?: number;
  license_id?: number;
}

// الفئات والأنواع
const ARCHIVE_CATEGORIES = [
  { value: 'contracts', label: 'العقود', icon: <DescriptionIcon />, color: '#28a745' },
  { value: 'receipts', label: 'الفواتير والإيصالات', icon: <ReceiptIcon />, color: '#007bff' },
  { value: 'insurances', label: 'التأمينات', icon: <SecurityIcon />, color: '#17a2b8' },
  { value: 'guarantees', label: 'الضمانات', icon: <BankIcon />, color: '#ffc107' },
  { value: 'legal_documents', label: 'المستندات القانونية', icon: <LegalIcon />, color: '#dc3545' },
  { value: 'financial_documents', label: 'المستندات المالية', icon: <FinancialIcon />, color: '#6f42c1' },
  { value: 'utilities', label: 'الخدمات العامة', icon: <UtilityIcon />, color: '#fd7e14' },
  { value: 'maintenance', label: 'الصيانة', icon: <MaintenanceIcon />, color: '#20c997' },
  { value: 'other', label: 'أخرى', icon: <OtherIcon />, color: '#6c757d' }
];

const ARCHIVE_TYPES = [
  { value: 'rent_contract', label: 'عقد إيجار', category: 'contracts' },
  { value: 'rent_receipt', label: 'إيصال إيجار', category: 'receipts' },
  { value: 'electricity_bill', label: 'فاتورة كهرباء', category: 'utilities' },
  { value: 'water_bill', label: 'فاتورة مياه', category: 'utilities' },
  { value: 'insurance_policy', label: 'بوليصة تأمين', category: 'insurances' },
  { value: 'bank_guarantee', label: 'ضمان بنكي', category: 'guarantees' },
  { value: 'maintenance_contract', label: 'عقد صيانة', category: 'maintenance' },
  { value: 'service_contract', label: 'عقد خدمة', category: 'contracts' }
];

const DOCUMENT_TYPES = [
  { value: 'main_license', label: 'رخصة رئيسية' },
  { value: 'sub_license', label: 'رخصة فرعية' },
  { value: 'license_renewal', label: 'تجديد رخصة' },
  { value: 'license_amendment', label: 'تعديل رخصة' },
  { value: 'commercial_license', label: 'رخصة تجارية' },
  { value: 'industrial_license', label: 'رخصة صناعية' },
  { value: 'professional_license', label: 'رخصة مهنية' },
  { value: 'import_license', label: 'رخصة استيراد' },
  { value: 'health_license', label: 'رخصة صحية' },
  { value: 'environmental_license', label: 'رخصة بيئية' },
  { value: 'fire_safety_license', label: 'رخصة السلامة' },
  { value: 'advertising_license', label: 'رخصة إعلان' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'نقد' },
  { value: 'bank_transfer', label: 'حوالة بنكية' },
  { value: 'check', label: 'شيك' },
  { value: 'credit_card', label: 'بطاقة ائتمان' },
  { value: 'other', label: 'أخرى' }
];

const LicenseDocumentsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [licenseDocuments, setLicenseDocuments] = useState<LicenseDocument[]>([]);
  const [archiveDocuments, setArchiveDocuments] = useState<ArchiveDocument[]>([]);
  const [notifications, setNotifications] = useState<DocumentNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // حالات الحوارات
  const [openLicenseDialog, setOpenLicenseDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  
  // حالات النماذج
  const [licenseForm, setLicenseForm] = useState({
    license_id: '',
    document_type: '',
    description: '',
    license_number: '',
    issue_date: '',
    expiry_date: '',
    issuing_authority: '',
    license_status: '',
    file: null as File | null
  });
  
  const [archiveForm, setArchiveForm] = useState({
    archive_type: '',
    category: '',
    title: '',
    description: '',
    contract_number: '',
    amount: '',
    currency: 'EGP',
    start_date: '',
    end_date: '',
    party_name: '',
    party_contact: '',
    payment_date: '',
    payment_method: '',
    reference_number: '',
    company_id: '',
    license_id: '',
    is_recurring: false,
    next_due_date: '',
    status: 'active',
    file: null as File | null
  });
  
  // حالات البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // تحميل البيانات
  useEffect(() => {
    loadLicenseDocuments();
    loadArchiveDocuments();
    loadNotifications();
  }, []);
  
  const loadLicenseDocuments = async () => {
    try {
      setLoading(true);
      // في التطبيق الفعلي، ستحتاج إلى معرف الترخيص
      const response = await axios.get('/api/license-documents/licenses/1/documents');
      setLicenseDocuments(response.data);
    } catch (error) {
      setError('خطأ في تحميل مستندات الرخص');
    } finally {
      setLoading(false);
    }
  };
  
  const loadArchiveDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/license-documents/archive');
      setArchiveDocuments(response.data);
    } catch (error) {
      setError('خطأ في تحميل الأرشيف');
    } finally {
      setLoading(false);
    }
  };
  
  const loadNotifications = async () => {
    try {
      const response = await axios.get('/api/license-documents/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('خطأ في تحميل الإشعارات:', error);
    }
  };
  
  // رفع مستند رخصة
  const handleLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseForm.file) {
      setError('يرجى اختيار ملف');
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', licenseForm.file);
      formData.append('document_type', licenseForm.document_type);
      formData.append('description', licenseForm.description);
      formData.append('license_number', licenseForm.license_number);
      if (licenseForm.issue_date) formData.append('issue_date', licenseForm.issue_date);
      if (licenseForm.expiry_date) formData.append('expiry_date', licenseForm.expiry_date);
      formData.append('issuing_authority', licenseForm.issuing_authority);
      formData.append('license_status', licenseForm.license_status);
      
      await axios.post(`/api/license-documents/licenses/${licenseForm.license_id}/documents`, formData);
      setSuccess('تم رفع المستند بنجاح');
      setOpenLicenseDialog(false);
      resetLicenseForm();
      loadLicenseDocuments();
      loadNotifications();
    } catch (error) {
      setError('خطأ في رفع المستند');
    } finally {
      setLoading(false);
    }
  };
  
  // رفع مستند أرشيف
  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveForm.file) {
      setError('يرجى اختيار ملف');
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', archiveForm.file);
      formData.append('archive_type', archiveForm.archive_type);
      formData.append('category', archiveForm.category);
      formData.append('title', archiveForm.title);
      formData.append('description', archiveForm.description);
      formData.append('contract_number', archiveForm.contract_number);
      formData.append('amount', archiveForm.amount);
      formData.append('currency', archiveForm.currency);
      if (archiveForm.start_date) formData.append('start_date', archiveForm.start_date);
      if (archiveForm.end_date) formData.append('end_date', archiveForm.end_date);
      formData.append('party_name', archiveForm.party_name);
      formData.append('party_contact', archiveForm.party_contact);
      if (archiveForm.payment_date) formData.append('payment_date', archiveForm.payment_date);
      formData.append('payment_method', archiveForm.payment_method);
      formData.append('reference_number', archiveForm.reference_number);
      formData.append('company_id', archiveForm.company_id);
      formData.append('license_id', archiveForm.license_id);
      formData.append('is_recurring', archiveForm.is_recurring.toString());
      if (archiveForm.next_due_date) formData.append('next_due_date', archiveForm.next_due_date);
      formData.append('status', archiveForm.status);
      
      await axios.post('/api/license-documents/archive', formData);
      setSuccess('تم رفع المستند للأرشيف بنجاح');
      setOpenArchiveDialog(false);
      resetArchiveForm();
      loadArchiveDocuments();
      loadNotifications();
    } catch (error) {
      setError('خطأ في رفع المستند');
    } finally {
      setLoading(false);
    }
  };
  
  const resetLicenseForm = () => {
    setLicenseForm({
      license_id: '',
      document_type: '',
      description: '',
      license_number: '',
      issue_date: '',
      expiry_date: '',
      issuing_authority: '',
      license_status: '',
      file: null
    });
  };
  
  const resetArchiveForm = () => {
    setArchiveForm({
      archive_type: '',
      category: '',
      title: '',
      description: '',
      contract_number: '',
      amount: '',
      currency: 'EGP',
      start_date: '',
      end_date: '',
      party_name: '',
      party_contact: '',
      payment_date: '',
      payment_method: '',
      reference_number: '',
      company_id: '',
      license_id: '',
      is_recurring: false,
      next_due_date: '',
      status: 'active',
      file: null
    });
  };
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'expired': return '#dc3545';
      case 'cancelled': return '#6c757d';
      case 'renewed': return '#007bff';
      default: return '#6c757d';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    const categoryData = ARCHIVE_CATEGORIES.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : <FileIcon />;
  };
  
  const filteredArchiveDocuments = archiveDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.party_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const filteredLicenseDocuments = licenseDocuments.filter(doc => {
    const matchesSearch = doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.license_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  return (
    <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            إدارة ملفات الرخص والأرشيف
          </Typography>
          <Box>
            <Tooltip title="الإشعارات">
              <IconButton onClick={() => setOpenNotificationDrawer(true)}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="البحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>الفئة</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">الكل</MenuItem>
              {ARCHIVE_CATEGORIES.map(cat => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="expired">منتهي</MenuItem>
              <MenuItem value="cancelled">ملغي</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="مستندات الرخص" />
            <Tab label="الأرشيف" />
            <Tab label="الإحصائيات" />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">مستندات الرخص</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenLicenseDialog(true)}
              >
                إضافة مستند رخصة
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>الملف</TableCell>
                    <TableCell>نوع المستند</TableCell>
                    <TableCell>رقم الترخيص</TableCell>
                    <TableCell>تاريخ الإصدار</TableCell>
                    <TableCell>تاريخ الانتهاء</TableCell>
                    <TableCell>الجهة المصدرة</TableCell>
                    <TableCell>الحالة</TableCell>
                    <TableCell>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLicenseDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FileIcon sx={{ mr: 1 }} />
                          {doc.original_filename}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{doc.license_number}</TableCell>
                      <TableCell>{doc.issue_date || '-'}</TableCell>
                      <TableCell>
                        {doc.expiry_date && (
                          <Chip
                            label={doc.expiry_date}
                            size="small"
                            color={new Date(doc.expiry_date) < new Date() ? 'error' : 'default'}
                          />
                        )}
                      </TableCell>
                      <TableCell>{doc.issuing_authority}</TableCell>
                      <TableCell>
                        <Chip
                          label={doc.license_status || 'غير محدد'}
                          size="small"
                          color={doc.license_status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">الأرشيف</Typography>
              <Button
                variant="contained"
                startIcon={<ArchiveIcon />}
                onClick={() => setOpenArchiveDialog(true)}
              >
                إضافة للأرشيف
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {filteredArchiveDocuments.map((doc) => (
                <Box key={doc.id} sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getCategoryIcon(doc.category)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {doc.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {doc.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          label={ARCHIVE_CATEGORIES.find(c => c.value === doc.category)?.label}
                          size="small"
                          style={{ backgroundColor: ARCHIVE_CATEGORIES.find(c => c.value === doc.category)?.color }}
                        />
                        <Chip
                          label={doc.status}
                          size="small"
                          style={{ backgroundColor: getStatusColor(doc.status) }}
                        />
                      </Box>
                      
                      {doc.amount && (
                        <Typography variant="body2">
                          المبلغ: {doc.amount} {doc.currency}
                        </Typography>
                      )}
                      
                      {doc.end_date && (
                        <Typography variant="body2">
                          ينتهي في: {doc.end_date}
                        </Typography>
                      )}
                      
                      {doc.next_due_date && (
                        <Typography variant="body2" color="warning.main">
                          الاستحقاق التالي: {doc.next_due_date}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>                    </Card>
                  </Box>
                ))}
              </Box>
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>الإحصائيات</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {licenseDocuments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      مستندات الرخص
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="secondary">
                      {archiveDocuments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      المستندات المؤرشفة
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {notifications.filter(n => n.type === 'license_expiry').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      رخص منتهية
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="error.main">
                      {notifications.filter(n => n.type === 'recurring_due').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      مستحقات متكررة
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Notification Drawer */}
        <Drawer
          anchor="right"
          open={openNotificationDrawer}
          onClose={() => setOpenNotificationDrawer(false)}
          sx={{ '& .MuiDrawer-paper': { width: 400 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              الإشعارات ({notifications.length})
            </Typography>
            <List>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon style={{ color: getPriorityColor(notification.priority) }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={notification.message}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Drawer>
        
        {/* Floating Action Buttons */}
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Fab
            color="primary"
            onClick={() => setOpenLicenseDialog(true)}
            sx={{ mr: 1 }}
          >
            <AddIcon />
          </Fab>
          <Fab
            color="secondary"
            onClick={() => setOpenArchiveDialog(true)}
          >
            <ArchiveIcon />
          </Fab>
        </Box>
        
        {/* Dialogs and Snackbars */}
        {/* License Document Dialog */}
        <Dialog
          open={openLicenseDialog}
          onClose={() => setOpenLicenseDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>إضافة مستند رخصة</DialogTitle>
          <form onSubmit={handleLicenseSubmit}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      label="معرف الترخيص"
                      type="number"
                      fullWidth
                      required
                      value={licenseForm.license_id}
                      onChange={(e) => setLicenseForm({...licenseForm, license_id: e.target.value})}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <FormControl fullWidth required>
                      <InputLabel>نوع المستند</InputLabel>
                      <Select
                        value={licenseForm.document_type}
                        onChange={(e) => setLicenseForm({...licenseForm, document_type: e.target.value})}
                      >
                        {DOCUMENT_TYPES.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <TextField
                  label="الوصف"
                  fullWidth
                  multiline
                  rows={2}
                  value={licenseForm.description}
                  onChange={(e) => setLicenseForm({...licenseForm, description: e.target.value})}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      label="رقم الترخيص"
                      fullWidth
                      value={licenseForm.license_number}
                      onChange={(e) => setLicenseForm({...licenseForm, license_number: e.target.value})}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      label="الجهة المصدرة"
                      fullWidth
                      value={licenseForm.issuing_authority}
                      onChange={(e) => setLicenseForm({...licenseForm, issuing_authority: e.target.value})}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      label="تاريخ الإصدار"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={licenseForm.issue_date || ''}
                      onChange={(e) => setLicenseForm({...licenseForm, issue_date: e.target.value})}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      label="تاريخ الانتهاء"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={licenseForm.expiry_date || ''}
                      onChange={(e) => setLicenseForm({...licenseForm, expiry_date: e.target.value})}
                    />
                  </Box>
                </Box>
                <TextField
                  label="حالة الترخيص"
                  fullWidth
                  value={licenseForm.license_status}
                  onChange={(e) => setLicenseForm({...licenseForm, license_status: e.target.value})}
                />
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<CloudUpload />}
                  >
                    اختيار ملف
                    <input
                      type="file"
                      hidden
                      onChange={(e) => setLicenseForm({...licenseForm, file: e.target.files?.[0] || null})}
                    />
                  </Button>
                  {licenseForm.file && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      الملف المحدد: {licenseForm.file.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenLicenseDialog(false)}>إلغاء</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'رفع'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        
        {/* Archive Document Dialog */}
        <Dialog
          open={openArchiveDialog}
          onClose={() => setOpenArchiveDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>إضافة مستند للأرشيف</DialogTitle>
          <form onSubmit={handleArchiveSubmit}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <FormControl fullWidth required>
                      <InputLabel>الفئة</InputLabel>
                      <Select
                        value={archiveForm.category}
                        onChange={(e) => setArchiveForm({...archiveForm, category: e.target.value})}
                      >
                        {ARCHIVE_CATEGORIES.map(cat => (
                          <MenuItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <FormControl fullWidth required>
                      <InputLabel>النوع</InputLabel>
                      <Select
                        value={archiveForm.archive_type}
                        onChange={(e) => setArchiveForm({...archiveForm, archive_type: e.target.value})}
                      >
                        {ARCHIVE_TYPES.filter(type => 
                          !archiveForm.category || type.category === archiveForm.category
                        ).map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <TextField
                  label="العنوان"
                  fullWidth
                  required
                  value={archiveForm.title}
                  onChange={(e) => setArchiveForm({...archiveForm, title: e.target.value})}
                />
                <TextField
                  label="الوصف"
                  fullWidth
                  multiline
                  rows={2}
                  value={archiveForm.description}
                  onChange={(e) => setArchiveForm({...archiveForm, description: e.target.value})}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      label="رقم العقد/المرجع"
                      fullWidth
                      value={archiveForm.contract_number}
                      onChange={(e) => setArchiveForm({...archiveForm, contract_number: e.target.value})}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      label="اسم الطرف الآخر"
                      fullWidth
                      value={archiveForm.party_name}
                      onChange={(e) => setArchiveForm({...archiveForm, party_name: e.target.value})}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <TextField
                      label="المبلغ"
                      type="number"
                      fullWidth
                      value={archiveForm.amount}
                      onChange={(e) => setArchiveForm({...archiveForm, amount: e.target.value})}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <TextField
                      label="العملة"
                      fullWidth
                      value={archiveForm.currency}
                      onChange={(e) => setArchiveForm({...archiveForm, currency: e.target.value})}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <FormControl fullWidth>
                      <InputLabel>طريقة الدفع</InputLabel>
                      <Select
                        value={archiveForm.payment_method}
                        onChange={(e) => setArchiveForm({...archiveForm, payment_method: e.target.value})}
                      >
                        {PAYMENT_METHODS.map(method => (
                          <MenuItem key={method.value} value={method.value}>
                            {method.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      label="تاريخ البداية"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={archiveForm.start_date || ''}
                      onChange={(e) => setArchiveForm({...archiveForm, start_date: e.target.value})}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      label="تاريخ النهاية"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={archiveForm.end_date || ''}
                      onChange={(e) => setArchiveForm({...archiveForm, end_date: e.target.value})}
                    />
                  </Box>
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadIcon />}
                  >
                    اختيار ملف
                    <input
                      type="file"
                      hidden
                      onChange={(e) => setArchiveForm({...archiveForm, file: e.target.files?.[0] || null})}
                    />
                  </Button>
                  {archiveForm.file && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      الملف المحدد: {archiveForm.file.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenArchiveDialog(false)}>إلغاء</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'رفع'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        
        {/* Snackbars */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default LicenseDocumentsPage;
