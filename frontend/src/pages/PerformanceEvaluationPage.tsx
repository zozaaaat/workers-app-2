/**
 * Performance Evaluation Management Page - صفحة إدارة تقييم الأداء
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface PerformanceEvaluation {
  id: number;
  worker_id: number;
  worker_name?: string;
  evaluator_id: number;
  evaluation_period: string;
  period_start: string;
  period_end: string;
  overall_score: number;
  overall_rating: string;
  status: string;
  created_at: string;
  completed_at?: string;
  criteria_scores: EvaluationCriteria[];
}

interface EvaluationCriteria {
  id: number;
  criteria_name: string;
  criteria_description: string;
  weight: number;
  score: number;
  max_score: number;
  weighted_score: number;
  comments?: string;
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
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PerformanceEvaluationPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PerformanceEvaluation | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<any>(null);

  // Sample data - سيتم استبدالها بـ API calls
  const sampleEvaluations: PerformanceEvaluation[] = [
    {
      id: 1,
      worker_id: 1,
      worker_name: "أحمد محمد",
      evaluator_id: 1,
      evaluation_period: "ربع سنوي",
      period_start: "2025-01-01",
      period_end: "2025-03-31",
      overall_score: 85.5,
      overall_rating: "جيد جداً",
      status: "مكتمل",
      created_at: "2025-07-01",
      completed_at: "2025-07-10",
      criteria_scores: [
        {
          id: 1,
          criteria_name: "جودة العمل",
          criteria_description: "مستوى جودة الأعمال المنجزة",
          weight: 2.0,
          score: 4.5,
          max_score: 5.0,
          weighted_score: 9.0,
          comments: "أداء ممتاز في جودة العمل"
        },
        {
          id: 2,
          criteria_name: "الالتزام بالوقت",
          criteria_description: "الحضور والانضباط",
          weight: 1.5,
          score: 4.0,
          max_score: 5.0,
          weighted_score: 6.0,
          comments: "التزام جيد بالمواعيد"
        }
      ]
    },
    {
      id: 2,
      worker_id: 2,
      worker_name: "فاطمة أحمد",
      evaluator_id: 1,
      evaluation_period: "ربع سنوي",
      period_start: "2025-01-01",
      period_end: "2025-03-31",
      overall_score: 92.0,
      overall_rating: "ممتاز",
      status: "معتمد",
      created_at: "2025-07-01",
      completed_at: "2025-07-08",
      criteria_scores: []
    }
  ];

  useEffect(() => {
    fetchEvaluations();
    fetchPerformanceSummary();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      // TODO: استبدال بـ API call حقيقي
      setTimeout(() => {
        setEvaluations(sampleEvaluations);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      setLoading(false);
    }
  };

  const fetchPerformanceSummary = async () => {
    try {
      // TODO: API call للحصول على ملخص الأداء
      setPerformanceSummary({
        total_evaluations: 24,
        completed_evaluations: 18,
        pending_evaluations: 6,
        average_score: 78.5
      });
    } catch (error) {
      console.error('Error fetching performance summary:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتمل': return 'success';
      case 'معتمد': return 'primary';
      case 'قيد التقييم': return 'warning';
      case 'مسودة': return 'default';
      default: return 'default';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'ممتاز': return <StarIcon sx={{ color: '#FFD700' }} />;
      case 'جيد جداً': return <TrendingUpIcon sx={{ color: '#4CAF50' }} />;
      case 'جيد': return <CheckCircleIcon sx={{ color: '#2196F3' }} />;
      default: return <AssessmentIcon sx={{ color: '#757575' }} />;
    }
  };

  const handleCreateEvaluation = () => {
    setSelectedEvaluation(null);
    setOpenDialog(true);
  };

  const handleEditEvaluation = (evaluation: PerformanceEvaluation) => {
    setSelectedEvaluation(evaluation);
    setOpenDialog(true);
  };

  const handleViewEvaluation = (evaluation: PerformanceEvaluation) => {
    setSelectedEvaluation(evaluation);
    // فتح modal للعرض التفصيلي
  };

  // Summary Cards Component
  const SummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              إجمالي التقييمات
            </Typography>
            <Typography variant="h4">
              {performanceSummary?.total_evaluations || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              التقييمات المكتملة
            </Typography>
            <Typography variant="h4" color="success.main">
              {performanceSummary?.completed_evaluations || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              التقييمات المعلقة
            </Typography>
            <Typography variant="h4" color="warning.main">
              {performanceSummary?.pending_evaluations || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              متوسط الدرجات
            </Typography>
            <Typography variant="h4" color="primary.main">
              {performanceSummary?.average_score || 0}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Evaluations List Component
  const EvaluationsList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>العامل</TableCell>
            <TableCell>فترة التقييم</TableCell>
            <TableCell>النتيجة الإجمالية</TableCell>
            <TableCell>التقدير</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>تاريخ الإكمال</TableCell>
            <TableCell>الإجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {evaluations.map((evaluation) => (
            <TableRow key={evaluation.id}>
              <TableCell>{evaluation.worker_name}</TableCell>
              <TableCell>{evaluation.evaluation_period}</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {evaluation.overall_score}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={evaluation.overall_score}
                    sx={{ width: 60, height: 8 }}
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  {getRatingIcon(evaluation.overall_rating)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {evaluation.overall_rating}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={evaluation.status}
                  color={getStatusColor(evaluation.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {evaluation.completed_at 
                  ? new Date(evaluation.completed_at).toLocaleDateString('ar-SA')
                  : '-'
                }
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={() => handleViewEvaluation(evaluation)}
                  title="عرض"
                >
                  <ViewIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleEditEvaluation(evaluation)}
                  title="تعديل"
                >
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Create/Edit Dialog Component
  const EvaluationDialog = () => (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedEvaluation ? 'تعديل التقييم' : 'إنشاء تقييم جديد'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>العامل</InputLabel>
              <Select
                value=""
                label="العامل"
              >
                <MenuItem value={1}>أحمد محمد</MenuItem>
                <MenuItem value={2}>فاطمة أحمد</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>فترة التقييم</InputLabel>
              <Select
                value=""
                label="فترة التقييم"
              >
                <MenuItem value="ربع سنوي">ربع سنوي</MenuItem>
                <MenuItem value="نصف سنوي">نصف سنوي</MenuItem>
                <MenuItem value="سنوي">سنوي</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField aria-label="input field" fullWidth
              label="بداية الفترة"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField aria-label="input field" fullWidth
              label="نهاية الفترة"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          {/* معايير التقييم */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              معايير التقييم
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  جودة العمل
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  مستوى جودة الأعمال المنجزة
                </Typography>
                <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                  <Typography component="legend" sx={{ mr: 2 }}>التقييم:</Typography>
                  <Rating
                    name="quality-rating"
                    value={4}
                    precision={0.5}
                    max={5}
                  />
                  <Typography sx={{ ml: 2 }}>4.0 / 5.0</Typography>
                </Box>
                <TextField aria-label="input field" fullWidth
                  multiline
                  rows={2}
                  label="التعليقات"
                  sx={{ mt: 2 }}
                  placeholder="أضف تعليقاتك حول هذا المعيار..."
                />
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  الالتزام بالوقت
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  الحضور والانضباط في مواعيد العمل
                </Typography>
                <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                  <Typography component="legend" sx={{ mr: 2 }}>التقييم:</Typography>
                  <Rating
                    name="punctuality-rating"
                    value={4.5}
                    precision={0.5}
                    max={5}
                  />
                  <Typography sx={{ ml: 2 }}>4.5 / 5.0</Typography>
                </Box>
                <TextField aria-label="input field" fullWidth
                  multiline
                  rows={2}
                  label="التعليقات"
                  sx={{ mt: 2 }}
                  placeholder="أضف تعليقاتك حول هذا المعيار..."
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <TextField aria-label="input field" fullWidth
              multiline
              rows={3}
              label="التعليقات العامة"
              placeholder="أضف تعليقاتك العامة على أداء العامل..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>إلغاء</Button>
        <Button variant="contained" color="primary">
          {selectedEvaluation ? 'تحديث' : 'إنشاء'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          📊 نظام تقييم الأداء
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateEvaluation}
        >
          إنشاء تقييم جديد
        </Button>
      </Box>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="قائمة التقييمات" />
            <Tab label="التقارير والإحصائيات" />
            <Tab label="قوالب التقييم" />
            <Tab label="خطط التطوير" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <LinearProgress sx={{ width: '100%' }} />
            </Box>
          ) : (
            <EvaluationsList />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            تقارير الأداء والإحصائيات
          </Typography>
          <Alert severity="info">
            سيتم إضافة المزيد من التقارير والرسوم البيانية قريباً
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            قوالب التقييم
          </Typography>
          <Alert severity="info">
            سيتم إضافة قوالب التقييم المعيارية قريباً
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            خطط تطوير الأداء
          </Typography>
          <Alert severity="info">
            سيتم إضافة إدارة خطط التطوير قريباً
          </Alert>
        </TabPanel>
      </Paper>

      {/* Dialog */}
      <EvaluationDialog />
    </Box>
  );
};

export default PerformanceEvaluationPage;
