import React, { useEffect, useState } from 'react';
import { fetchEmployees, deleteEmployee } from '../api';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Typography, CircularProgress, Box, TextField,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const loadEmployees = async () => {
    try {
      const res = await fetchEmployees();
      setEmployees(res.data);
    } catch (err) {
      alert('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openDeleteDialog = (emp) => {
    setEmployeeToDelete(emp);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setEmployeeToDelete(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
      closeDeleteDialog();
    } catch {
      alert('Delete failed');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;

  return (
    <>
      <Typography variant="h4" mb={2}>Employees List</Typography>

      <TextField
        label="Search by name or email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredEmployees.map(emp => (
            <TableRow key={emp.id}>
              <TableCell>{emp.full_name}</TableCell>
              <TableCell>{emp.email}</TableCell>
              <TableCell align="right">
                <IconButton component={Link} to={`/details/${emp.id}`} color="info" title="View Details">
                  <Visibility />
                </IconButton>
                <IconButton component={Link} to={`/edit/${emp.id}`} color="primary" title="Edit Employee">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => openDeleteDialog(emp)} color="error" title="Delete Employee">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {filteredEmployees.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center">No employees found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* مودال تأكيد الحذف */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete employee "{employeeToDelete?.full_name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
