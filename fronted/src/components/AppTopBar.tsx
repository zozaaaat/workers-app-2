import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import { useThemeMode } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const drawerWidth = 220;

const AppTopBar: React.FC = () => {
  const { mode, toggleMode } = useThemeMode();
  const { i18n } = useTranslation();

  const handleLangSwitch = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    document.body.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: `${drawerWidth}px` }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" sx={{ mr: 2 }} aria-label="menu">
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
  );
};

export default AppTopBar;
