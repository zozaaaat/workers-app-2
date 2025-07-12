import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh">
      <Typography variant="h1" color="primary" fontWeight={700} fontSize={120} mb={2}>404</Typography>
      <Typography variant="h5" mb={2}>الصفحة غير موجودة</Typography>
      <Button variant="contained" color="primary" component={Link} to="/">
        العودة للرئيسية
      </Button>
    </Box>
  );
};

export default NotFoundPage;
