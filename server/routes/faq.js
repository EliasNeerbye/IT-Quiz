const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faq');
const { isAuthenticated } = require('../middleware/auth');


router.get('/', faqController.getAllFAQs);


router.use(isAuthenticated);

router.post('/', faqController.addFAQ);
router.put('/:faqId', faqController.updateFAQ);
router.delete('/:faqId', faqController.deleteFAQ);

module.exports = router;