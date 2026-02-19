/**
 * Authentication Context
 * 
 * Provides authentication state and methods to the entire application.
 * Manages user login, logout, and session persistence using localStorage.
 * 
 * @module context/AuthContext
 * @requires react
 * @requires axios
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the authentication context
const AuthContext = createContext(null);

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value
 * @example
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication functionality.
 * Handles token storage, user state, and session management.
 * 
 * @param {ReactNode} children - Child components
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  // State for current user
  const [user, setUser] = useState(null);
  
  // Loading state for initial authentication check
  const [loading, setLoading] = useState(true);
  
  // Current session ID for tracking
  const [sessionId, setSessionId] = useState(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Check for existing session on component mount
   * Restores user data from localStorage if valid token exists
   */
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedSessionId = localStorage.getItem('sessionId');

      if (token && savedUser) {
        try {
          // Restore user state from localStorage
          setUser(JSON.parse(savedUser));
          setSessionId(savedSessionId);
          
          // Set default authorization header for API calls
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          // Clear invalid stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('sessionId');
        }
      }
      
      // Authentication check complete
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Authenticate user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  const login = async (email, password) => {
    try {
      // Make login API request
      const response = await axios.post('/api/auth/login', { 
        email, 
        password 
      });

      const { token, user: userData, sessionId: newSessionId } = response.data;

      // Store authentication data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('sessionId', newSessionId);

      // Set default authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(userData);
      setSessionId(newSessionId);

      return { success: true };
    } catch (error) {
      // Return error message from server or default message
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  /**
   * Logout the current user
   * Clears session and removes stored authentication data
   */
  const logout = async () => {
    try {
      // Notify backend to end the session
      if (sessionId) {
        await axios.post('/api/auth/logout', { sessionId });
      }
    } catch (error) {
      // Log error but continue with local logout
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');

      // Remove authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear state
      setUser(null);
      setSessionId(null);
    }
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  // Provide authentication methods and state to children
  const value = {
    user,           // Current user object
    loading,        // Authentication loading state
    login,          // Login function
    logout,         // Logout function
    sessionId,      // Current session ID
    isAuthenticated: !!user,  // Boolean for checking login status
    isAdmin: user?.role === 'admin',
    isHR: user?.role === 'hr',
    isNOC: user?.role === 'noc_engineer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
