const router = require('express').Router();
const { createQuiz, getQuiz, getQuizzes, submitQuizAttempt, deleteQuiz, getCategories, createCategory } = require('../controllers/quiz');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/', getQuizzes); // Public route to list quizzes
router.post('/', isAuthenticated, createQuiz);
router.get('/categories', getCategories); // Get all categories
router.post('/categories', isAuthenticated, isAdmin, createCategory); // Create category (admin only)
router.get('/:id', isAuthenticated, getQuiz);
router.post('/:id/attempt', isAuthenticated, submitQuizAttempt);
router.delete('/:id', isAuthenticated, deleteQuiz);

module.exports = router;