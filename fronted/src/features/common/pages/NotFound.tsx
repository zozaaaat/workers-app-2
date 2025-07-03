import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh">
      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography variant="h6" gutterBottom>
        الصفحة غير موجودة
      </Typography>
      <Button variant="contained" onClick={() => navigate("/dashboard")}>الرجوع للرئيسية</Button>
    </Box>
  );
};

export default NotFound;
