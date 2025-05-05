const router = require('express').Router();
const { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } = require('../controllers/faq');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public route to get FAQs
router.get('/', getAllFAQs);

// Admin routes for FAQ management
router.post('/', isAuthenticated, isAdmin, createFAQ);
router.put('/:id', isAuthenticated, isAdmin, updateFAQ);
router.delete('/:id', isAuthenticated, isAdmin, deleteFAQ);

module.exports = router;