const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz');
const { isAuthenticated } = require('../middleware/auth');


router.get('/public', quizController.getAllPublicQuizzes);
router.get('/categories', quizController.getCategories);


router.use(isAuthenticated);


router.get('/me', quizController.getUserQuizzes);
router.post('/', quizController.createQuiz);
router.get('/:quizId', quizController.getQuizById);
router.put('/:quizId', quizController.updateQuiz);
router.delete('/:quizId', quizController.deleteQuiz);


router.post('/:quizId/questions', quizController.addQuestion);
router.delete('/:quizId/questions/:questionId', quizController.removeQuestion);


router.post('/:quizId/publish', quizController.publishQuiz);


router.post('/:quizId/attempt', quizController.submitQuizAttempt);
router.get('/:quizId/leaderboard', quizController.getQuizLeaderboard);


router.post('/categories', quizController.createCategory);

module.exports = router;