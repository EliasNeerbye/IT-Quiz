import api from './api';

// Get all public quizzes
export const getPublicQuizzes = async () => {
  const response = await api.get('/quiz/public');
  return response.data;
};

// Get all user's quizzes
export const getUserQuizzes = async () => {
  const response = await api.get('/quiz/me');
  return response.data;
};

// Get quiz by ID
export const getQuizById = async (quizId) => {
  const response = await api.get(`/quiz/${quizId}`);
  return response.data;
};

// Create new quiz
export const createQuiz = async (quizData) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', quizData.title);
  formData.append('description', quizData.description);
  
  // Add category IDs if they exist
  if (quizData.categoryIds && quizData.categoryIds.length > 0) {
    formData.append('categoryIds', JSON.stringify(quizData.categoryIds));
  }
  
  // Add image if it exists
  if (quizData.image) {
    formData.append('image', quizData.image);
  }
  
  const response = await api.post('/quiz', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Update quiz
export const updateQuiz = async (quizId, quizData) => {
  const formData = new FormData();
  
  // Add text fields if they exist
  if (quizData.title) formData.append('title', quizData.title);
  if (quizData.description) formData.append('description', quizData.description);
  
  // Add category IDs if they exist
  if (quizData.categoryIds && quizData.categoryIds.length > 0) {
    formData.append('categoryIds', JSON.stringify(quizData.categoryIds));
  }
  
  // Add settings if they exist
  if (quizData.settings) {
    formData.append('settings', JSON.stringify(quizData.settings));
  }
  
  // Add image if it exists
  if (quizData.image) {
    formData.append('image', quizData.image);
  }
  
  const response = await api.put(`/quiz/${quizId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Delete quiz
export const deleteQuiz = async (quizId) => {
  const response = await api.delete(`/quiz/${quizId}`);
  return response.data;
};

// Add question to quiz
export const addQuestion = async (quizId, questionData) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', questionData.title);
  formData.append('text', questionData.text);
  formData.append('type', questionData.type);
  
  // Add answers array
  formData.append('answers', JSON.stringify(questionData.answers));
  
  // Add optional fields if they exist
  if (questionData.time_limit) formData.append('time_limit', questionData.time_limit);
  if (questionData.max_points) formData.append('max_points', questionData.max_points);
  
  // Add image if it exists
  if (questionData.image) {
    formData.append('image', questionData.image);
  }
  
  const response = await api.post(`/quiz/${quizId}/questions`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Remove question from quiz
export const removeQuestion = async (quizId, questionId) => {
  const response = await api.delete(`/quiz/${quizId}/questions/${questionId}`);
  return response.data;
};

// Publish quiz
export const publishQuiz = async (quizId) => {
  const response = await api.post(`/quiz/${quizId}/publish`);
  return response.data;
};

// Submit quiz attempt (single player)
export const submitQuizAttempt = async (quizId, scoreData) => {
  const response = await api.post(`/quiz/${quizId}/attempt`, {
    score: scoreData,
  });
  return response.data;
};

// Get quiz leaderboard
export const getQuizLeaderboard = async (quizId) => {
  const response = await api.get(`/quiz/${quizId}/leaderboard`);
  return response.data;
};

// Get all categories
export const getCategories = async () => {
  const response = await api.get('/quiz/categories');
  return response.data;
};

// Create category (admin only)
export const createCategory = async (categoryData) => {
  const response = await api.post('/quiz/categories', categoryData);
  return response.data;
};