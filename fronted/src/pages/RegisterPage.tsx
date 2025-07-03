import React, { useState } from "react";
import { TextField, Button, Box, Typography, Paper, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from '../api';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      setSuccess("تم التسجيل بنجاح! يمكنك تسجيل الدخول الآن.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" mb={2} align="center">تسجيل مستخدم جديد</Typography>
        <form onSubmit={handleRegister}>
          <TextField
            label="اسم المستخدم"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="البريد الإلكتروني"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            type="email"
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
          {success && <Typography color="primary" mt={1}>{success}</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            تسجيل
          </Button>
          <Button
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => navigate("/login")}
          >
            لديك حساب؟ سجل الدخول
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
