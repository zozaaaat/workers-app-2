import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

export default function EmployeeForm({ initialData = { full_name: '', email: '' }, onSubmit }) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400 }}>
      <TextField
        label="Full Name"
        name="full_name"
        value={formData.full_name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <Button variant="contained" type="submit" sx={{ mt: 2 }}>
        Save
      </Button>
    </Box>
  );
}
