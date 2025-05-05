const router = require('express').Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/admin');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Apply both middleware to ensure only admins can access these routes
router.use(isAuthenticated, isAdmin);

router.get('/users', getAllUsers);
router.put('/users/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;