/**
 * Main Application Component
 * 
 * Root component that sets up routing, theming, and authentication.
 * Defines all application routes and protected route configurations.
 * 
 * @module App
 * @requires react
 * @requires react-router-dom
 * @requires @mui/material
 * @requires context/AuthContext
 * @requires components/Layout
 * @requires pages/*
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';

// Page components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HRDashboard from './pages/HRDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import ManageQuestions from './pages/ManageQuestions';
import ManageUsers from './pages/ManageUsers';

// Layout component
import Layout from './components/Layout';

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

/**
 * Application theme configuration
 * Defines color palette and visual styling
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',    // Blue primary color
    },
    secondary: {
      main: '#dc004e',    // Pink secondary color
    },
    background: {
      default: '#f5f5f5', // Light gray background
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Disable uppercase transformation
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners
        }
      }
    }
  }
});

// ============================================================================
// ROUTE PROTECTION
// ============================================================================

/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication and optionally role-based access.
 * Redirects unauthenticated users to login and unauthorized users to dashboard.
 * 
 * @param {ReactNode} children - Child components to render if authorized
 * @param {string[]} [allowedRoles] - Array of allowed roles (optional)
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home if user lacks required role
    return <Navigate to="/" replace />;
  }

  // Render children if authorized
  return children;
};

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

/**
 * Application Routes Component
 * 
 * Defines all application routes with appropriate access controls.
 * Uses nested routes within the Layout component.
 * 
 * @returns {JSX.Element}
 */
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login route - redirect to dashboard if already authenticated */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      
      {/* Protected routes with layout */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Default route - redirects based on user role */}
        <Route index element={
          user?.role === 'hr' ? <HRDashboard /> :
          user?.role === 'admin' ? <AdminDashboard /> :
          <Dashboard />
        } />
        
        {/* FAQ browsing routes - accessible to all authenticated users */}
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
        
        {/* Admin-only routes */}
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
        
        {/* HR/Admin routes */}
        <Route path="hr-dashboard" element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <HRDashboard />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

/**
 * Root Application Component
 * 
 * Sets up:
 * - Material UI theme
 * - CSS baseline styles
 * - Authentication provider
 * - Route definitions
 * 
 * @returns {JSX.Element}
 */
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
