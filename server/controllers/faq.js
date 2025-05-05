const FAQ = require('../models/FAQ');

const getAllFAQs = async (req, res) => {
    try {
        const { isAdmin } = req.query;
        let query = {};
        
        // If not an admin, only show general FAQs
        if (req.session.userRole !== 'admin' || isAdmin !== 'true') {
            query.isForAdmin = false;
        }
        
        const faqs = await FAQ.find(query);
        res.json({ faqs });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const createFAQ = async (req, res) => {
    try {
        const { question, answer, category, isForAdmin } = req.body;
        const faq = await FAQ.create({
            question,
            answer,
            category,
            isForAdmin: isForAdmin || false
        });
        
        res.status(201).json({ faq });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateFAQ = async (req, res) => {
    try {
        const { question, answer, category, isForAdmin } = req.body;
        const faq = await FAQ.findByIdAndUpdate(
            req.params.id,
            { question, answer, category, isForAdmin },
            { new: true }
        );
        
        if (!faq) return res.status(404).json({ error: 'FAQ not found' });
        res.json({ faq });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ not found' });
        
        await faq.deleteOne();
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getAllFAQs, createFAQ, updateFAQ, deleteFAQ };