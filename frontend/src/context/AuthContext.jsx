import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on initial page load
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getMe();
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 is normal when visitor is unauthenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authService.loginUser(credentials);
      if (response?.data?.user) {
        if (response.data.token) {
          try { localStorage.setItem('campusgig_token', response.data.token); } catch (e) {}
        }
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response?.message || 'Login failed' };
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      return { success: false, message: err.message || 'Invalid credentials' };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.registerUser(userData);
      if (response?.data?.user) {
        if (response.data.token) {
          try { localStorage.setItem('campusgig_token', response.data.token); } catch (e) {}
        }
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response?.message || 'Registration failed' };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      try { localStorage.removeItem('campusgig_token'); } catch (e) {}
      await authService.logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkCurrentUser,
    updateUserState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
