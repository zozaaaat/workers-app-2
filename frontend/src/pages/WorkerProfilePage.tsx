import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Card, CardContent, CircularProgress, Divider, Button, Avatar, Table, TableBody, TableCell, TableRow, FormControl, Select, Checkbox } from "@mui/material";
import { useTranslation } from "react-i18next";
import { API_URL } from "../api";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuItem from '@mui/material/MenuItem';

const WorkerProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [docType, setDocType] = useState('passport');
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`${API_URL}/workers/${id}`)
      .then(res => setWorker(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  // جلب مستندات العامل
  useEffect(() => {
    if (!id) return;
    axios.get(`${API_URL}/worker_documents/by_worker/${id}`)
      .then(res => setDocuments(res.data));
  }, [id, uploading]);

  const showField = (val: any) => val ? val : <span style={{ color: '#aaa' }}>{t('not_available') || 'غير متوفر'}</span>;

  // رفع ملف جديد
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileError("");
    }
  };
  const handleUpload = async () => {
    if (!file) { setFileError("يرجى اختيار ملف"); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("worker_id", id!);
    formData.append("file", file);
    formData.append("doc_type", docType);
    try {
      await axios.post(`${API_URL}/worker_documents/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null);
      setFileError("");
    } catch {
      setFileError("فشل رفع الملف");
    }
    setUploading(false);
  };
  const handleDeleteDoc = async (docId: number) => {
    await axios.delete(`${API_URL}/worker_documents/${docId}`);
    setDocuments(docs => docs.filter(d => d.id !== docId));
  };
  const handleDownload = (filepath: string) => {
    window.open(`${API_URL}/static/${filepath}`, '_blank');
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress /></Box>;
  if (!worker) return <Typography color="error">{t("worker_not_found")}</Typography>;

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: '#1976d2', fontSize: 32 }}>{worker.name?.[0] || '?'}</Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {worker.custom_id ? `${worker.custom_id} - ${worker.name}` : worker.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">{t("worker_id")}: <b style={{ color: '#1976d2', fontSize: 18 }}>{worker.custom_id || worker.id}</b></Typography>
        </Box>
      </Box>
      <Card>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>{t("civil_id")}</TableCell>
                <TableCell>{showField(worker.civil_id)}</TableCell>
                <TableCell>{t("nationality")}</TableCell>
                <TableCell>{showField(worker.nationality)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("job_title")}</TableCell>
                <TableCell>{showField(worker.job_title)}</TableCell>
                <TableCell>{t("worker_type")}</TableCell>
                <TableCell>{showField(worker.worker_type)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("salary")}</TableCell>
                <TableCell>{showField(worker.salary)}</TableCell>
                <TableCell>{t("work_permit_start")}</TableCell>
                <TableCell>{showField(worker.work_permit_start)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("work_permit_end")}</TableCell>
                <TableCell>{showField(worker.work_permit_end)}</TableCell>
                <TableCell>{t("company")}</TableCell>
                <TableCell>{showField(worker.company?.file_name || worker.company_id)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("license")}</TableCell>
                <TableCell>{showField(worker.license?.name || worker.license_id)}</TableCell>
                <TableCell>{t("passport_end")}</TableCell>
                <TableCell>{showField(worker.passport_end)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Divider sx={{ my: 2 }} />
          {/* رفع مستندات */}
          <Box mb={2}>
            <Typography variant="h6" mb={1}>{t('worker_documents') || 'مستندات العامل'}</Typography>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value={docType} onChange={e => setDocType(e.target.value)} displayEmpty>
                  <MenuItem value="passport">جواز سفر</MenuItem>
                  <MenuItem value="work_permit">إذن عمل</MenuItem>
                  <MenuItem value="civil_id">بطاقة مدنية</MenuItem>
                  <MenuItem value="other">أخرى</MenuItem>
                </Select>
              </FormControl>
              <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} disabled={uploading}>
                {t('upload_document') || 'رفع مستند'}
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
              {file && <Typography>{file.name}</Typography>}
              <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploading || !file}>{t('upload') || 'رفع'}</Button>
              {fileError && <Typography color="error">{fileError}</Typography>}
            </Box>
          </Box>
          {/* قائمة المستندات */}
          <Box>
            {documents.length === 0 ? (
              <Typography color="textSecondary">{t('no_documents') || 'لا يوجد مستندات'}</Typography>
            ) : (
              <Table>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedDocs.includes(doc.id)} onChange={e => {
                          if (e.target.checked) setSelectedDocs(prev => [...prev, doc.id]);
                          else setSelectedDocs(prev => prev.filter(id => id !== doc.id));
                        }} />
                      </TableCell>
                      <TableCell>{doc.filename}</TableCell>
                      <TableCell>{doc.doc_type === 'passport' ? 'جواز سفر' : doc.doc_type === 'work_permit' ? 'إذن عمل' : doc.doc_type === 'civil_id' ? 'بطاقة مدنية' : 'أخرى'}</TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(doc.filepath)}>{t('download') || 'تنزيل'}</Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteDoc(doc.id)}>{t('delete') || 'حذف'}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* زر تنزيل جماعي */}
            {selectedDocs.length > 0 && (
              <Button variant="contained" color="primary" startIcon={<DownloadIcon />} sx={{ mt: 1 }} onClick={() => {
                documents.filter(doc => selectedDocs.includes(doc.id)).forEach(doc => handleDownload(doc.filepath));
              }}>
                {t('download_selected') || 'تنزيل المحدد'}
              </Button>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" gap={2}>
            <Button variant="outlined" href="/workers">{t("back_to_workers")}</Button>
            <Button variant="contained" color="primary" onClick={() => window.print()}>{t("print") || 'طباعة'}</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WorkerProfilePage;
