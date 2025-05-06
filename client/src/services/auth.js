import api from './api';

// Register a new user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Get current logged in user
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Logout user
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// Delete user account
export const deleteAccount = async () => {
  const response = await api.delete('/auth/account');
  return response.data;
};