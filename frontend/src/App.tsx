import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LicensesPage from "./pages/licenses/LicensesPage";
import AbsencesPage from "./pages/absences/AbsencesPage";
import CompaniesPage from "./pages/companies/CompaniesPage";
import DeductionsPage from "./pages/deductions/DeductionsPage";
import LeavesPage from "./pages/leaves/LeavesPage";
import ViolationsPage from "./pages/violations/ViolationsPage";
import WorkersPage from "./pages/workers/WorkersPage";
import Sidebar from "./components/Sidebar";
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Tooltip } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import LanguageIcon from '@mui/icons-material/Language';
import { CustomThemeProvider, useColorMode } from "./theme";
import { useTranslation } from "react-i18next";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import { useAuth } from "./context/AuthContext";
import UsersPage from "./pages/users/UsersPage";
import WorkerProfilePage from "./pages/WorkerProfilePage";

const TopBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toggleColorMode } = useColorMode();
  const location = useLocation();
  const pageTitles: Record<string, string> = {
    "/": t("dashboard"),
    "/licenses": t("licenses"),
    "/absences": t("absences"),
    "/companies": t("companies"),
    "/deductions": t("deductions"),
    "/leaves": t("leaves"),
    "/violations": t("violations"),
    "/workers": t("workers"),
    "/end_of_service": t("end_of_service"),
    "/users": t("add") + " " + t("admin"),
    "/activity-log": t("activityLog"),
  };
  return (
    <AppBar position="fixed" sx={{ zIndex: 1201, background: '#1976d2', transition: 'background 0.5s' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {pageTitles[location.pathname] || t("dashboard")}
        </Typography>
        <Tooltip title={t("toggle_theme") || t("theme")}>
          <IconButton color="inherit" onClick={toggleColorMode}>
            <Brightness4Icon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("change_language") || t("language")}>
          <IconButton color="inherit" onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}>
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        <Avatar sx={{ ml: 2 }}>U</Avatar>
      </Toolbar>
    </AppBar>
  );
};

const App: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  return (
    <CustomThemeProvider>
      <Router>
        {user ? (
          <>
            <TopBar />
            <Box sx={{ display: 'flex', minHeight: '100vh', background: 'background.default', pt: 8 }}>
              <Sidebar />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/activity-log" element={<ActivityLogPage />} />
                  <Route path="/licenses" element={<LicensesPage />} />
                  <Route path="/absences" element={<AbsencesPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/deductions" element={<DeductionsPage />} />
                  <Route path="/leaves" element={<LeavesPage />} />
                  <Route path="/violations" element={<ViolationsPage />} />
                  <Route path="/workers" element={<WorkersPage />} />
                  <Route path="/workers/:id" element={<WorkerProfilePage />} />
                  <Route path="/users" element={isAdmin ? <UsersPage /> : <Navigate to="/" />} />
                  <Route path="/end_of_service" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Box>
            </Box>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </Router>
    </CustomThemeProvider>
  );
};

export default App;
