import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import MenuIcon from '@mui/icons-material/Menu';
// Sidebar component renders the list items; we'll reuse it inside Drawer
import Sidebar from "./Sidebar";
import { useThemeMode } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

const drawerWidth = 240;

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const { mode, toggleMode } = useThemeMode();
  const { i18n } = useTranslation();

  const handleLangSwitch = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2, display: { sm: 'none' } }} onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Workers App
          </Typography>
          <IconButton color="inherit" onClick={toggleMode} sx={{ mr: 1 }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleLangSwitch}>
            <TranslateIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* Responsive Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="sidebar folders">
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          <Sidebar onNavigate={handleDrawerToggle} />
        </Drawer>
        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          open
        >
          <Sidebar onNavigate={handleDrawerToggle} />
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        {children}
      </Box>
    </Box>
  );
};

export default ProtectedLayout;
