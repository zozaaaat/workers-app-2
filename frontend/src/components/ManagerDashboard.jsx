import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Building,
  Award
} from 'lucide-react';

const ManagerDashboard = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalWorkers: 0,
    totalCompanies: 0,
    totalLicenses: 0
  });
  const [userActivities, setUserActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadActivityLogs(),
        loadApprovalRequests(),
        loadStatistics(),
        loadUserActivities()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const response = await fetch('/api/permissions/activity-logs/?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setActivityLogs(data);
    } catch (error) {
      console.error('خطأ في تحميل سجلات الأنشطة:', error);
    }
  };

  const loadApprovalRequests = async () => {
    try {
      const response = await fetch('/api/permissions/approval-requests/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setApprovalRequests(data);
    } catch (error) {
      console.error('خطأ في تحميل طلبات الموافقة:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      // تحميل إحصائيات مختلفة
      const [usersRes, workersRes, companiesRes, licensesRes] = await Promise.all([
        fetch('/api/users/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/workers/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/companies/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/licenses/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const [users, workers, companies, licenses] = await Promise.all([
        usersRes.json(),
        workersRes.json(),
        companiesRes.json(),
        licensesRes.json()
      ]);

      setStatistics({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        pendingApprovals: approvalRequests.filter(r => r.status === 'pending').length,
        totalWorkers: workers.length,
        totalCompanies: companies.length,
        totalLicenses: licenses.length
      });
    } catch (error) {
      console.error('خطأ في تحميل الإحصائيات:', error);
    }
  };

  const loadUserActivities = async () => {
    try {
      // معالجة بيانات الأنشطة لإنشاء مخططات
      const activityByDate = {};
      const activityByUser = {};
      
      activityLogs.forEach(log => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        activityByDate[date] = (activityByDate[date] || 0) + 1;
        
        const user = log.user?.username || 'غير معروف';
        activityByUser[user] = (activityByUser[user] || 0) + 1;
      });

      const chartData = Object.entries(activityByDate).map(([date, count]) => ({
        date,
        activities: count
      })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);

      const userActivityData = Object.entries(activityByUser).map(([user, count]) => ({
        user,
        activities: count
      })).sort((a, b) => b.activities - a.activities).slice(0, 5);

      setUserActivities({ chartData, userActivityData });
    } catch (error) {
      console.error('خطأ في معالجة بيانات الأنشطة:', error);
    }
  };

  const handleApprovalAction = async (requestId, action) => {
    try {
      const response = await fetch(`/api/permissions/approval-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: action,
          review_notes: action === 'approved' ? 'تم الموافقة من المدير' : 'تم الرفض من المدير'
        })
      });

      if (response.ok) {
        loadApprovalRequests();
        loadStatistics();
      }
    } catch (error) {
      console.error('خطأ في معالجة طلب الموافقة:', error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'في الانتظار',
      approved: 'مقبول',
      rejected: 'مرفوض'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'create': case 'create_worker': case 'create_company':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'update': case 'update_worker': case 'update_company':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'delete': case 'delete_worker': case 'delete_company':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'login':
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  const pendingRequests = approvalRequests.filter(r => r.status === 'pending');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
        <div className="text-sm text-gray-500">
          آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{statistics.totalUsers}</div>
                <div className="text-sm text-gray-500">إجمالي المستخدمين</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{statistics.activeUsers}</div>
                <div className="text-sm text-gray-500">المستخدمين النشطين</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{statistics.pendingApprovals}</div>
                <div className="text-sm text-gray-500">طلبات معلقة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{statistics.totalWorkers}</div>
                <div className="text-sm text-gray-500">إجمالي العمال</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{statistics.totalCompanies}</div>
                <div className="text-sm text-gray-500">الشركات</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-teal-600" />
              <div>
                <div className="text-2xl font-bold">{statistics.totalLicenses}</div>
                <div className="text-sm text-gray-500">التراخيص</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات طلبات الموافقة */}
      {pendingRequests.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            يوجد {pendingRequests.length} طلب موافقة في انتظار المراجعة
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مخطط الأنشطة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" />
              الأنشطة خلال الأسبوع الماضي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userActivities.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="activities" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* أكثر المستخدمين نشاطاً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" />
              أكثر المستخدمين نشاطاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivities.userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="user" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activities" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* طلبات الموافقة المعلقة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2" />
              طلبات الموافقة المعلقة
            </CardTitle>
            <CardDescription>
              الطلبات التي تحتاج إلى مراجعة وموافقة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {pendingRequests.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  لا توجد طلبات موافقة معلقة
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{request.user?.username}</div>
                        <div className="text-sm text-gray-500">
                          {request.action_type} - {request.entity_type}
                        </div>
                        <div className="text-sm">{request.description}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprovalAction(request.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        موافقة
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprovalAction(request.id, 'rejected')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        رفض
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* آخر الأنشطة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" />
              آخر الأنشطة
            </CardTitle>
            <CardDescription>
              آخر الإجراءات التي تمت في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  {getActionIcon(log.action)}
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {log.user?.username || 'غير معروف'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.description || log.action}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleTimeString('ar-SA')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
