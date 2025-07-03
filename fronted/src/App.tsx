import React from "react";
import { ConfigProvider } from "antd";
import 'antd/dist/reset.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ActivityLogPage from "./pages/activity-log/ActivityLogPage";
import WorkersPage from "./pages/workers/WorkersPage";
import LicensesPage from "./pages/licenses/LicensesPage";
import MainLicensesPage from "./pages/licenses/MainLicensesPage";
import SubLicensesPage from "./pages/licenses/SubLicensesPage";
import LeavesPage from "./pages/leaves/LeavesPage";
import DeductionsPage from "./pages/deductions/DeductionsPage";
import ViolationsPage from "./pages/violations/ViolationsPage";

import "./App.css";
// removed MUI theme provider
import AppLayout from "./components/AppLayout";

function App() {

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <ConfigProvider direction="ltr">
      
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? (
              <AppLayout><Dashboard /></AppLayout>
            ) : <Navigate to="/login" />}
          />
          <Route path="/activity-log" element={isAuthenticated ? <AppLayout><ActivityLogPage /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/workers" element={isAuthenticated ? <AppLayout><WorkersPage /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/licenses" element={isAuthenticated ? <AppLayout><MainLicensesPage /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/licenses/:mainId/sub" element={isAuthenticated ? <AppLayout><SubLicensesPage /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/leaves" element={isAuthenticated ? <AppLayout><LeavesPage /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/deductions" element={isAuthenticated ? <AppLayout><DeductionsPage /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/violations" element={isAuthenticated ? <AppLayout><ViolationsPage /></AppLayout> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App
