import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MoneyIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface TrainingCourse {
  id: number;
  title: string;
  description?: string;
  training_type: string;
  status: string;
  duration_hours: number;
  max_participants: number;
  cost_per_participant?: number;
  start_date: string;
  end_date: string;
  location?: string;
  instructor_name?: string;
  enrolled_count?: number;
  completed_count?: number;
  average_rating?: number;
}

interface TrainingSession {
  id: number;
  course_id: number;
  session_number: number;
  title: string;
  start_time: string;
  end_time: string;
  completed: boolean;
  attendance_count?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`training-tabpanel-${index}`}
      aria-labelledby={`training-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TrainingManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    training_type: 'technical',
    duration_hours: 8,
    max_participants: 20,
    cost_per_participant: 0,
    start_date: new Date(),
    end_date: new Date(),
    location: '',
    instructor_name: '',
    instructor_company: '',
    prerequisites: '',
    learning_objectives: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    training_type: '',
    search: ''
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.training_type) queryParams.append('training_type', filters.training_type);
      
      const response = await fetch(`/api/training/courses/?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setError('فشل في تحميل الدورات التدريبية');
      }
    } catch (error) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseSessions = async (courseId: number) => {
    try {
      const response = await fetch(`/api/training/courses/${courseId}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const response = await fetch('/api/training/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('تم إنشاء الدورة التدريبية بنجاح');
        setOpenDialog(false);
        resetForm();
        fetchCourses();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'فشل في إنشاء الدورة التدريبية');
      }
    } catch (error) {
      setError('خطأ في الاتصال بالخادم');
    }
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await fetch(`/api/training/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('تم تحديث الدورة التدريبية بنجاح');
        setOpenDialog(false);
        resetForm();
        fetchCourses();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'فشل في تحديث الدورة التدريبية');
      }
    } catch (error) {
      setError('خطأ في الاتصال بالخادم');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الدورة التدريبية؟')) return;

    try {
      const response = await fetch(`/api/training/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('تم حذف الدورة التدريبية بنجاح');
        fetchCourses();
      } else {
        setError('فشل في حذف الدورة التدريبية');
      }
    } catch (error) {
      setError('خطأ في الاتصال بالخادم');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      training_type: 'technical',
      duration_hours: 8,
      max_participants: 20,
      cost_per_participant: 0,
      start_date: new Date(),
      end_date: new Date(),
      location: '',
      instructor_name: '',
      instructor_company: '',
      prerequisites: '',
      learning_objectives: ''
    });
    setSelectedCourse(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEditDialog = (course: TrainingCourse) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      training_type: course.training_type,
      duration_hours: course.duration_hours,
      max_participants: course.max_participants,
      cost_per_parameter: course.cost_per_participant || 0,
      start_date: new Date(course.start_date),
      end_date: new Date(course.end_date),
      location: course.location || '',
      instructor_name: course.instructor_name || '',
      instructor_company: '',
      prerequisites: '',
      learning_objectives: ''
    });
    setOpenDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      case 'postponed': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'مخطط';
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      case 'postponed': return 'مؤجل';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'technical': return 'تقني';
      case 'soft_skills': return 'مهارات ناعمة';
      case 'safety': return 'السلامة';
      case 'management': return 'إدارة';
      case 'certification': return 'شهادة';
      case 'orientation': return 'تهيئة';
      default: return type;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          🎓 إدارة التدريب والتطوير
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="الدورات التدريبية" icon={<SchoolIcon />} />
            <Tab label="الجلسات" icon={<CalendarIcon />} />
            <Tab label="التقييمات" icon={<AssessmentIcon />} />
            <Tab label="الشهادات" icon={<CheckIcon />} />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>الفلاتر والبحث</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField aria-label="input field" fullWidth
                  label="البحث"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="البحث بالعنوان أو الوصف"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>الحالة</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <MenuItem value="">جميع الحالات</MenuItem>
                    <MenuItem value="planned">مخطط</MenuItem>
                    <MenuItem value="active">نشط</MenuItem>
                    <MenuItem value="completed">مكتمل</MenuItem>
                    <MenuItem value="cancelled">ملغي</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>نوع التدريب</InputLabel>
                  <Select
                    value={filters.training_type}
                    onChange={(e) => setFilters({...filters, training_type: e.target.value})}
                  >
                    <MenuItem value="">جميع الأنواع</MenuItem>
                    <MenuItem value="technical">تقني</MenuItem>
                    <MenuItem value="soft_skills">مهارات ناعمة</MenuItem>
                    <MenuItem value="safety">السلامة</MenuItem>
                    <MenuItem value="management">إدارة</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  دورة جديدة
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Courses Grid */}
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={getStatusLabel(course.status)} 
                        color={getStatusColor(course.status)}
                        size="small"
                      />
                      <Chip 
                        label={getTypeLabel(course.training_type)} 
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {course.description?.substring(0, 100)}...
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="caption">
                        {new Date(course.start_date).toLocaleDateString('ar-SA')} - 
                        {new Date(course.end_date).toLocaleDateString('ar-SA')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="caption">
                        {course.enrolled_count || 0} / {course.max_participants} مشترك
                      </Typography>
                    </Box>

                    {course.cost_per_participant && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <MoneyIcon sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="caption">
                          {course.cost_per_participant} ريال / مشترك
                        </Typography>
                      </Box>
                    )}

                    {course.enrolled_count && course.enrolled_count > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" display="block">
                          نسبة الإكمال: {Math.round((course.completed_count || 0) / course.enrolled_count * 100)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(course.completed_count || 0) / course.enrolled_count * 100}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    )}
                  </CardContent>

                  <CardActions>
                    <Tooltip title="عرض التفاصيل">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedCourse(course);
                          fetchCourseSessions(course.id);
                          setTabValue(1);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="تعديل">
                      <IconButton size="small" onClick={() => openEditDialog(course)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="حذف">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {selectedCourse ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                جلسات دورة: {selectedCourse.title}
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>رقم الجلسة</TableCell>
                      <TableCell>العنوان</TableCell>
                      <TableCell>التاريخ والوقت</TableCell>
                      <TableCell>الحضور</TableCell>
                      <TableCell>الحالة</TableCell>
                      <TableCell>الإجراءات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.session_number}</TableCell>
                        <TableCell>{session.title}</TableCell>
                        <TableCell>
                          {new Date(session.start_time).toLocaleString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={session.attendance_count || 0} color="primary">
                            <PersonIcon />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={session.completed ? 'مكتمل' : 'قادم'} 
                            color={session.completed ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Alert severity="info">
              اختر دورة تدريبية لعرض جلساتها
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>تقييمات التدريب</Typography>
          <Alert severity="info">
            قريباً: عرض تقييمات المتدربين وإحصائيات الفعالية
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>شهادات التدريب</Typography>
          <Alert severity="info">
            قريباً: إدارة الشهادات والتحقق من صحتها
          </Alert>
        </TabPanel>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedCourse ? 'تعديل الدورة التدريبية' : 'إنشاء دورة تدريبية جديدة'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField aria-label="input field" fullWidth
                    label="عنوان الدورة"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>نوع التدريب</InputLabel>
                    <Select
                      value={formData.training_type}
                      onChange={(e) => setFormData({...formData, training_type: e.target.value})}
                    >
                      <MenuItem value="technical">تقني</MenuItem>
                      <MenuItem value="soft_skills">مهارات ناعمة</MenuItem>
                      <MenuItem value="safety">السلامة</MenuItem>
                      <MenuItem value="management">إدارة</MenuItem>
                      <MenuItem value="certification">شهادة</MenuItem>
                      <MenuItem value="orientation">تهيئة</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField aria-label="input field" fullWidth
                    label="وصف الدورة"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField aria-label="input field" fullWidth
                    label="مدة الدورة (ساعات)"
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({...formData, duration_hours: parseInt(e.target.value)})}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField aria-label="input field" fullWidth
                    label="عدد المشاركين الأقصى"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField aria-label="input field" fullWidth
                    label="التكلفة للمشارك (ريال)"
                    type="number"
                    value={formData.cost_per_participant}
                    onChange={(e) => setFormData({...formData, cost_per_participant: parseFloat(e.target.value)})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="تاريخ البداية"
                    value={formData.start_date}
                    onChange={(date) => setFormData({...formData, start_date: date || new Date()})}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="تاريخ النهاية"
                    value={formData.end_date}
                    onChange={(date) => setFormData({...formData, end_date: date || new Date()})}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField aria-label="input field" fullWidth
                    label="الموقع"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField aria-label="input field" fullWidth
                    label="اسم المدرب"
                    value={formData.instructor_name}
                    onChange={(e) => setFormData({...formData, instructor_name: e.target.value})}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>إلغاء</Button>
            <Button 
              onClick={selectedCourse ? handleUpdateCourse : handleCreateCourse}
              variant="contained"
            >
              {selectedCourse ? 'تحديث' : 'إنشاء'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TrainingManagementPage;
