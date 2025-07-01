import React, { useEffect, useState } from 'react';
import EmployeeForm from '../components/EmployeeForm';
import { getEmployee, updateEmployee } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const res = await getEmployee(id);
        setEmployee(res.data);
      } catch {
        alert('Failed to load employee');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    loadEmployee();
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    try {
      await updateEmployee(id, data);
      alert('Employee updated!');
      navigate('/');
    } catch {
      alert('Failed to update employee.');
    }
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;

  return (
    <>
      <h2>Edit Employee</h2>
      {employee && <EmployeeForm initialData={employee} onSubmit={handleSubmit} />}
    </>
  );
}
