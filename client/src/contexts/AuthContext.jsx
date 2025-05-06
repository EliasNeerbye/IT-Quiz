import { createContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, register } from '../services/auth';

// Create the context
export const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUser();
        if (response.user) {
          setUser(response.user);
        }
      } catch (err) {
        // User not authenticated, that's okay
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Login user
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await login(credentials);
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Register user
  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await register(userData);
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };
  
  // Clear any errors
  const clearError = () => {
    setError(null);
  };
  
  // Create the context value
  const value = {
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};