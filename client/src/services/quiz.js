import api from './api';


export const getPublicQuizzes = async () => {
  const response = await api.get('/quiz/public');
  return response.data;
};


export const getUserQuizzes = async () => {
  const response = await api.get('/quiz/me');
  return response.data;
};


export const getQuizById = async (quizId) => {
  const response = await api.get(`/quiz/${quizId}`);
  return response.data;
};

export const createQuiz = async (quizData) => {
  // We'll handle FormData construction here to ensure consistency
  const formData = new FormData();
  
  // Add basic text fields
  formData.append('title', quizData.title);
  formData.append('description', quizData.description);
  
  // Handle categories - ensure they're sent as individual strings
  if (quizData.categoryIds && quizData.categoryIds.length > 0) {
    // Clear out any previous categoryIds values
    for (let i = 0; i < quizData.categoryIds.length; i++) {
      formData.append('categoryIds', quizData.categoryIds[i]);
    }
  }
  
  // Handle image if present
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

export const updateQuiz = async (quizId, quizData) => {
  if (quizData instanceof FormData) {
    const response = await api.put(`/quiz/${quizId}`, quizData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } 
  else {
    const response = await api.put(`/quiz/${quizId}`, quizData);
    return response.data;
  }
};

export const updateQuizSettings = async (quizId, settingsData) => {
  // Explicitly convert boolean values to ensure they're sent correctly
  const data = {
    ...settingsData,
    private: settingsData.private === true,
    multiplayer: settingsData.multiplayer === true
  };
  
  console.log("Sending settings data:", data); // Debug log
  const response = await api.put(`/quiz/${quizId}/settings`, data);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await api.delete(`/quiz/${quizId}`);
  return response.data;
};


export const addQuestion = async (quizId, questionData) => {
  const formData = new FormData();
  
  
  formData.append('title', questionData.title);
  formData.append('text', questionData.text);
  formData.append('type', questionData.type);
  
  
  formData.append('answers', JSON.stringify(questionData.answers));
  
  
  if (questionData.time_limit) formData.append('time_limit', questionData.time_limit);
  if (questionData.max_points) formData.append('max_points', questionData.max_points);
  
  
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


export const removeQuestion = async (quizId, questionId) => {
  const response = await api.delete(`/quiz/${quizId}/questions/${questionId}`);
  return response.data;
};


export const publishQuiz = async (quizId) => {
  const response = await api.post(`/quiz/${quizId}/publish`);
  return response.data;
};


export const submitQuizAttempt = async (quizId, scoreData) => {
  const response = await api.post(`/quiz/${quizId}/attempt`, {
    score: scoreData,
  });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/quiz/categories');
  return response.data;
};


export const createCategory = async (categoryData) => {
  const response = await api.post('/quiz/categories', categoryData);
  return response.data;
};