import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh">
      <Typography variant="h1" color="primary" fontWeight={700} fontSize={120} mb={2}>404</Typography>
      <Typography variant="h5" mb={2}>{t("notFound")}</Typography>
      <Button variant="contained" color="primary" component={Link} to="/" sx={{ mt: 2 }}>
        {t("dashboard")}
      </Button>
    </Box>
  );
};

export default NotFoundPage;
