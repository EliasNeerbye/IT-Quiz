const User = require('../models/User');
const argon2 = require('argon2');
const validator = require('validator');


exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        
        
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        
        
        const hashedPassword = await argon2.hash(password);
        
        
        const user = new User({
            email,
            username,
            password: hashedPassword
        });
        
        await user.save();
        
        
        req.session.userId = user._id;
        
        
        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        
        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        
        req.session.userId = user._id;
        
        res.json({
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};


exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Failed to get user data' });
    }
};


exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
};


exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.userId;
        
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        
        await User.findByIdAndDelete(userId);
        
        
        req.session.destroy();
        
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};