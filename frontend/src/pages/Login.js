import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // هنا ممكن تعمل اتصال API تسجيل دخول حقيقي، لكن هنعمل محاكاة
    if (email === 'admin@example.com' && password === 'admin123') {
      login({ email, name: 'Admin User' });
      navigate('/');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" mb={3}>Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth required margin="normal" />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal" />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Login</Button>
      </form>
    </Box>
  );
}
