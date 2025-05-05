import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Quiz services
export const quizService = {
  getQuizzes: (params) => api.get('/quiz', { params }),
  getQuiz: (id) => api.get(`/quiz/${id}`),
  createQuiz: (quizData) => api.post('/quiz', quizData),
  submitQuizAttempt: (id, attemptData) => api.post(`/quiz/${id}/attempt`, attemptData),
  deleteQuiz: (id) => api.delete(`/quiz/${id}`),
  getCategories: () => api.get('/quiz/categories'),
  createCategory: (categoryData) => api.post('/quiz/categories', categoryData),
};

// FAQ services
export const faqService = {
  getFAQs: (isAdmin = false) => api.get('/faq', { params: { isAdmin } }),
  createFAQ: (faqData) => api.post('/faq', faqData),
  updateFAQ: (id, faqData) => api.put(`/faq/${id}`, faqData),
  deleteFAQ: (id) => api.delete(`/faq/${id}`),
};

// Admin services
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userData) => api.put('/admin/users/role', userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;