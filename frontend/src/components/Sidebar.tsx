import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GavelIcon from '@mui/icons-material/Gavel';
import BadgeIcon from '@mui/icons-material/Badge';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const menu = [
  { label: "العمال", path: "/workers", icon: <WorkIcon /> },
  { label: "الشركات", path: "/companies", icon: <BusinessIcon /> },
  { label: "الغيابات", path: "/absences", icon: <EventBusyIcon /> },
  { label: "الخصومات", path: "/deductions", icon: <MoneyOffIcon /> },
  { label: "الإجازات", path: "/leaves", icon: <EventAvailableIcon /> },
  { label: "الرخص", path: "/licenses", icon: <BadgeIcon /> },
  { label: "المخالفات", path: "/violations", icon: <GavelIcon /> },
  { label: "نهاية الخدمة", path: "/end_of_service", icon: <AssignmentIndIcon /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  return (
    <Drawer variant="permanent" anchor="right" sx={{ width: 220, flexShrink: 0, '& .MuiDrawer-paper': { width: 220, boxSizing: 'border-box', background: 'linear-gradient(180deg, #7b2ff2 0%, #40c9ff 100%)', borderLeft: 'none', color: '#fff', transition: 'background 0.5s' } }}>
      <Toolbar />
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <img src="/logo192.png" alt="logo" width={60} style={{ borderRadius: 12, boxShadow: '0 4px 16px #7b2ff255' }} />
        <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold', color: '#fff', letterSpacing: 1 }}>نظام العمال</Typography>
      </Box>
      <List>
        <ListItem component={Link} to="/" sx={location.pathname === "/" ? { backgroundColor: '#ffffff22', fontWeight: 'bold', borderRadius: 2, transition: 'background 0.3s', color: '#fff' } : { borderRadius: 2, transition: 'background 0.3s', color: '#fff' }}>
          <ListItemIcon sx={{ color: '#fff' }}><DashboardIcon /></ListItemIcon>
          <ListItemText primary={t("dashboard") || "لوحة التحكم"} primaryTypographyProps={{ style: { color: '#fff' } }} />
        </ListItem>
        {menu.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            sx={location.pathname === item.path ? { backgroundColor: '#ffffff22', fontWeight: 'bold', borderRadius: 2, transition: 'background 0.3s', color: '#fff' } : { borderRadius: 2, transition: 'background 0.3s', color: '#fff' }}
          >
            <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={t(item.label) || item.label} primaryTypographyProps={{ style: { color: '#fff' } }} />
          </ListItem>
        ))}
        
        {/* صفحات متقدمة */}
        <ListItem component={Link} to="/analytics" sx={location.pathname === "/analytics" ? { backgroundColor: '#ffffff22', fontWeight: 'bold', borderRadius: 2, transition: 'background 0.3s', color: '#fff' } : { borderRadius: 2, transition: 'background 0.3s', color: '#fff' }}>
          <ListItemIcon sx={{ color: '#fff' }}><AnalyticsIcon /></ListItemIcon>
          <ListItemText primary="لوحة التحليلات" primaryTypographyProps={{ style: { color: '#fff' } }} />
        </ListItem>
        
        <ListItem component={Link} to="/ai-analytics" sx={location.pathname === "/ai-analytics" ? { backgroundColor: '#ffffff22', fontWeight: 'bold', borderRadius: 2, transition: 'background 0.3s', color: '#fff' } : { borderRadius: 2, transition: 'background 0.3s', color: '#fff' }}>
          <ListItemIcon sx={{ color: '#fff' }}><PsychologyIcon /></ListItemIcon>
          <ListItemText primary="الذكاء الاصطناعي" primaryTypographyProps={{ style: { color: '#fff' } }} />
        </ListItem>
        
        <ListItem component={Link} to="/advanced-reports" sx={location.pathname === "/advanced-reports" ? { backgroundColor: '#ffffff22', fontWeight: 'bold', borderRadius: 2, transition: 'background 0.3s', color: '#fff' } : { borderRadius: 2, transition: 'background 0.3s', color: '#fff' }}>
          <ListItemIcon sx={{ color: '#fff' }}><AssessmentIcon /></ListItemIcon>
          <ListItemText primary="التقارير المتقدمة" primaryTypographyProps={{ style: { color: '#fff' } }} />
        </ListItem>
        
        {user?.role === "admin" && (
          <>
            <ListItem component={Link} to="/users" sx={location.pathname === "/users" ? { backgroundColor: '#ffffff22', fontWeight: 'bold', borderRadius: 2, transition: 'background 0.3s', color: '#fff' } : { borderRadius: 2, transition: 'background 0.3s', color: '#fff' }}>
              <ListItemIcon sx={{ color: '#fff' }}><PeopleIcon /></ListItemIcon>
              <ListItemText primary="إدارة المستخدمين" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            
            <ListItem component={Link} to="/security" sx={location.pathname === "/security" ? { backgroundColor: '#ffffff22', fontWeight: 'bold', borderRadius: 2, transition: 'background 0.3s', color: '#fff' } : { borderRadius: 2, transition: 'background 0.3s', color: '#fff' }}>
              <ListItemIcon sx={{ color: '#fff' }}><SecurityIcon /></ListItemIcon>
              <ListItemText primary="إعدادات الأمان" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;
