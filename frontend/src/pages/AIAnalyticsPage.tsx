import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WarningIcon from '@mui/icons-material/Warning';

interface AIAnalysis {
  performancePrediction: {
    nextMonth: number;
    confidence: number;
    factors: string[];
  };
  anomalies: {
    detected: number;
    details: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
  recommendations: string[];
}

const AIAnalyticsPage: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'ai';
    message: string;
    timestamp: string;
  }>>([]);

  const fetchAIAnalysis = async () => {
    setLoading(true);
    try {
      // Mock AI analysis data
      const mockData: AIAnalysis = {
        performancePrediction: {
          nextMonth: 87,
          confidence: 92,
          factors: ['زيادة الإنتاجية', 'تحسن الحضور', 'انخفاض المخالفات'],
        },
        anomalies: {
          detected: 3,
          details: [
            {
              type: 'حضور غير منتظم',
              severity: 'medium',
              description: 'ملاحظة انخفاض في معدل الحضور لدى 5 عمال',
            },
            {
              type: 'زيادة في الإجازات',
              severity: 'low',
              description: 'زيادة طفيفة في طلبات الإجازات هذا الشهر',
            },
            {
              type: 'أداء متميز',
              severity: 'low',
              description: 'ملاحظة تحسن ملحوظ في أداء فريق القسم الثاني',
            },
          ],
        },
        recommendations: [
          'تنظيم برنامج تدريبي لتحسين مهارات العمال',
          'مراجعة نظام الحوافز لزيادة الدافعية',
          'تطبيق نظام متابعة أفضل للحضور والانصراف',
          'تحسين بيئة العمل لزيادة الرضا الوظيفي',
        ],
      };
      
      setAiAnalysis(mockData);
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  const handleChatSend = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      type: 'user' as const,
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    // Mock AI response
    setTimeout(() => {
      const aiResponse = {
        type: 'ai' as const,
        message: getAIResponse(chatMessage),
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (message: string): string => {
    if (message.includes('أداء') || message.includes('performance')) {
      return 'بناءً على تحليل البيانات، الأداء العام يظهر اتجاهاً إيجابياً بنسبة 15% مقارنة بالشهر الماضي. أنصح بالتركيز على تحسين معدل الحضور.';
    }
    if (message.includes('توقع') || message.includes('predict')) {
      return 'التوقعات تشير إلى تحسن مستمر في الأداء خلال الأشهر القادمة، مع احتمالية وصول الكفاءة إلى 90% بحلول نهاية الربع.';
    }
    if (message.includes('مشكل') || message.includes('problem')) {
      return 'تم رصد بعض التحديات في الحضور والانصراف. أنصح بمراجعة نظام المواعيد وتطبيق حوافز للالتزام بالمواعيد.';
    }
    return 'شكراً لسؤالك. يمكنني مساعدتك في تحليل البيانات وتقديم التوصيات لتحسين إدارة العمال. ما الذي تريد معرفته تحديداً؟';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        لوحة الذكاء الاصطناعي
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* توقعات الأداء */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              توقعات الأداء
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : aiAnalysis ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="primary">
                      {aiAnalysis.performancePrediction.nextMonth}%
                    </Typography>
                    <Typography color="textSecondary">
                      توقع الأداء الشهر القادم
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h3" color="success.main">
                      {aiAnalysis.performancePrediction.confidence}%
                    </Typography>
                    <Typography color="textSecondary">
                      دقة التوقع
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  العوامل المؤثرة:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {aiAnalysis.performancePrediction.factors.map((factor, index) => (
                    <Chip key={index} label={factor} color="primary" size="small" />
                  ))}
                </Box>
              </Box>
            ) : null}
          </CardContent>
        </Card>

        {/* كشف الشذوذ */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              كشف الشذوذ والتحليلات
            </Typography>
            
            {aiAnalysis && (
              <Box>
                <Typography variant="h4" color="warning.main" gutterBottom>
                  {aiAnalysis.anomalies.detected} ملاحظة مكتشفة
                </Typography>
                
                <List>
                  {aiAnalysis.anomalies.details.map((anomaly, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <span>{anomaly.type}</span>
                              <Chip
                                label={anomaly.severity}
                                color={getSeverityColor(anomaly.severity) as any}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={anomaly.description}
                        />
                      </ListItem>
                      {index < aiAnalysis.anomalies.details.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* التوصيات */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              توصيات الذكاء الاصطناعي
            </Typography>
            
            {aiAnalysis && (
              <List>
                {aiAnalysis.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${index + 1}. ${recommendation}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* محادثة مع الذكاء الاصطناعي */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              محادثة مع مساعد الذكاء الاصطناعي
            </Typography>
            
            <Box sx={{ height: 300, overflowY: 'auto', mb: 2, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
              {chatHistory.length === 0 ? (
                <Typography color="textSecondary" textAlign="center">
                  ابدأ محادثة بطرح سؤال حول إدارة العمال...
                </Typography>
              ) : (
                chatHistory.map((chat, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: chat.type === 'user' ? '#e3f2fd' : '#f5f5f5',
                      textAlign: chat.type === 'user' ? 'right' : 'left',
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {chat.type === 'user' ? 'أنت' : 'الذكاء الاصطناعي'} - {chat.timestamp}
                    </Typography>
                    <Typography>{chat.message}</Typography>
                  </Box>
                ))
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField aria-label="input field" fullWidth
                placeholder="اكتب سؤالك هنا..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
              />
              <Button variant="contained" onClick={handleChatSend}>
                إرسال
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AIAnalyticsPage;
