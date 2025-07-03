import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import axios from "axios";
import { API_URL } from "../../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface License {
  id: number;
  name?: string;
  license_number?: string;
  labor_count?: number;
}

const MainLicensesPage: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const api = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // TODO: replace 1 with actual company id when selection exists
        const res = await api.get(`/licenses/main/1`);
        setLicenses(res.data);
      } catch {
        // ignore for now
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [api]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{t('sidebar.licenses') || 'Licenses'}</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('license.name') || 'Name'}</TableCell>
              <TableCell>{t('license.number') || 'Number'}</TableCell>
              <TableCell>{t('license.labor_count') || 'Workers'}</TableCell>
              <TableCell></TableCell>
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
                  <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => navigate(`/workers?licenseId=${lic.id}`)}>{t('general.workers') || 'Workers'}</Button>
                  <Button size="small" variant="contained" onClick={() => navigate(`/licenses/${lic.id}/sub`)}>{t('license.sub') || 'Sub Licenses'}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MainLicensesPage;
