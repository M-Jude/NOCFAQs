import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null); 

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedSessionId = localStorage.getItem('sessionId');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setSessionId(savedSessionId);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user: userData, sessionId: newSessionId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('sessionId', newSessionId);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setSessionId(newSessionId);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', { sessionId });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setSessionId(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, sessionId }}>
      {children}
    </AuthContext.Provider>
  );
};
