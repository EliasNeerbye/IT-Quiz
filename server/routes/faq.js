const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faq');
const { isAuthenticated } = require('../middleware/auth');

// Public route (no authentication required)
router.get('/', faqController.getAllFAQs);

// Admin routes (require authentication)
router.use(isAuthenticated);

router.post('/', faqController.addFAQ);
router.put('/:faqId', faqController.updateFAQ);
router.delete('/:faqId', faqController.deleteFAQ);

module.exports = router;