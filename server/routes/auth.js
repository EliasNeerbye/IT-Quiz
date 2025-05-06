const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { isAuthenticated } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', isAuthenticated, authController.getCurrentUser);
router.post('/logout', isAuthenticated, authController.logout);
router.delete('/account', isAuthenticated, authController.deleteAccount);

module.exports = router;