import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import { API_URL } from "../../api";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

interface Entitlement {
  id: number;
  worker_id: number;
  amount: number;
  reason: string;
  date: string;
}

const EntitlementsPage: React.FC = () => {
  const [data, setData] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/endofservice`);
      setData(res.data);
    } catch {
      enqueueSnackbar(t("general.load_error"), { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" mb={2}>
        {t("sidebar.endofservice")}
      </Typography>
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("general.name")}</TableCell>
                  <TableCell>{t("general.amount")}</TableCell>
                  <TableCell>{t("general.reason")}</TableCell>
                  <TableCell>{t("general.date")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.worker_id}</TableCell>
                    <TableCell>{e.amount}</TableCell>
                    <TableCell>{e.reason}</TableCell>
                    <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default EntitlementsPage;
