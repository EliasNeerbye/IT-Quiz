const argon2 = require('argon2');
const User = require('../models/User');
const validator = require('validator');

const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email' });
        }

        const hashedPassword = await argon2.hash(password);
        const user = await User.create({
            email,
            username,
            password: hashedPassword
        });

        req.session.userId = user._id;
        req.session.userRole = user.role;
        
        res.status(201).json({ 
            user: { 
                id: user._id, 
                email: user.email, 
                username: user.username,
                role: user.role 
            } 
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await argon2.verify(user.password, password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user._id;
        req.session.userRole = user.role;
        
        res.json({ 
            user: { 
                id: user._id, 
                email: user.email, 
                username: user.username,
                role: user.role 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        res.json({ message: 'Logged out successfully' });
    });
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { register, login, logout, getMe };