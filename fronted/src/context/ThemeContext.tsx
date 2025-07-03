import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import i18n from "i18next";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material";
// تعريف النوع يدوياً بدلاً من الاستيراد
type PaletteMode = "light" | "dark";

interface ThemeContextProps {
  mode: PaletteMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({ mode: "light", toggleMode: () => {} });

export const useThemeMode = () => useContext(ThemeContext);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialMode = (localStorage.getItem("themeMode") as PaletteMode) || "light";
  const [mode, setMode] = useState<PaletteMode>(initialMode);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        direction: i18n.language === "ar" ? "rtl" : "ltr",
        palette: {
          mode,
          primary: { main: "#1976d2" },
        },
        typography: {
          fontFamily: 'Cairo, Arial, sans-serif',
        },
      }),
    [mode, i18n.language]
  );

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
