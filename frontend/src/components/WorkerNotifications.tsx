import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../api_notifications";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DescriptionIcon from "@mui/icons-material/Description";
import AddAlertIcon from "@mui/icons-material/AddAlert";

interface Props {
  worker: any;
}

const WorkerNotifications: React.FC<Props> = ({ worker }) => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!worker) return;
    setLoading(true);
    fetchNotifications().then((all) => {
      // فلترة الإشعارات الخاصة بالعامل حسب الاسم أو الرقم المدني أو custom_id
      const filtered = all.filter((n: any) =>
        (worker.name && n.message && n.message.includes(worker.name)) ||
        (worker.civil_id && n.message && n.message.includes(worker.civil_id)) ||
        (worker.custom_id && n.message && n.message.includes(worker.custom_id))
      );
      setNotifications(filtered);
    }).finally(() => setLoading(false));
  }, [worker]);

  const getNotifIcon = (type?: string, icon?: string) => {
    if (icon === "assignment") return <AssignmentIndIcon sx={{ color: '#1976d2', mr: 1 }} />;
    if (icon === "description") return <DescriptionIcon sx={{ color: '#fbc02d', mr: 1 }} />;
    if (icon === "alert") return <AddAlertIcon sx={{ color: '#e53935', mr: 1 }} />;
    if (icon === "info") return <InfoIcon sx={{ color: '#757575', mr: 1 }} />;
    if (type === "passport") return <AssignmentIndIcon sx={{ color: '#1976d2', mr: 1 }} />;
    if (type === "permit") return <DescriptionIcon sx={{ color: '#fbc02d', mr: 1 }} />;
    return <InfoIcon sx={{ color: '#757575', mr: 1 }} />;
  };

  if (loading) return <Box display="flex" alignItems="center" gap={1}><CircularProgress size={18} /> <span>تحميل الإشعارات...</span></Box>;
  if (!notifications.length) return <Typography color="textSecondary">لا يوجد إشعارات لهذا العامل</Typography>;

  return (
    <Box mt={3}>
      <Typography variant="h6" mb={1}>الإشعارات الخاصة بالعامل</Typography>
      {notifications.map(n => (
        <Box key={n.id} display="flex" alignItems="center" mb={1}>
          {n.emoji && <span style={{ fontSize: 22, marginRight: 6 }}>{n.emoji}</span>}
          {getNotifIcon(n.type, n.icon)}
          <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 700, color: n.read ? undefined : '#d32f2f' }}>{n.message}</Typography>
          {n.attachment && (
            <Button size="small" href={`/${n.attachment}`} target="_blank" sx={{ ml: 1 }}>
              تحميل المرفق
            </Button>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default WorkerNotifications;
