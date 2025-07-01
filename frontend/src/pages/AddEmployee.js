import React from 'react';
import EmployeeForm from '../components/EmployeeForm';
import { createEmployee } from '../api';
import { useNavigate } from 'react-router-dom';

export default function AddEmployee() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await createEmployee(data);
      alert('Employee created!');
      navigate('/');
    } catch {
      alert('Failed to create employee.');
    }
  };

  return (
    <>
      <h2>Add New Employee</h2>
      <EmployeeForm onSubmit={handleSubmit} />
    </>
  );
}
