import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../features/common/pages/NotFound";
import Dashboard from "../pages/Dashboard";
import MainLicensesPage from "../features/licenses/pages/MainLicensesPage";
import SubLicensesPage from "../features/licenses/pages/SubLicensesPage";
import WorkersPage from "../features/workers/pages/WorkersPage";
import LoginPage from "../features/auth/pages/LoginPage";
// TODO: import other feature pages as migrated

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "licenses", element: <MainLicensesPage /> },
          { path: "licenses/:mainId/sub", element: <SubLicensesPage /> },
          { path: "workers", element: <WorkersPage /> },
          // ...rest HR, activity-log
        ],
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "*", element: <NotFound /> }
]);
