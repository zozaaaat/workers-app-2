import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import Sidebar from "../components/Sidebar";

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, minWidth: 350, textAlign: "center" }}>
          <Typography variant="h4" mb={2}>لوحة التحكم</Typography>
          <Typography>مرحبًا بك في نظام إدارة العمال والشركات!</Typography>
          {/* هنا يمكنك إضافة روابط أو مكونات للانتقال إلى صفحات CRUD */}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
