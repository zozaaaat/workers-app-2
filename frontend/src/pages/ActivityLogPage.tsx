import React from "react";
import { useAuth } from "../context/AuthContext";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const ActivityLogPage: React.FC = () => {
  const { activityLog } = useAuth();
  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>سجل النشاطات</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>المستخدم</TableCell>
              <TableCell>العملية</TableCell>
              <TableCell>التاريخ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activityLog.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ActivityLogPage;
