import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Avatar } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api";
import loginBg from '../assets/login-bg.jpg';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [error, setError] = useState<string | { msg?: string; detail?: string; [key: string]: any } | null>("");
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, new URLSearchParams({
        username,
        password
      }));
      if (!loginRes.data || !loginRes.data.access_token) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
        return;
      }
      const token = loginRes.data.access_token;
      const userRes = await axios.get(`${API_URL}/users/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = userRes.data.find((u: any) => u.username === username);
      if (!user) throw new Error("المستخدم غير موجود");
      login(username, user.role);
      navigate("/");
    } catch (err: any) {
      if (err.response) {
        setError(`خطأ من السيرفر: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    }
  };
  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{
        background: `linear-gradient(rgba(123,47,242,0.7), rgba(40,150,255,0.7)), url(${loginBg}) center/cover no-repeat`,
        transition: 'background 1s',
        animation: 'bgFadeIn 1.5s',
      }}>
      <style>{`
        @keyframes bgFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .login-paper-animate {
          animation: paperPop 0.8s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes paperPop {
          0% { transform: scale(0.7) translateY(60px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .login-btn-animate {
          transition: background 0.3s, transform 0.2s;
        }
        .login-btn-animate:hover {
          background: linear-gradient(90deg, #7b2ff2 0%, #40c9ff 100%);
          transform: scale(1.04) translateY(-2px);
        }
      `}</style>
      <Paper elevation={8} className="login-paper-animate" sx={{
        p: 4,
        minWidth: 340,
        textAlign: 'center',
        borderRadius: 4,
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 8px 32px 0 rgba(123,47,242,0.15)',
      }}>
        <Avatar sx={{ bgcolor: '#40c9ff', mx: 'auto', mb: 2, width: 60, height: 60 }}>
          <LockIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h5" mb={2} fontWeight={700} color="#7b2ff2">تسجيل الدخول</Typography>
        <form onSubmit={handleLogin}>
          <TextField label="اسم المستخدم" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} required
            sx={{ input: { background: '#f3f6fd', borderRadius: 2 } }}
          />
          <TextField label="كلمة المرور" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required
            sx={{ input: { background: '#f3f6fd', borderRadius: 2 } }}
          />
          {error && (
            <Typography color="error" mt={1}>
              {typeof error === 'string' ? error : (error?.msg || error?.detail || JSON.stringify(error))}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: 700, fontSize: 18, borderRadius: 2, background: 'linear-gradient(90deg, #7b2ff2 0%, #40c9ff 100%)' }} className="login-btn-animate">دخول</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
