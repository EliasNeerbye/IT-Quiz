const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz');
const { isAuthenticated } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/public', quizController.getAllPublicQuizzes);
router.get('/categories', quizController.getCategories);

// Routes requiring authentication
router.use(isAuthenticated);

// Quiz CRUD
router.get('/me', quizController.getUserQuizzes);
router.post('/', quizController.createQuiz);
router.get('/:quizId', quizController.getQuizById);
router.put('/:quizId', quizController.updateQuiz);
router.delete('/:quizId', quizController.deleteQuiz);

// Quiz questions
router.post('/:quizId/questions', quizController.addQuestion);
router.delete('/:quizId/questions/:questionId', quizController.removeQuestion);

// Publishing
router.post('/:quizId/publish', quizController.publishQuiz);

// Quiz attempts
router.post('/:quizId/attempt', quizController.submitQuizAttempt);
router.get('/:quizId/leaderboard', quizController.getQuizLeaderboard);

// Category management (admin only)
router.post('/categories', quizController.createCategory);

module.exports = router;