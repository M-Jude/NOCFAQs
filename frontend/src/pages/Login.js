/**
 * Login Page Component
 * 
 * User authentication page for the NOC FAQs application.
 * Provides email/password login form with validation and error handling.
 * 
 * @module pages/Login
 * @requires react
 * @requires react-router-dom
 * @requires @mui/material
 * @requires context/AuthContext
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Material UI components
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  CircularProgress 
} from '@mui/material';

// Authentication context
import { useAuth } from '../context/AuthContext';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Login Page Component
 * 
 * Renders a centered login form with:
 * - Email input field
 * - Password input field
 * - Submit button with loading state
 * - Error message display
 * 
 * @returns {JSX.Element}
 */
const Login = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Authentication context
  const { login } = useAuth();
  
  // Navigation
  const navigate = useNavigate();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle form submission
   * Validates input and attempts authentication
   * 
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate input
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    // Attempt login
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to dashboard on success
      navigate('/');
    } else {
      // Display error message
      setError(result.message || 'Login failed. Please try again.');
    }
    
    // Reset loading state
    setLoading(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Application title */}
          <Typography variant="h4" component="h1" gutterBottom align="center">
            BCC NOC Knowledge Base
          </Typography>
          
          {/* Subtitle */}
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Network Operations Center - Knowledge Base
          </Typography>
          
          {/* Error alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Login form */}
          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
              placeholder="your_name@bcc.co.ug"
              disabled={loading}
            />
            
            {/* Password field */}
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            
            {/* Submit button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
