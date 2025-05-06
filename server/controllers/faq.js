const FAQ = require('../models/FAQ');


exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ order: 1 });
        res.json({ faqs });
    } catch (err) {
        console.error('Get FAQs error:', err);
        res.status(500).json({ error: 'Failed to retrieve FAQs' });
    }
};


exports.addFAQ = async (req, res) => {
    try {
        
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin privileges required' });
        }
        
        const { question, answer, order } = req.body;
        
        if (!question || !answer) {
            return res.status(400).json({ error: 'Question and answer are required' });
        }
        
        const faq = new FAQ({
            question,
            answer,
            order: order || 0
        });
        
        await faq.save();
        
        res.status(201).json({
            message: 'FAQ added successfully',
            faq
        });
    } catch (err) {
        console.error('Add FAQ error:', err);
        res.status(500).json({ error: 'Failed to add FAQ' });
    }
};


exports.updateFAQ = async (req, res) => {
    try {
        
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin privileges required' });
        }
        
        const { faqId } = req.params;
        const { question, answer, order } = req.body;
        
        const faq = await FAQ.findById(faqId);
        
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        
        if (question) faq.question = question;
        if (answer) faq.answer = answer;
        if (order !== undefined) faq.order = order;
        
        await faq.save();
        
        res.json({
            message: 'FAQ updated successfully',
            faq
        });
    } catch (err) {
        console.error('Update FAQ error:', err);
        res.status(500).json({ error: 'Failed to update FAQ' });
    }
};


exports.deleteFAQ = async (req, res) => {
    try {
        
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin privileges required' });
        }
        
        const { faqId } = req.params;
        
        const faq = await FAQ.findById(faqId);
        
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        
        await FAQ.findByIdAndDelete(faqId);
        
        res.json({ message: 'FAQ deleted successfully' });
    } catch (err) {
        console.error('Delete FAQ error:', err);
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
};