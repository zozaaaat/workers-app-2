import React, { useState } from "react";
import { TextField, Button, Box, Typography, Paper, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from '../api';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/auth/login`, new URLSearchParams({
        username,
        password,
      }), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.detail || "خطأ في تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" mb={2} align="center">تسجيل الدخول</Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="اسم المستخدم"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          {error && <Typography color="error" mt={1}>{error}</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} aria-label="loading" title="loading" />}
          >
            دخول
          </Button>
          <Button
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => navigate("/register")}
          >
            مستخدم جديد؟ سجل الآن
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
