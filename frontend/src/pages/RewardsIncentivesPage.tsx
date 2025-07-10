import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
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
  Alert,
  Tabs,
  Tab,
  Stack,
  Divider,
  Grid,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  EmojiEvents as AwardIcon,
  MonetizationOn as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';

interface Reward {
  id: number;
  worker_id: number;
  worker_name?: string;
  reward_type: string;
  status: string;
  title: string;
  description?: string;
  amount?: number;
  earned_date: string;
  approved_date?: string;
  paid_date?: string;
  performance_score?: number;
  attendance_percentage?: number;
  fiscal_year: number;
  quarter?: number;
  department?: string;
}

interface IncentiveProgram {
  id: number;
  program_name: string;
  program_type: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  target_criteria: string;
  minimum_score?: number;
  maximum_participants?: number;
  monetary_value?: number;
  total_budget?: number;
  spent_budget: number;
  participants_count?: number;
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
      id={`rewards-tabpanel-${index}`}
      aria-labelledby={`rewards-tab-${index}`}
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

const RewardsIncentivesPage: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [programs, setPrograms] = useState<IncentiveProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openRewardDialog, setOpenRewardDialog] = useState(false);
  const [openProgramDialog, setOpenProgramDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<IncentiveProgram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for rewards
  const [rewardFormData, setRewardFormData] = useState({
    worker_id: '',
    reward_type: 'performance_bonus',
    title: '',
    description: '',
    amount: 0,
    earned_date: new Date().toISOString().split('T')[0],
    performance_score: 0,
    attendance_percentage: 0,
    department: '',
    criteria_met: ''
  });

  // Form states for programs
  const [programFormData, setProgramFormData] = useState({
    program_name: '',
    program_type: 'monetary',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    target_criteria: '',
    minimum_score: 0,
    maximum_participants: 50,
    monetary_value: 0,
    total_budget: 0,
    eligibility_criteria: '',
    frequency: 'monthly'
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    reward_type: '',
    fiscal_year: new Date().getFullYear().toString(),
    department: ''
  });

  useEffect(() => {
    fetchRewards();
    fetchPrograms();
  }, [filters]);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockRewards: Reward[] = [
        {
          id: 1,
          worker_id: 1,
          worker_name: 'أحمد محمد',
          reward_type: 'performance_bonus',
          status: 'approved',
          title: 'مكافأة الأداء المتميز',
          description: 'تحقيق أهداف الربع الثالث',
          amount: 2500,
          earned_date: '2024-10-15',
          approved_date: '2024-10-20',
          performance_score: 95,
          attendance_percentage: 98,
          fiscal_year: 2024,
          quarter: 3,
          department: 'التسويق'
        },
        {
          id: 2,
          worker_id: 2,
          worker_name: 'فاطمة العلي',
          reward_type: 'attendance_bonus',
          status: 'proposed',
          title: 'مكافأة الحضور المنتظم',
          description: 'حضور مثالي لمدة 6 أشهر',
          amount: 1500,
          earned_date: '2024-10-01',
          attendance_percentage: 100,
          fiscal_year: 2024,
          quarter: 4,
          department: 'المبيعات'
        }
      ];
      setRewards(mockRewards);
    } catch (error) {
      setError('خطأ في تحميل المكافآت');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      // Mock data for demonstration
      const mockPrograms: IncentiveProgram[] = [
        {
          id: 1,
          program_name: 'برنامج التميز الشهري',
          program_type: 'monetary',
          description: 'مكافآت شهرية للموظفين المتميزين',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          is_active: true,
          target_criteria: 'تحقيق أهداف الأداء الشهرية',
          minimum_score: 85,
          maximum_participants: 10,
          monetary_value: 3000,
          total_budget: 360000,
          spent_budget: 180000,
          participants_count: 45
        },
        {
          id: 2,
          program_name: 'جائزة الابتكار السنوية',
          program_type: 'recognition',
          description: 'تقدير الأفكار الإبداعية والحلول المبتكرة',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          is_active: true,
          target_criteria: 'تقديم حلول مبتكرة تحسن العمل',
          minimum_score: 90,
          maximum_participants: 5,
          monetary_value: 10000,
          total_budget: 50000,
          spent_budget: 20000,
          participants_count: 12
        }
      ];
      setPrograms(mockPrograms);
    } catch (error) {
      setError('خطأ في تحميل البرامج');
    }
  };

  const handleCreateReward = async () => {
    try {
      setSuccess('تم إنشاء المكافأة بنجاح');
      setOpenRewardDialog(false);
      resetRewardForm();
      fetchRewards();
    } catch (error) {
      setError('خطأ في إنشاء المكافأة');
    }
  };

  const handleCreateProgram = async () => {
    try {
      setSuccess('تم إنشاء البرنامج بنجاح');
      setOpenProgramDialog(false);
      resetProgramForm();
      fetchPrograms();
    } catch (error) {
      setError('خطأ في إنشاء البرنامج');
    }
  };

  const handleApproveReward = async (rewardId: number) => {
    try {
      setSuccess('تمت الموافقة على المكافأة');
      fetchRewards();
    } catch (error) {
      setError('خطأ في الموافقة على المكافأة');
    }
  };

  const handleRejectReward = async (rewardId: number) => {
    const reason = window.prompt('سبب الرفض:');
    if (!reason) return;

    try {
      setSuccess('تم رفض المكافأة');
      fetchRewards();
    } catch (error) {
      setError('خطأ في رفض المكافأة');
    }
  };

  const resetRewardForm = () => {
    setRewardFormData({
      worker_id: '',
      reward_type: 'performance_bonus',
      title: '',
      description: '',
      amount: 0,
      earned_date: new Date().toISOString().split('T')[0],
      performance_score: 0,
      attendance_percentage: 0,
      department: '',
      criteria_met: ''
    });
    setSelectedReward(null);
  };

  const resetProgramForm = () => {
    setProgramFormData({
      program_name: '',
      program_type: 'monetary',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      target_criteria: '',
      minimum_score: 0,
      maximum_participants: 50,
      monetary_value: 0,
      total_budget: 0,
      eligibility_criteria: '',
      frequency: 'monthly'
    });
    setSelectedProgram(null);
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'performance_bonus': return 'مكافأة الأداء';
      case 'attendance_bonus': return 'مكافأة الحضور';
      case 'safety_award': return 'جائزة السلامة';
      case 'innovation_award': return 'جائزة الابتكار';
      case 'team_achievement': return 'إنجاز جماعي';
      case 'loyalty_bonus': return 'مكافأة الولاء';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'proposed': return 'مقترح';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      case 'paid': return 'مدفوع';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusColor = (status: string): 'success' | 'primary' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'approved': return 'success';
      case 'paid': return 'primary';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      case 'proposed': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckIcon />;
      case 'paid': return <MoneyIcon />;
      case 'rejected': return <CancelIcon />;
      case 'cancelled': return <CancelIcon />;
      case 'proposed': return <PendingIcon />;
      default: return <PendingIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🏆 إدارة المكافآت والحوافز
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
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="المكافآت" icon={<AwardIcon />} />
          <Tab label="برامج الحوافز" icon={<TrendingUpIcon />} />
          <Tab label="الإحصائيات" icon={<StarIcon />} />
          <Tab label="الموازنة" icon={<MoneyIcon />} />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        {/* Rewards Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>فلترة المكافآت</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                label="الحالة"
              >
                <MenuItem value="">جميع الحالات</MenuItem>
                <MenuItem value="proposed">مقترح</MenuItem>
                <MenuItem value="approved">موافق عليه</MenuItem>
                <MenuItem value="paid">مدفوع</MenuItem>
                <MenuItem value="rejected">مرفوض</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>نوع المكافأة</InputLabel>
              <Select
                value={filters.reward_type}
                onChange={(e) => setFilters({...filters, reward_type: e.target.value})}
                label="نوع المكافأة"
              >
                <MenuItem value="">جميع الأنواع</MenuItem>
                <MenuItem value="performance_bonus">مكافأة الأداء</MenuItem>
                <MenuItem value="attendance_bonus">مكافأة الحضور</MenuItem>
                <MenuItem value="safety_award">جائزة السلامة</MenuItem>
                <MenuItem value="innovation_award">جائزة الابتكار</MenuItem>
              </Select>
            </FormControl>

            <TextField aria-label="input field" label="السنة المالية"
              type="number"
              value={filters.fiscal_year}
              onChange={(e) => setFilters({...filters, fiscal_year: e.target.value})}
              sx={{ minWidth: 120 }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenRewardDialog(true)}
            >
              مكافأة جديدة
            </Button>
          </Stack>
        </Paper>

        {/* Rewards List */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        <Grid container spacing={3}>
          {rewards.map((reward) => (
            <Grid item xs={12} md={6} lg={4} key={reward.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Chip 
                      label={getStatusLabel(reward.status)} 
                      color={getStatusColor(reward.status)}
                      size="small"
                      icon={getStatusIcon(reward.status)}
                    />
                    <Chip 
                      label={getRewardTypeLabel(reward.reward_type)} 
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                  
                  <Typography variant="h6" gutterBottom>
                    {reward.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {reward.worker_name} - {reward.department}
                  </Typography>

                  {reward.amount && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MoneyIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2" fontWeight="bold">
                        {reward.amount.toLocaleString()} ريال
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                    تاريخ الاستحقاق: {new Date(reward.earned_date).toLocaleDateString('ar-SA')}
                  </Typography>

                  {reward.performance_score && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block">
                        نقاط الأداء: {reward.performance_score}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={reward.performance_score}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>

                <Divider />
                
                <CardActions>
                  <Tooltip title="عرض التفاصيل">
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {reward.status === 'proposed' && (
                    <>
                      <Tooltip title="موافقة">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleApproveReward(reward.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="رفض">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRejectReward(reward.id)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  
                  <Tooltip title="تعديل">
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Incentive Programs */}
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h6">برامج الحوافز</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenProgramDialog(true)}
          >
            برنامج جديد
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid item xs={12} md={6} key={program.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Chip 
                      label={program.is_active ? 'نشط' : 'غير نشط'} 
                      color={program.is_active ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip 
                      label={program.program_type === 'monetary' ? 'مالي' : 'غير مالي'} 
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                  
                  <Typography variant="h6" gutterBottom>
                    {program.program_name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {program.description}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="caption">
                        {program.participants_count || 0} مشارك
                      </Typography>
                    </Box>
                    
                    {program.monetary_value && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MoneyIcon sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="caption">
                          {program.monetary_value.toLocaleString()} ريال
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {program.total_budget && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block">
                        الميزانية المستخدمة: {((program.spent_budget / program.total_budget) * 100).toFixed(1)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(program.spent_budget / program.total_budget) * 100}
                        sx={{ mt: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {program.spent_budget.toLocaleString()} / {program.total_budget.toLocaleString()} ريال
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <Divider />
                
                <CardActions>
                  <IconButton size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>إحصائيات المكافآت والحوافز</Typography>
        <Alert severity="info">
          قريباً: عرض إحصائيات شاملة للمكافآت والحوافز
        </Alert>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>إدارة الموازنة</Typography>
        <Alert severity="info">
          قريباً: إدارة موازنة المكافآت والحوافز
        </Alert>
      </TabPanel>

      {/* Create Reward Dialog */}
      <Dialog open={openRewardDialog} onClose={() => setOpenRewardDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>إنشاء مكافأة جديدة</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField aria-label="input field" fullWidth
                  label="رقم الموظف"
                  value={rewardFormData.worker_id}
                  onChange={(e) => setRewardFormData({...rewardFormData, worker_id: e.target.value})}
                  required
                />
                <FormControl fullWidth>
                  <InputLabel>نوع المكافأة</InputLabel>
                  <Select
                    value={rewardFormData.reward_type}
                    onChange={(e) => setRewardFormData({...rewardFormData, reward_type: e.target.value})}
                    label="نوع المكافأة"
                  >
                    <MenuItem value="performance_bonus">مكافأة الأداء</MenuItem>
                    <MenuItem value="attendance_bonus">مكافأة الحضور</MenuItem>
                    <MenuItem value="safety_award">جائزة السلامة</MenuItem>
                    <MenuItem value="innovation_award">جائزة الابتكار</MenuItem>
                    <MenuItem value="team_achievement">إنجاز جماعي</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              
              <TextField aria-label="input field" fullWidth
                label="عنوان المكافأة"
                value={rewardFormData.title}
                onChange={(e) => setRewardFormData({...rewardFormData, title: e.target.value})}
                required
              />
              
              <TextField aria-label="input field" fullWidth
                label="وصف المكافأة"
                value={rewardFormData.description}
                onChange={(e) => setRewardFormData({...rewardFormData, description: e.target.value})}
                multiline
                rows={3}
              />
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField aria-label="input field" fullWidth
                  label="المبلغ (ريال)"
                  type="number"
                  value={rewardFormData.amount}
                  onChange={(e) => setRewardFormData({...rewardFormData, amount: parseFloat(e.target.value)})}
                />
                <TextField aria-label="input field" fullWidth
                  label="تاريخ الاستحقاق"
                  type="date"
                  value={rewardFormData.earned_date}
                  onChange={(e) => setRewardFormData({...rewardFormData, earned_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField aria-label="input field" fullWidth
                  label="نقاط الأداء (%)"
                  type="number"
                  value={rewardFormData.performance_score}
                  onChange={(e) => setRewardFormData({...rewardFormData, performance_score: parseFloat(e.target.value)})}
                  inputProps={{ min: 0, max: 100 }}
                />
                <TextField aria-label="input field" fullWidth
                  label="نسبة الحضور (%)"
                  type="number"
                  value={rewardFormData.attendance_percentage}
                  onChange={(e) => setRewardFormData({...rewardFormData, attendance_percentage: parseFloat(e.target.value)})}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRewardDialog(false)}>إلغاء</Button>
          <Button onClick={handleCreateReward} variant="contained">
            إنشاء المكافأة
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Program Dialog */}
      <Dialog open={openProgramDialog} onClose={() => setOpenProgramDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>إنشاء برنامج حوافز جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField aria-label="input field" fullWidth
                  label="اسم البرنامج"
                  value={programFormData.program_name}
                  onChange={(e) => setProgramFormData({...programFormData, program_name: e.target.value})}
                  required
                />
                <FormControl fullWidth>
                  <InputLabel>نوع البرنامج</InputLabel>
                  <Select
                    value={programFormData.program_type}
                    onChange={(e) => setProgramFormData({...programFormData, program_type: e.target.value})}
                    label="نوع البرنامج"
                  >
                    <MenuItem value="monetary">مالي</MenuItem>
                    <MenuItem value="non_monetary">غير مالي</MenuItem>
                    <MenuItem value="recognition">تقدير</MenuItem>
                    <MenuItem value="training">تدريب</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              
              <TextField aria-label="input field" fullWidth
                label="وصف البرنامج"
                value={programFormData.description}
                onChange={(e) => setProgramFormData({...programFormData, description: e.target.value})}
                multiline
                rows={3}
              />
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField aria-label="input field" fullWidth
                  label="تاريخ البداية"
                  type="date"
                  value={programFormData.start_date}
                  onChange={(e) => setProgramFormData({...programFormData, start_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField aria-label="input field" fullWidth
                  label="تاريخ النهاية"
                  type="date"
                  value={programFormData.end_date}
                  onChange={(e) => setProgramFormData({...programFormData, end_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProgramDialog(false)}>إلغاء</Button>
          <Button onClick={handleCreateProgram} variant="contained">
            إنشاء البرنامج
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RewardsIncentivesPage;
