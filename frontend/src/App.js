import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HRDashboard from './pages/HRDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import ManageQuestions from './pages/ManageQuestions';
import ManageUsers from './pages/ManageUsers';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={
          user?.role === 'hr' ? <HRDashboard /> :
          user?.role === 'admin' ? <AdminDashboard /> :
          <Dashboard />
        } />
        
        <Route path="questions" element={
          <ProtectedRoute allowedRoles={['noc_engineer', 'admin', 'hr']}>
            <Questions />
          </ProtectedRoute>
        } />
        
        <Route path="questions/:id" element={
          <ProtectedRoute allowedRoles={['noc_engineer', 'admin', 'hr']}>
            <QuestionDetail />
          </ProtectedRoute>
        } />
        
        <Route path="manage-questions" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageQuestions />
          </ProtectedRoute>
        } />
        
        <Route path="manage-users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageUsers />
          </ProtectedRoute>
        } />
        
        <Route path="hr-dashboard" element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <HRDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
