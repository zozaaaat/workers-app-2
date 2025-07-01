import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EmployeesList from './pages/EmployeesList';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import EmployeeDetails from './pages/EmployeeDetails';
import Login from './pages/Login';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { AuthContext, AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';

function AppContent() {
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Employees Management
          </Typography>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/">Employees</Button>
              <Button color="inherit" component={Link} to="/add">Add Employee</Button>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ marginTop: 4 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><EmployeesList /></PrivateRoute>} />
          <Route path="/add" element={<PrivateRoute><AddEmployee /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><EditEmployee /></PrivateRoute>} />
          <Route path="/details/:id" element={<PrivateRoute><EmployeeDetails /></PrivateRoute>} />
        </Routes>
      </Container>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
