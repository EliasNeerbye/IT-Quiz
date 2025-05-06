const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Settings = require('../models/Settings');
const fileUtils = require('../utils/fileUtils');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json({ users });
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};

// Delete user by ID (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Don't allow admins to delete themselves through this route
        if (user._id.toString() === req.userId.toString()) {
            return res.status(400).json({ error: 'Use the account deletion route to delete your own account' });
        }
        
        await User.findByIdAndDelete(userId);
        
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Admin delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// Delete quiz by ID (admin only)
exports.deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        if (!quizId) {
            return res.status(400).json({ error: 'Quiz ID is required' });
        }
        
        // Find the quiz with its questions
        const quiz = await Quiz.findById(quizId).populate('questions');
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Delete quiz image if exists
        if (quiz.image) {
            fileUtils.deleteFile(quiz.image);
        }
        
        // Delete all questions and their images
        for (const question of quiz.questions) {
            if (question.image) {
                fileUtils.deleteFile(question.image);
            }
            await Question.findByIdAndDelete(question._id);
        }
        
        // Delete the settings
        if (quiz.settings) {
            await Settings.findByIdAndDelete(quiz.settings);
        }
        
        // Delete the quiz
        await Quiz.findByIdAndDelete(quizId);
        
        // Remove from creator's quizzes array if creator exists
        if (quiz.creator) {
            await User.findByIdAndUpdate(quiz.creator, {
                $pull: { quizzes: quizId }
            });
        }
        
        res.json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        console.error('Admin delete quiz error:', err);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
};

// Get all quizzes (admin only)
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('creator', 'username email')
            .populate('category', 'name')
            .populate('settings')
            .select('title description image isDraft createdAt updatedAt category creator settings');
        
        res.json({ quizzes });
    } catch (err) {
        console.error('Get all quizzes error:', err);
        res.status(500).json({ error: 'Failed to retrieve quizzes' });
    }
};