import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { API_URL } from '../api';

interface AnalyticsData {
  totalWorkers: number;
  totalCompanies: number;
  totalViolations: number;
  monthlyGrowth: number;
  performanceMetrics: {
    productivity: number;
    satisfaction: number;
    efficiency: number;
  };
}

const AnalyticsDashboardPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${API_URL}/analytics/dashboard/public`);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        } else {
          throw new Error('Failed to fetch analytics data');
        }
      } catch (err) {
        setError('فشل في تحميل بيانات التحليلات');
        // Mock data for demo
        setAnalyticsData({
          totalWorkers: 250,
          totalCompanies: 45,
          totalViolations: 12,
          monthlyGrowth: 15.5,
          performanceMetrics: {
            productivity: 85,
            satisfaction: 78,
            efficiency: 92,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        {error} - عرض بيانات تجريبية
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        لوحة التحليلات المتقدمة
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* إحصائيات عامة */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي العمال
                </Typography>
                <Typography variant="h4">
                  {analyticsData?.totalWorkers}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي الشركات
                </Typography>
                <Typography variant="h4">
                  {analyticsData?.totalCompanies}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  المخالفات
                </Typography>
                <Typography variant="h4" color="error">
                  {analyticsData?.totalViolations}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  النمو الشهري
                </Typography>
                <Typography variant="h4" color="success.main">
                  +{analyticsData?.monthlyGrowth}%
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* مقاييس الأداء */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              مقاييس الأداء
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center', flex: '1 1 150px' }}>
                <Typography variant="h3" color="primary">
                  {analyticsData?.performanceMetrics?.productivity || 0}%
                </Typography>
                <Typography color="textSecondary">
                  الإنتاجية
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: '1 1 150px' }}>
                <Typography variant="h3" color="warning.main">
                  {analyticsData?.performanceMetrics?.satisfaction || 0}%
                </Typography>
                <Typography color="textSecondary">
                  الرضا الوظيفي
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: '1 1 150px' }}>
                <Typography variant="h3" color="success.main">
                  {analyticsData?.performanceMetrics?.efficiency || 0}%
                </Typography>
                <Typography color="textSecondary">
                  الكفاءة
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AnalyticsDashboardPage;
