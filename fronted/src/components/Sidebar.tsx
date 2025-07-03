import React from "react";
import { List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import GavelIcon from "@mui/icons-material/Gavel";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate } from "react-router-dom";
import { useThemeMode } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';



interface SidebarProps { onNavigate?: () => void }

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const { t, i18n } = useTranslation();

  const handleLangSwitch = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    document.body.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const menu = [
    { text: t('sidebar.companies'), icon: <BusinessIcon />, path: "/companies" },
    { text: t('sidebar.workers'), icon: <PeopleIcon />, path: "/workers" },
    { text: t('sidebar.licenses'), icon: <AssignmentIndIcon />, path: "/licenses" },
    { text: t('sidebar.leaves'), icon: <EventNoteIcon />, path: "/leaves" },
    { text: t('sidebar.deductions'), icon: <MoneyOffIcon />, path: "/deductions" },
    { text: t('sidebar.violations'), icon: <GavelIcon />, path: "/violations" },
    { text: t('sidebar.entitlements'), icon: <ExitToAppIcon />, path: "/entitlements" },
    { text: t('sidebar.activity_log'), icon: <EventNoteIcon />, path: "/activity-log" },
  ];
  return (
    <Box sx={{ width: 240 }}>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menu.map((item) => (
            <ListItemButton key={item.text} onClick={() => { navigate(item.path); if (onNavigate) onNavigate(); }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
          <ListItemButton onClick={toggleMode} sx={{ mt: 2 }}>
            <ListItemIcon>{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</ListItemIcon>
            <ListItemText primary={mode === 'dark' ? t('sidebar.light_mode') : t('sidebar.dark_mode')} />
          </ListItemButton>
          <ListItemButton onClick={handleLangSwitch}>
            <ListItemIcon>{t('sidebar.language')}</ListItemIcon>
            <ListItemText primary={i18n.language === 'ar' ? 'English' : 'العربية'} />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
