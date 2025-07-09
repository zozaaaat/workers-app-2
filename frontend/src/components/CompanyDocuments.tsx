import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../api';

interface CompanyDocument {
  id: number;
  company_id: number;
  filename: string;
  original_filename: string;
  filepath: string;
  filetype: string;
  document_type: string;
  description?: string;
  upload_date: string;
  extracted_text?: string;
  license_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  license_status?: string;
  notification_sent: boolean;
  notification_6_months: boolean;
  notification_3_months: boolean;
  notification_1_month: boolean;
  notification_1_week: boolean;
}

interface DocumentType {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  is_active: boolean;
}

interface ExpiryAlert {
  document_id: number;
  company_id: number;
  company_name: string;
  document_type: string;
  license_number?: string;
  expiry_date: string;
  days_remaining: number;
  alert_type: string;
}

interface CompanyDocumentsProps {
  company: {
    id: number;
    file_name: string;
    file_number: string;
  };
  open: boolean;
  onClose: () => void;
}

const CompanyDocuments: React.FC<CompanyDocumentsProps> = ({ company, open, onClose }) => {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewDocument, setViewDocument] = useState<CompanyDocument | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // جلب المستندات
  useEffect(() => {
    if (open && company.id) {
      fetchDocuments();
      fetchDocumentTypes();
      fetchAlerts();
    }
  }, [open, company.id]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/company_documents/company/${company.id}`);
      setDocuments(response.data);
    } catch (error) {
      setError('خطأ في جلب المستندات');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/company_documents/types/all`);
      setDocumentTypes(response.data);
    } catch (error) {
      console.error('خطأ في جلب أنواع المستندات:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/company_documents/expiry-alerts/all`);
      const companyAlerts = response.data.filter((alert: ExpiryAlert) => alert.company_id === company.id);
      setAlerts(companyAlerts);
    } catch (error) {
      console.error('خطأ في جلب التنبيهات:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocType) {
      setError('يرجى اختيار ملف ونوع المستند');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('company_id', company.id.toString());
    formData.append('document_type', selectedDocType);
    formData.append('description', description);

    try {
      await axios.post(`${API_URL}/company_documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(progress);
        }
      });

      setSuccess('تم رفع المستند بنجاح');
      setSelectedFile(null);
      setSelectedDocType('');
      setDescription('');
      setUploadProgress(0);
      fetchDocuments();
      fetchAlerts();
    } catch (error) {
      setError('خطأ في رفع المستند');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      try {
        await axios.delete(`${API_URL}/company_documents/${documentId}`);
        setSuccess('تم حذف المستند بنجاح');
        fetchDocuments();
        fetchAlerts();
      } catch (error) {
        setError('خطأ في حذف المستند');
      }
    }
  };

  const handleDownload = (document: CompanyDocument) => {
    window.open(`${API_URL}/static/${document.filepath}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'فعال':
      case 'ساري المفعول':
      case 'نشط':
        return 'success';
      case 'منتهي':
      case 'منتهي الصلاحية':
        return 'error';
      case 'معلق':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.name === type);
    return docType ? docType.name_ar : type;
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { color: 'error', text: 'منتهي الصلاحية', icon: <ErrorIcon /> };
    } else if (diffDays <= 7) {
      return { color: 'error', text: `${diffDays} يوم`, icon: <WarningIcon /> };
    } else if (diffDays <= 30) {
      return { color: 'warning', text: `${diffDays} يوم`, icon: <WarningIcon /> };
    } else if (diffDays <= 90) {
      return { color: 'warning', text: `${Math.ceil(diffDays / 30)} شهر`, icon: <ScheduleIcon /> };
    } else {
      return { color: 'success', text: `${Math.ceil(diffDays / 30)} شهر`, icon: <CheckCircleIcon /> };
    }
  };

  const getAlertCount = () => {
    return alerts.filter(alert => alert.alert_type === 'expired' || alert.days_remaining <= 30).length;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon />
          <Typography variant="h6">
            مستندات الشركة: {company.file_name}
          </Typography>
          {getAlertCount() > 0 && (
            <Badge badgeContent={getAlertCount()} color="error">
              <WarningIcon color="warning" />
            </Badge>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* قسم التنبيهات */}
        {alerts.length > 0 && (
          <Card sx={{ mb: 2, bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                ⚠️ تنبيهات انتهاء الصلاحية
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {alerts.map((alert) => (
                  <Box sx={{ width: { xs: '100%', md: '48%' } }} key={alert.document_id}>
                    <Alert 
                      severity={alert.alert_type === 'expired' ? 'error' : 'warning'}
                      variant="outlined"
                    >
                      <Typography variant="body2">
                        <strong>{getDocumentTypeLabel(alert.document_type)}</strong>
                        <br />
                        {alert.days_remaining < 0 ? 'منتهي الصلاحية' : `${alert.days_remaining} يوم متبقي`}
                        <br />
                        {alert.license_number && `رقم: ${alert.license_number}`}
                      </Typography>
                    </Alert>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* قسم رفع المستندات */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <UploadIcon sx={{ mr: 1 }} />
              رفع مستند جديد
            </Typography>
            
            <Box sx={{display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center"}}>
              <Box sx={{width: {xs: "100%", md: "25%"}}}>
                <FormControl fullWidth>
                  <InputLabel>نوع المستند</InputLabel>
                  <Select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                  >
                    {documentTypes.map((type) => (
                      <MenuItem key={type.id} value={type.name}>
                        {type.name_ar}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{width: {xs: "100%", md: "33%"}}}>
                <TextField
                  fullWidth
                  label="وصف المستند (اختياري)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Box>
              
              <Box sx={{width: {xs: "100%", md: "25%"}}}>
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
                    accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
                    onChange={handleFileChange}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="caption" color="primary">
                    {selectedFile.name}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{width: {xs: "100%", md: "16%"}}}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !selectedDocType}
                  startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                >
                  {uploading ? 'جاري الرفع...' : 'رفع'}
                </Button>
              </Box>
            </Box>

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="textSecondary">
                  {uploadProgress}% مكتمل
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* قائمة المستندات */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نوع المستند</TableCell>
                <TableCell>اسم الملف</TableCell>
                <TableCell>رقم الرخصة</TableCell>
                <TableCell>تاريخ الانتهاء</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">لا توجد مستندات</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => {
                  const expiryStatus = getExpiryStatus(doc.expiry_date || '');
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Chip
                          label={getDocumentTypeLabel(doc.document_type)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={doc.original_filename}>
                          <Typography noWrap sx={{ maxWidth: 200 }}>
                            {doc.original_filename}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {doc.license_number || '-'}
                      </TableCell>
                      <TableCell>
                        {doc.expiry_date ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {new Date(doc.expiry_date).toLocaleDateString('ar-EG')}
                            </Typography>
                            {expiryStatus && (
                              <Chip
                                label={expiryStatus.text}
                                color={expiryStatus.color as any}
                                size="small"
                                icon={expiryStatus.icon}
                              />
                            )}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={doc.license_status || 'غير محدد'}
                          color={getStatusColor(doc.license_status || '') as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => setViewDocument(doc)}
                          color="primary"
                          size="small"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDownload(doc)}
                          color="secondary"
                          size="small"
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(doc.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>

      {/* نافذة عرض تفاصيل المستند */}
      <Dialog
        open={!!viewDocument}
        onClose={() => setViewDocument(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>تفاصيل المستند</DialogTitle>
        <DialogContent>
          {viewDocument && (
            <Box sx={{display: "flex", flexWrap: "wrap", gap: 2}}>
              <Box sx={{width: {xs: "100%", md: "48%"}}}>
                <Typography variant="subtitle2">نوع المستند:</Typography>
                <Typography variant="body2" gutterBottom>
                  {getDocumentTypeLabel(viewDocument.document_type)}
                </Typography>
              </Box>
              
              <Box sx={{width: {xs: "100%", md: "48%"}}}>
                <Typography variant="subtitle2">رقم الرخصة:</Typography>
                <Typography variant="body2" gutterBottom>
                  {viewDocument.license_number || 'غير محدد'}
                </Typography>
              </Box>
              
              <Box sx={{width: {xs: "100%", md: "48%"}}}>
                <Typography variant="subtitle2">تاريخ الإصدار:</Typography>
                <Typography variant="body2" gutterBottom>
                  {viewDocument.issue_date ? new Date(viewDocument.issue_date).toLocaleDateString('ar-EG') : 'غير محدد'}
                </Typography>
              </Box>
              
              <Box sx={{width: {xs: "100%", md: "48%"}}}>
                <Typography variant="subtitle2">تاريخ الانتهاء:</Typography>
                <Typography variant="body2" gutterBottom>
                  {viewDocument.expiry_date ? new Date(viewDocument.expiry_date).toLocaleDateString('ar-EG') : 'غير محدد'}
                </Typography>
              </Box>
              
              <Box sx={{width: "100%"}}>
                <Typography variant="subtitle2">جهة الإصدار:</Typography>
                <Typography variant="body2" gutterBottom>
                  {viewDocument.issuing_authority || 'غير محدد'}
                </Typography>
              </Box>
              
              <Box sx={{width: "100%"}}>
                <Typography variant="subtitle2">الحالة:</Typography>
                <Chip
                  label={viewDocument.license_status || 'غير محدد'}
                  color={getStatusColor(viewDocument.license_status || '') as any}
                  size="small"
                />
              </Box>
              
              {viewDocument.description && (
                <Box sx={{width: "100%"}}>
                  <Typography variant="subtitle2">الوصف:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {viewDocument.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDocument(null)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default CompanyDocuments;
