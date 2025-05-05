import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const res = await authService.getMe();
        console.log('Auth check response:', res.data);
        setUser(res.data.user);
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await authService.register(userData);
      setUser(res.data.user);
      toast.success('Account created successfully!');
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
      toast.error(err.response?.data?.error || 'Failed to register');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      const res = await authService.login(credentials);
      console.log('Login response:', res.data);
      setUser(res.data.user);
      toast.success('Logged in successfully!');
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
      toast.error(err.response?.data?.error || 'Failed to login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully!');
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to logout');
      toast.error(err.response?.data?.error || 'Failed to logout');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};