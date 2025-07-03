import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Box, Toolbar, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { API_URL } from '../../api';
import { useTranslation } from 'react-i18next';

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  entity: string;
  entity_id: number;
  timestamp: string;
}

const ActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/activity-log`);
      setLogs(res.data);
    } catch {
      enqueueSnackbar(t('general.load_error'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            سجل النشاطات
          </Typography>
          <TextField
            size="small"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Toolbar>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>المستخدم</TableCell>
                  <TableCell>العملية</TableCell>
                  <TableCell>الكيان</TableCell>
                  <TableCell>رقم الكيان</TableCell>
                  <TableCell>التاريخ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell>{log.entity_id}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString('ar-EG')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ActivityLogPage;
