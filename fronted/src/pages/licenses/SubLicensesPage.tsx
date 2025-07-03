import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import axios from "axios";
import { API_URL } from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface License {
  id: number;
  name?: string;
  license_number?: string;
  labor_count?: number;
}

const SubLicensesPage: React.FC = () => {
  const { mainId } = useParams<{ mainId: string }>();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const api = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    const fetch = async () => {
      if (!mainId) return;
      setLoading(true);
      try {
        const res = await api.get(`/licenses/sub/${mainId}`);
        setLicenses(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [api, mainId]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{t('license.sub') || 'Sub Licenses'}</Typography>
      <Button sx={{ mb: 2 }} variant="outlined" onClick={() => navigate(-1)}>{t('general.back') || 'Back'}</Button>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('license.name')}</TableCell>
              <TableCell>{t('license.number')}</TableCell>
              <TableCell>{t('license.labor_count')}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {licenses.map((lic) => (
              <TableRow key={lic.id} hover>
                <TableCell>{lic.name}</TableCell>
                <TableCell>{lic.license_number}</TableCell>
                <TableCell>{lic.labor_count ?? 0}</TableCell>
                <TableCell>
                  <Button size="small" variant="contained" onClick={() => navigate(`/workers?licenseId=${lic.id}`)}>{t('general.view_workers') || 'Workers'}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SubLicensesPage;
