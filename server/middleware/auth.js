const User = require('../models/User');

exports.isAuthenticated = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        req.userId = user._id;
        req.userRole = user.role;
        next();
    } catch (err) {
        console.error('Authentication middleware error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin privileges required' });
    }
    next();
};