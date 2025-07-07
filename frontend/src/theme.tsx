import React, { createContext, useMemo, useState, useContext, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');

  // تغيير اتجاه الصفحة حسب اللغة
  useEffect(() => {
    const lang = localStorage.getItem('i18nextLng') || 'ar';
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [mode]);

  const colorMode = useMemo(() => ({
    toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
  }), []);

  const theme = useMemo(() => createTheme({
    direction,
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#7b2ff2' : '#232526' },
      secondary: { main: mode === 'light' ? '#f357a8' : '#414345' },
      background: {
        default: mode === 'light' ? '#f7f7fa' : '#18191a',
        paper: mode === 'light' ? '#fff' : '#232526',
      },
    },
    typography: {
      fontFamily: direction === 'rtl' ? 'Cairo, Arial, sans-serif' : 'Roboto, Arial, sans-serif',
    },
    shape: { borderRadius: 18 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            border: '1px solid rgba(255,255,255,0.18)',
            transition: 'transform 0.3s cubic-bezier(.4,2,.3,1), box-shadow 0.3s',
            borderRadius: 18,
            background: mode === 'light'
              ? 'linear-gradient(135deg, #fff 80%, #e3e6ff 100%)'
              : 'linear-gradient(135deg, #232526 80%, #414345 100%)',
            '&:hover': {
              transform: 'scale(1.03)',
              boxShadow: '0 12px 40px 0 rgba(123,47,242,0.22)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'background 0.3s, box-shadow 0.3s',
            borderRadius: 18,
            background: mode === 'light'
              ? 'rgba(255,255,255,0.97)'
              : 'rgba(35,37,38,0.97)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
            background: 'linear-gradient(90deg, #7b2ff2 0%, #40c9ff 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px #7b2ff233',
            transition: 'background 0.3s, transform 0.2s',
            '&:hover': {
              background: 'linear-gradient(90deg, #40c9ff 0%, #7b2ff2 100%)',
              transform: 'scale(1.04) translateY(-2px)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            transition: 'background 0.3s',
            background: mode === 'light' ? '#f3f6fd' : '#232526',
            color: mode === 'light' ? '#222' : '#fff',
          },
          head: {
            background: mode === 'light' ? '#7b2ff2' : '#232526',
            color: '#fff',
            fontWeight: 700,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            transition: 'background 0.3s, color 0.3s',
            '&:hover': {
              background: 'rgba(64,201,255,0.12)',
              color: '#40c9ff',
            },
          },
        },
      },
    },
  }), [mode, direction]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
