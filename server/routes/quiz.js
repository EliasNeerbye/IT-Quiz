const router = require('express').Router();
const { createQuiz, getQuiz, submitQuizAttempt, deleteQuiz } = require('../controllers/quiz');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.post('/', isAuthenticated, createQuiz);
router.get('/:id', isAuthenticated, getQuiz);
router.post('/:id/attempt', isAuthenticated, submitQuizAttempt);
router.delete('/:id', isAuthenticated, deleteQuiz);

module.exports = router;