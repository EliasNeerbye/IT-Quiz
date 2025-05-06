const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { isAuthenticated, isAdmin } = require('../middleware/auth');


router.use(isAuthenticated, isAdmin);

router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/quizzes', adminController.getAllQuizzes);
router.delete('/quizzes/:quizId', adminController.deleteQuiz);

module.exports = router;