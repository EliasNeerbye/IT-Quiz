import { createContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, register } from '../services/auth';


export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUser();
        if (response.user) {
          setUser(response.user);
        }
      } catch (err) {
        
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  
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
  
  
  const clearError = () => {
    setError(null);
  };
  
  
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