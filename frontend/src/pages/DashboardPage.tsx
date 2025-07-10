import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, CircularProgress, Snackbar, Alert, Badge, InputBase, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput } from "@mui/material";
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axios from "axios";
import { API_URL } from "../api";
import { useTranslation } from "react-i18next";
import { fetchNotifications, deleteNotification, addNotification, fetchGroupedNotifications, archiveNotification, fetchNotificationsFiltered, updateNotificationAction } from "../api_notifications";
import type { NotificationType } from "../api_notifications";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import * as XLSX from "xlsx";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import { useAuth } from "../context/AuthContext";
import notificationSound from '../assets/notification.mp3';
import importantSound from '../assets/important.mp3';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'info' });
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSearch, setNotifSearch] = useState("");
  const [readNotifs, setReadNotifs] = useState<number[]>([]);
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const [notifType, setNotifType] = useState("general");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifDate, setNotifDate] = useState("");
  const [notifTargets, setNotifTargets] = useState<string[]>([]);
  const [notifTargetType, setNotifTargetType] = useState("workers");
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<any[]>([]);
  const [notifArchived, setNotifArchived] = useState(false);
  const [notifDateFilter, setNotifDateFilter] = useState('all');
  const [notifCustomStart, setNotifCustomStart] = useState("");
  const [notifCustomEnd, setNotifCustomEnd] = useState("");
  const [importantNotif, setImportantNotif] = useState<any>(null);
  const [notifFile, setNotifFile] = useState<File | null>(null);
  const [notifSchedule, setNotifSchedule] = useState<string>("");
  // إضافة متغيرات الحالة الجديدة
  const [notifIcon, setNotifIcon] = useState<string>("");
  const [notifColor, setNotifColor] = useState<string>("");
  const [notifEmoji, setNotifEmoji] = useState<string>("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [workers, companies, absences, leaves] = await Promise.all([
          axios.get(`${API_URL}/workers/public`),
          axios.get(`${API_URL}/companies`),
          axios.get(`${API_URL}/absences`),
          axios.get(`${API_URL}/leaves`),
        ]);
        setStats({
          workers: workers.data.length,
          companies: companies.data.length,
          absences: absences.data.length,
          leaves: leaves.data.length,
        });
      } catch {
        setStats(null);
        setSnackbar({ open: true, message: 'تعذر تحميل البيانات من الخادم', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    setNotifLoading(true);
    fetchNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, []);

  useEffect(() => {
    setNotifLoading(true);
    fetchGroupedNotifications()
      .then(setGroupedNotifications)
      .catch(() => setGroupedNotifications([]))
      .finally(() => setNotifLoading(false));
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/workers/public`).then(res => setAllWorkers(res.data));
    axios.get(`${API_URL}/companies`).then(res => setAllCompanies(res.data));
  }, []);

  useEffect(() => {
    setNotifLoading(true);
    fetchNotificationsFiltered({ archived: notifArchived, user_role: user?.role })
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, [notifArchived, user]);

  const handleDeleteNotif = async (id: number) => {
    await deleteNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleSendNotif = async () => {
    // إرسال إشعار لكل مستهدف
    for (const target of notifTargets) {
      let message = notifMessage;
      let allowed_roles = "";
      if (notifTargetType === "workers") {
        const worker = allWorkers.find(w => w.id == target);
        if (worker) message = `(${worker.name}) ${notifMessage}`;
        allowed_roles = "employee,manager,admin";
      } else if (notifTargetType === "companies") {
        const company = allCompanies.find(c => c.id == target);
        if (company) message = `(${company.file_name || company.name}) ${notifMessage}`;
        allowed_roles = "manager,admin";
      }
      if (notifFile || notifSchedule || notifIcon || notifColor || notifEmoji) {
        const formData = new FormData();
        if (notifFile) formData.append("file", notifFile);
        const notifObj: any = { message, type: notifType, allowed_roles };
        if (notifSchedule) notifObj.scheduled_at = notifSchedule;
        if (notifIcon) notifObj.icon = notifIcon;
        if (notifColor) notifObj.color = notifColor;
        if (notifEmoji) notifObj.emoji = notifEmoji;
        formData.append("notification", new Blob([JSON.stringify(notifObj)], { type: 'application/json' }));
        await axios.post(`${API_URL}/notifications/with-attachment`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await addNotification(message, notifType, allowed_roles, notifIcon, notifColor, notifEmoji);
      }
    }
    setNotifDialogOpen(false);
    setNotifMessage("");
    setNotifTargets([]);
    setNotifFile(null);
    setNotifSchedule("");
    setNotifIcon("");
    setNotifColor("");
    setNotifEmoji("");
    setSnackbar({ open: true, message: 'تم إرسال الإشعار بنجاح', severity: 'success' });
  };

  const handleArchiveNotif = async (id: number) => {
    await archiveNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleFilterNotifs = async () => {
    let start_date = undefined, end_date = undefined;
    const today = new Date();
    if (notifDateFilter === 'today') {
      start_date = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      end_date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    } else if (notifDateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      start_date = weekAgo.toISOString();
      end_date = today.toISOString();
    } else if (notifDateFilter === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      start_date = monthAgo.toISOString();
      end_date = today.toISOString();
    } else if (notifDateFilter === 'custom') {
      if (notifCustomStart) start_date = notifCustomStart;
      if (notifCustomEnd) end_date = notifCustomEnd;
    }
    setNotifLoading(true);
    fetchNotificationsFiltered({ archived: notifArchived, start_date, end_date })
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  };

  const barData = {
    labels: [t('workers'), t('companies'), t('absences'), t('leaves')],
    datasets: [
      {
        label: t('total') || 'الإجمالي',
        data: stats ? [stats.workers, stats.companies, stats.absences, stats.leaves] : [0,0,0,0],
        backgroundColor: ['#7b2ff2', '#43a047', '#fbc02d', '#e53935'],
      },
    ],
  };
  const pieData = {
    labels: ['عمال', 'شركات'],
    datasets: [
      {
        data: stats ? [stats.workers, stats.companies] : [0,0],
        backgroundColor: ['#7b2ff2', '#43a047'],
        borderWidth: 1,
      },
    ],
  };

  const unreadCount = notifications.filter(n => !n.read && !readNotifs.includes(n.id)).length;
  const filteredNotifs = notifications.filter(n =>
    (notifSearch === "" || n.message.toLowerCase().includes(notifSearch.toLowerCase()))
  );
  const handleMarkRead = (id: number) => {
    setReadNotifs([...readNotifs, id]);
  };
  const handleExportExcel = () => {
    const exportData = filteredNotifs.map(n => ({
      الرسالة: n.message,
      النوع: n.type,
      "تاريخ الإنشاء": n.created_at,
      "تاريخ الانتهاء": n.expires_at || "-"
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الإشعارات");
    XLSX.writeFile(wb, "notifications.xlsx");
  };
  const handleMarkAllRead = () => {
    setReadNotifs([...readNotifs, ...filteredNotifs.filter(n => !n.read && !readNotifs.includes(n.id)).map(n => n.id)]);
  };
  const getNotifIcon = (type?: string) => {
    if (type === "passport") return <AssignmentIndIcon sx={{ color: '#1976d2', mr: 1 }} />;
    if (type === "permit") return <DescriptionIcon sx={{ color: '#fbc02d', mr: 1 }} />;
    return <InfoIcon sx={{ color: '#757575', mr: 1 }} />;
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isUnmounted = false;
    try {
      ws = new WebSocket('ws://localhost:8000/ws/notifications');
      ws.onopen = () => {
        if (!isUnmounted) {
          console.log('WebSocket connected');
        }
      };
      ws.onerror = (err) => {
        if (!isUnmounted) {
          console.error('WebSocket error:', err);
        }
      };
      ws.onclose = (event) => {
        if (!isUnmounted) {
          console.warn('WebSocket closed:', event);
        }
      };
      ws.onmessage = (event) => {
        try {
          const notif = JSON.parse(event.data);
          setNotifications(prev => [notif, ...prev]);
          if (notif.type === 'permit' || notif.type === 'passport' || notif.priority === 'high') {
            setImportantNotif(notif);
            const audio = new Audio(importantSound);
            audio.play();
          } else {
            const audio = new Audio(notificationSound);
            audio.play();
          }
        } catch (e) { /* تجاهل */ }
      };
    } catch (e) {
      console.error('WebSocket connection failed:', e);
    }
    return () => {
      isUnmounted = true;
      if (ws) ws.close();
    };
  }, []);

  const handleAction = async (notif: NotificationType, action: string) => {
    await updateNotificationAction(notif.id, action);
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, action_status: action } : n));
  };

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="#7b2ff2" sx={{ letterSpacing: 1, animation: 'fadeInDown 1s' }}>{t('dashboard')}</Typography>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>{t('dashboard')}</Typography>
        <Box>
          <input type="text" placeholder={t('search_in_system')} style={{
            padding: '10px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', minWidth: 220
          }} />
        </Box>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
      ) : stats ? (
        <>
          <Box display="flex" gap={3} flexWrap="wrap" mb={4}>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card sx={{ background: '#7b2ff2', color: '#fff', animation: 'fadeIn 0.5s' }}>
                <CardContent>
                  <Typography variant="h6">{t('number_of_workers')}</Typography>
                  <Typography variant="h3" fontWeight={700}>{stats.workers}</Typography>
                </CardContent>
              </Card>
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card sx={{ background: '#43a047', color: '#fff', animation: 'fadeIn 0.5s' }}>
                <CardContent>
                  <Typography variant="h6">{t('number_of_companies')}</Typography>
                  <Typography variant="h3" fontWeight={700}>{stats.companies}</Typography>
                </CardContent>
              </Card>
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card sx={{ background: '#fbc02d', color: '#fff', animation: 'fadeIn 0.5s' }}>
                <CardContent>
                  <Typography variant="h6">{t('absences_today')}</Typography>
                  <Typography variant="h3" fontWeight={700}>{stats.absences}</Typography>
                </CardContent>
              </Card>
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card sx={{ background: '#e53935', color: '#fff', animation: 'fadeIn 0.5s' }}>
                <CardContent>
                  <Typography variant="h6">{t('current_leaves')}</Typography>
                  <Typography variant="h3" fontWeight={700}>{stats.leaves}</Typography>
                </CardContent>
              </Card>
            </div>
          </Box>
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box flex={1} minWidth={350} height={300}>
              <Typography variant="h6" mb={2}>{t('general_statistics')}</Typography>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' as const } } }} />
            </Box>
            <Box flex={1} minWidth={350} height={300}>
              <Typography variant="h6" mb={2}>{t('workers_to_companies_ratio')}</Typography>
              <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' as const } } }} />
            </Box>
          </Box>
        </>
      ) : (
        <Typography color="error">{t('data_load_error')}</Typography>
      )}
      <Box mt={4}>
        <Card sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6">{t('notifications')}
              <Badge color="error" badgeContent={unreadCount} sx={{ ml: 1 }} />
            </Typography>
            <Box>
              <IconButton onClick={...} aria-label="button" title="إشعار جديد"><AddAlertIcon /></IconButton>
              <IconButton onClick={...} aria-label="button" title="تصدير Excel"><DownloadIcon /></IconButton>
              <IconButton onClick={...} aria-label="button" title="تحديد الكل كمقروء"><DoneAllIcon /></IconButton>
            </Box>
          </Box>
          <Paper sx={{ mb: 2, p: 0.5, display: 'flex', alignItems: 'center', width: 250 }}>
            <SearchIcon sx={{ mr: 1 }} />
            <InputBase
              placeholder={t('search')}
              value={notifSearch}
              onChange={e => setNotifSearch(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Paper>
          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <FormControl size="small">
              <InputLabel>الحالة</InputLabel>
              <Select value={notifArchived ? 'archived' : 'active'} label="الحالة" onChange={e => { setNotifArchived(e.target.value === 'archived'); }}>
                <MenuItem value="active">غير مؤرشفة</MenuItem>
                <MenuItem value="archived">مؤرشفة</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>الفترة</InputLabel>
              <Select value={notifDateFilter} label="الفترة" onChange={e => setNotifDateFilter(e.target.value)}>
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="today">اليوم</MenuItem>
                <MenuItem value="week">الأسبوع</MenuItem>
                <MenuItem value="month">الشهر</MenuItem>
                <MenuItem value="custom">مخصص</MenuItem>
              </Select>
            </FormControl>
            {notifDateFilter === 'custom' && (
              <>
                <TextField aria-label="input field" size="small" type="date" value={notifCustomStart} onChange={e => setNotifCustomStart(e.target.value)} label="من" InputLabelProps={{ shrink: true }} />
                <TextField aria-label="input field" size="small" type="date" value={notifCustomEnd} onChange={e => setNotifCustomEnd(e.target.value)} label="إلى" InputLabelProps={{ shrink: true }} />
              </>
            )}
            <Button variant="outlined" size="small" onClick={handleFilterNotifs}>تصفية</Button>
          </Box>
          {notifLoading ? (
            <Typography>{t('loading')}</Typography>
          ) : filteredNotifs.length === 0 ? (
            <Typography variant="body2">{t('no_new_notifications')}</Typography>
          ) : (
            filteredNotifs.map(n => (
              <Box key={n.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box role="button" display="flex" alignItems="center" sx={{ flex: 1, cursor: 'pointer' }} onClick={...}>
                  {/* عرض الرمز/الإيموجي/اللون المخصص */}
                  {n.emoji && <span style={{ fontSize: 22, marginRight: 6 }}>{n.emoji}</span>}
                  {n.icon && n.icon === 'info' && <InfoIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                  {n.icon && n.icon === 'assignment' && <AssignmentIndIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                  {n.icon && n.icon === 'description' && <DescriptionIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                  {n.icon && n.icon === 'alert' && <AddAlertIcon sx={{ color: n.color || undefined, mr: 0.5 }} />}
                  {/* إذا لم يوجد رمز مخصص، استخدم getNotifIcon */}
                  {!n.icon && !n.emoji && getNotifIcon(n.type)}
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: (!n.read && !readNotifs.includes(n.id)) ? 700 : 400, color: (!n.read && !readNotifs.includes(n.id)) ? '#d32f2f' : undefined }}
                  >
                    {n.message}
                  </Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => { handleDeleteNotif(n.id); handleMarkRead(n.id); }}><DeleteIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => { handleArchiveNotif(n.id); }} title="أرشفة"><DoneAllIcon fontSize="small" /></IconButton>
                  {/* عند عرض الإشعار */}
                  {n.attachment && (
                    <Button size="small" href={`/${n.attachment}`} target="_blank" sx={{ ml: 1 }}>
                      تحميل المرفق
                    </Button>
                  )}
                </Box>
                {/* عند عرض الإشعار */}
                {n.action_required && (
                  <Box display="inline-flex" gap={1} ml={1}>
                    {n.action_status === "pending" || !n.action_status ? (
                      <>
                        <Button size="small" color="success" variant="outlined" onClick={() => handleAction(n, "confirmed")}>تأكيد</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleAction(n, "rejected")}>رفض</Button>
                      </>
                    ) : (
                      <Typography variant="body2" color={n.action_status === "confirmed" ? "success.main" : "error.main"}>
                        {n.action_status === "confirmed" ? "تم التأكيد" : "تم الرفض"}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))
          )}
        </Card>
        {/* إشعارات مجمعة */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" mb={2}>الإشعارات المجمعة (ذكية)</Typography>
          {notifLoading ? (
            <Typography>{t('loading')}</Typography>
          ) : groupedNotifications.length === 0 ? (
            <Typography variant="body2">لا يوجد إشعارات مجمعة</Typography>
          ) : (
            groupedNotifications.map((g, idx) => (
              <Box key={idx} display="flex" alignItems="center" mb={1}>
                {getNotifIcon(g.type)}
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1976d2', mr: 1 }}>
                  {g.group_key || g.type} - عدد الإشعارات: {g.count}
                </Typography>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  آخر إشعار: {new Date(g.last_created).toLocaleString()}
                </Typography>
                {/* زر عرض التفاصيل */}
                <Button size="small" sx={{ ml: 2 }} onClick={() => alert(g.messages.join('\n'))}>عرض التفاصيل</Button>
              </Box>
            ))
          )}
        </Card>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>{t('latest_operations')}</Typography>
          <Typography variant="body2">{t('latest_operations_will_appear_here_soon')}</Typography>
        </Card>
      </Box>
      <Dialog open={notifDialogOpen} onClose={() => setNotifDialogOpen(false)}>
        <DialogTitle>{t('new_notification')}</DialogTitle>
        <DialogContent>
          {/* معاينة تفاعلية متكاملة */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={2} mt={1}>
            <Card sx={{
              minWidth: 220,
              minHeight: 80,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${notifColor || '#e3e3e3'} 60%, #fff 100%)`,
              boxShadow: '0 4px 16px #0002',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              px: 2,
              py: 1,
              mb: 1
            }}>
              <Box mr={2} display="flex" alignItems="center" justifyContent="center" sx={{ width: 48, height: 48, borderRadius: '50%', background: notifColor || '#e3e3e3', boxShadow: '0 2px 8px #0001' }}>
                {notifEmoji ? <span style={{ fontSize: 32 }}>{notifEmoji}</span>
                  : notifIcon === 'info' ? <InfoIcon fontSize="large" sx={{ color: '#fff' }} />
                  : notifIcon === 'assignment' ? <AssignmentIndIcon fontSize="large" sx={{ color: '#fff' }} />
                  : notifIcon === 'description' ? <DescriptionIcon fontSize="large" sx={{ color: '#fff' }} />
                  : notifIcon === 'alert' ? <AddAlertIcon fontSize="large" sx={{ color: '#fff' }} />
                  : <span style={{ color: '#888', fontSize: 22 }}>?</span>}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} color={notifColor || '#333'}>
                  {notifMessage || 'نص الإشعار سيظهر هنا'}
                </Typography>
              </Box>
            </Card>
            <Typography variant="caption" color="text.secondary">
              معاينة شكل الإشعار النهائي
            </Typography>
            {notifIcon && notifEmoji && (
              <Typography variant="caption" color="error">لا يمكن الجمع بين الرمز والإيموجي معًا في نفس الإشعار. سيتم اعتماد الإيموجي فقط.</Typography>
            )}
          </Box>
          {/* خيارات الرمز/الإيموجي/اللون مرتبة أفقيًا */}
          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>رمز</InputLabel>
              <Select value={notifIcon} label="رمز" onChange={e => setNotifIcon(e.target.value)} disabled={!!notifEmoji}>
                <MenuItem value=""><em>بدون</em></MenuItem>
                <MenuItem value="info" title="معلومات"><InfoIcon /> Info</MenuItem>
                <MenuItem value="assignment" title="مهمة"><AssignmentIndIcon /> Assignment</MenuItem>
                <MenuItem value="description" title="مستند"><DescriptionIcon /> Description</MenuItem>
                <MenuItem value="alert" title="تنبيه"><AddAlertIcon /> Alert</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>إيموجي</InputLabel>
              <Select value={notifEmoji} label="إيموجي" onChange={e => setNotifEmoji(e.target.value)} disabled={!!notifIcon}>
                <MenuItem value=""><em>بدون</em></MenuItem>
                <MenuItem value="🎉" title={t('celebration')}>🎉 {t('celebration')}</MenuItem>
                <MenuItem value="⚠️" title={t('warning')}>⚠️ {t('warning')}</MenuItem>
                <MenuItem value="✅" title={t('confirm')}>✅ {t('confirm')}</MenuItem>
                <MenuItem value="📢" title={t('announcement')}>📢 {t('announcement')}</MenuItem>
                <MenuItem value="🔔" title={t('notification')}>🔔 {t('notification')}</MenuItem>
              </Select>
            </FormControl>
            <TextField aria-label="input field" label="إيموجي مخصص"
              value={notifEmoji}
              onChange={e => setNotifEmoji(e.target.value)}
              inputProps={{ maxLength: 2, style: { fontSize: 24, textAlign: 'center' } }}
              sx={{ width: 80 }}
              disabled={!!notifIcon}
              placeholder="😊"
            />
            <Box display="flex" alignItems="center" gap={1}>
              <FormControl sx={{ minWidth: 100 }}>
                <InputLabel>لون</InputLabel>
                <Select value={notifColor} label="لون" onChange={e => setNotifColor(e.target.value)}>
                  <MenuItem value=""><em>افتراضي</em></MenuItem>
                  <MenuItem value="#1976d2"><span style={{ background: '#1976d2', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} title="أزرق" /> أزرق</MenuItem>
                  <MenuItem value="#43a047"><span style={{ background: '#43a047', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} title="أخضر" /> أخضر</MenuItem>
                  <MenuItem value="#fbc02d"><span style={{ background: '#fbc02d', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} title="أصفر" /> أصفر</MenuItem>
                  <MenuItem value="#e53935"><span style={{ background: '#e53935', width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 8 }} title="أحمر" /> أحمر</MenuItem>
                </Select>
              </FormControl>
              <input
                type="color"
                value={notifColor || '#e3e3e3'}
                onChange={e => setNotifColor(e.target.value)}
                style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8 }}
                title="اختر لون مخصص"
              />
            </Box>
          </Box>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>نوع المستهدف</InputLabel>
            <Select value={notifTargetType} label="نوع المستهدف" onChange={e => { setNotifTargetType(e.target.value); setNotifTargets([]); }}>
              <MenuItem value="workers">عمال</MenuItem>
              <MenuItem value="companies">شركات</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>اختر {notifTargetType === "workers" ? "العمال" : "الشركات"}</InputLabel>
            <Select
              multiple
              value={notifTargets}
              onChange={e => setNotifTargets(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="اختر" />}
              renderValue={selected =>
                notifTargetType === "workers"
                  ? allWorkers.filter(w => selected.includes(w.id?.toString())).map(w => w.name).join(', ')
                  : allCompanies.filter(c => selected.includes(c.id?.toString())).map(c => c.file_name || c.name).join(', ')
              }
            >
              {(notifTargetType === "workers" ? allWorkers : allCompanies).map(opt => (
                <MenuItem key={opt.id} value={opt.id?.toString()}>
                  <Checkbox checked={notifTargets.indexOf(opt.id?.toString()) > -1} />
                  <ListItemText primary={notifTargetType === "workers" ? opt.name : (opt.file_name || opt.name)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>نوع الإشعار</InputLabel>
            <Select value={notifType} label="نوع الإشعار" onChange={e => setNotifType(e.target.value)}>
              <MenuItem value="general">{t('general')}</MenuItem>
              <MenuItem value="permit">{t('permit')}</MenuItem>
              <MenuItem value="passport">{t('passport')}</MenuItem>
            </Select>
          </FormControl>
          <TextField aria-label="input field" fullWidth label="نص الإشعار" sx={{ mt: 2 }} value={notifMessage} onChange={e => setNotifMessage(e.target.value)} multiline rows={2} />
          <TextField aria-label="input field" fullWidth label="تاريخ انتهاء الإشعار (اختياري)" sx={{ mt: 2 }} type="date" InputLabelProps={{ shrink: true }} value={notifDate} onChange={e => setNotifDate(e.target.value)} />
          <TextField aria-label="input field" fullWidth
            label="جدولة الإشعار (اختياري)"
            type="datetime-local"
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
            value={notifSchedule}
            onChange={e => setNotifSchedule(e.target.value)}
          />
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            إرفاق ملف (اختياري)
            <input type="file" hidden onChange={e => setNotifFile(e.target.files?.[0] || null)} />
          </Button>
          {notifFile && <Typography variant="body2" color="primary">{notifFile.name}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifDialogOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleSendNotif} variant="contained" disabled={notifTargets.length === 0 || !notifMessage}>{t('send')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!importantNotif} onClose={() => setImportantNotif(null)}>
        <DialogTitle>إشعار هام</DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="error">{importantNotif?.message}</Typography>
          <Typography variant="body2">{importantNotif?.created_at && new Date(importantNotif.created_at).toLocaleString()}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportantNotif(null)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
