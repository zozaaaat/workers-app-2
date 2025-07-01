import React, { useEffect, useState } from 'react';
import { getEmployee } from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, Button, CircularProgress } from '@mui/material';

export default function EmployeeDetails() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getEmployee(id)
      .then(res => setEmployee(res.data))
      .catch(() => {
        alert('Failed to load employee');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Employee Details</Typography>
      <Typography variant="h6">Full Name:</Typography>
      <Typography paragraph>{employee.full_name}</Typography>
      <Typography variant="h6">Email:</Typography>
      <Typography paragraph>{employee.email}</Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>
    </Box>
  );
}
