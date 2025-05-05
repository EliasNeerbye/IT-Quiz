const User = require('../models/User');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            userId, 
            { role },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Don't allow admins to delete themselves
        if (user._id.toString() === req.session.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getAllUsers, updateUserRole, deleteUser };