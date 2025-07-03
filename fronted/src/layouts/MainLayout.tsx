import React from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import AppTopBar from "../components/AppTopBar";
import Sidebar from "../components/Sidebar";

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Top AppBar with theme + language toggles is reused */}
      <AppTopBar />
      {/* Permanent Sidebar */}
      <Sidebar />
      {/* Main content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar /> {/* to push content below AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
