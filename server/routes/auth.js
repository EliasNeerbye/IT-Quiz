const router = require('express').Router();
const { register, login, logout, getMe } = require('../controllers/auth');
const { isAuthenticated } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', isAuthenticated, logout);
router.get('/me', isAuthenticated, getMe);

module.exports = router;