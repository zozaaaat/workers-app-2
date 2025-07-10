import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';

// Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import LoginPage from '../pages/auth/LoginPage';
import ViolationsPage from '../pages/violations/ViolationsPage';
import LeavesPage from '../pages/leaves/LeavesPage';
import AbsencesPage from '../pages/absences/AbsencesPage';
import DeductionsPage from '../pages/deductions/DeductionsPage';
import CompaniesPage from '../pages/companies/CompaniesPage';
import WorkersPage from '../pages/workers/WorkersPage';
import LicensesPage from '../pages/licenses/LicensesPage';
import ReportsPage from '../pages/reports/ReportsPage';
import MedicalPage from '../pages/medical/MedicalFilesManagementPage';
import TrainingPage from '../pages/training/TrainingPage';
import PerformancePage from '../pages/performance/PerformancePage';
import WorkerProfilePage from '../pages/profile/WorkerProfilePage';
import SecuritySettingsPage from '../pages/security/SecuritySettingsPage';
import WorkerDocumentsPage from '../pages/workers/WorkerDocumentsPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="violations" element={<ViolationsPage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="absences" element={<AbsencesPage />} />
        <Route path="deductions" element={<DeductionsPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="workers" element={<WorkersPage />} />
        <Route path="worker-documents" element={<WorkerDocumentsPage />} />
        <Route path="licenses" element={<LicensesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="medical" element={<MedicalPage />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="profile" element={<WorkerProfilePage />} />
        <Route path="security" element={<SecuritySettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
