const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Settings = require('../models/Settings');
const Category = require('../models/Category');
const QuizAttempt = require('../models/Quiz_Attempt');
const User = require('../models/User');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fileUtils = require('../utils/fileUtils');

// Get all public quizzes
exports.getAllPublicQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ isDraft: false })
            .populate('creator', 'username')
            .populate('category', 'name')
            .populate('settings');
        
        // Filter out private quizzes
        const publicQuizzes = quizzes.filter(quiz => 
            !quiz.settings || !quiz.settings.private
        );
        
        res.json({ quizzes: publicQuizzes });
    } catch (err) {
        console.error('Get public quizzes error:', err);
        res.status(500).json({ error: 'Failed to retrieve quizzes' });
    }
};

// Get all user's quizzes (drafts and published)
exports.getUserQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ creator: req.userId })
            .populate('creator', 'username')
            .populate('category', 'name')
            .populate('settings');
        
        res.json({ quizzes });
    } catch (err) {
        console.error('Get user quizzes error:', err);
        res.status(500).json({ error: 'Failed to retrieve your quizzes' });
    }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        const quiz = await Quiz.findById(quizId)
            .populate('creator', 'username')
            .populate('category', 'name')
            .populate('settings')
            .populate('questions');
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Check if the quiz is private and user is not the creator
        if (quiz.settings && quiz.settings.private && 
            quiz.creator._id.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'This quiz is private' });
        }
        
        res.json({ quiz });
    } catch (err) {
        console.error('Get quiz error:', err);
        res.status(500).json({ error: 'Failed to retrieve quiz' });
    }
};

// Create new quiz (draft)
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, categoryIds } = req.body;
        let imagePath = null;
        
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }
        
        // Handle image upload if exists
        if (req.files && req.files.image) {
            try {
                imagePath = await fileUtils.handleImageUpload(req.files.image, 'quiz_');
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }
        
        // Create default settings
        const settings = new Settings({
            private: false,
            multiplayer: true,
            default_time_limit: 60
        });
        
        await settings.save();
        
        // Create quiz with draft status
        const quiz = new Quiz({
            title,
            description,
            image: imagePath,
            isDraft: true,
            settings: settings._id,
            creator: req.userId,
            category: categoryIds || [],
            questions: []
        });
        
        await quiz.save();
        
        // Update user's quizzes array
        await User.findByIdAndUpdate(req.userId, {
            $push: { quizzes: quiz._id }
        });
        
        res.status(201).json({ 
            message: 'Quiz draft created successfully',
            quiz 
        });
    } catch (err) {
        console.error('Create quiz error:', err);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
};

// Update quiz (only if draft)
exports.updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { title, description, categoryIds, settings } = req.body;
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Check if user is the creator
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only edit your own quizzes' });
        }
        
        // Check if quiz is still a draft
        if (!quiz.isDraft) {
            return res.status(400).json({ error: 'Published quizzes cannot be edited' });
        }
        
        // Handle image upload if exists
        if (req.files && req.files.image) {
            try {
                // Delete old image if exists
                if (quiz.image) {
                    fileUtils.deleteFile(quiz.image);
                }
                
                // Upload new image
                const imagePath = await fileUtils.handleImageUpload(req.files.image, 'quiz_');
                quiz.image = imagePath;
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }
        
        // Update quiz properties
        if (title) quiz.title = title;
        if (description) quiz.description = description;
        if (categoryIds) quiz.category = categoryIds;
        
        await quiz.save();
        
        // Update settings if provided
        if (settings) {
            await Settings.findByIdAndUpdate(quiz.settings, settings);
        }
        
        res.json({ 
            message: 'Quiz updated successfully',
            quiz 
        });
    } catch (err) {
        console.error('Update quiz error:', err);
        res.status(500).json({ error: 'Failed to update quiz' });
    }
};

// Add question to quiz
exports.addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { title, text, type, answers, time_limit, max_points } = req.body;
        let imagePath = null;
        
        if (!title || !text || !type) {
            return res.status(400).json({ error: 'Title, text, and question type are required' });
        }
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Check if user is the creator
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only edit your own quizzes' });
        }
        
        // Check if quiz is still a draft
        if (!quiz.isDraft) {
            return res.status(400).json({ error: 'Published quizzes cannot be edited' });
        }
        
        // Handle image upload if exists
        if (req.files && req.files.image) {
            try {
                imagePath = await fileUtils.handleImageUpload(req.files.image, 'question_');
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }
        
        // Parse the answers if they're sent as a string
        let parsedAnswers = answers;
        if (typeof answers === 'string') {
            try {
                parsedAnswers = JSON.parse(answers);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid answers format' });
            }
        }
        
        // Create the question
        const question = new Question({
            title,
            text,
            type,
            answers: parsedAnswers || [],
            image: imagePath,
            time_limit: time_limit || 0,
            max_points: max_points || 1000
        });
        
        await question.save();
        
        // Add question to quiz
        quiz.questions.push(question._id);
        await quiz.save();
        
        res.status(201).json({
            message: 'Question added successfully',
            question
        });
    } catch (err) {
        console.error('Add question error:', err);
        res.status(500).json({ error: 'Failed to add question' });
    }
};

// Remove question from quiz
exports.removeQuestion = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Check if user is the creator
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only edit your own quizzes' });
        }
        
        // Check if quiz is still a draft
        if (!quiz.isDraft) {
            return res.status(400).json({ error: 'Published quizzes cannot be edited' });
        }
        
        // Find the question first to get its image if it exists
        const question = await Question.findById(questionId);
        if (question && question.image) {
            // Delete the image file
            fileUtils.deleteFile(question.image);
        }
        
        // Remove question from quiz
        quiz.questions = quiz.questions.filter(
            q => q.toString() !== questionId
        );
        
        await quiz.save();
        
        // Delete the question
        await Question.findByIdAndDelete(questionId);
        
        res.json({ message: 'Question removed successfully' });
    } catch (err) {
        console.error('Remove question error:', err);
        res.status(500).json({ error: 'Failed to remove question' });
    }
};

// Publish quiz
exports.publishQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Check if user is the creator
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only publish your own quizzes' });
        }
        
        // Check if quiz is still a draft
        if (!quiz.isDraft) {
            return res.status(400).json({ error: 'Quiz is already published' });
        }
        
        // Check if quiz has questions
        if (quiz.questions.length === 0) {
            return res.status(400).json({ error: 'Quiz must have at least one question' });
        }
        
        // Publish the quiz
        quiz.isDraft = false;
        await quiz.save();
        
        res.json({
            message: 'Quiz published successfully',
            quiz
        });
    } catch (err) {
        console.error('Publish quiz error:', err);
        res.status(500).json({ error: 'Failed to publish quiz' });
    }
};

// Delete quiz (user's own)
exports.deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId).populate('questions');
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Check if user is the creator
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only delete your own quizzes' });
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
        await Settings.findByIdAndDelete(quiz.settings);
        
        // Delete the quiz
        await Quiz.findByIdAndDelete(quizId);
        
        // Remove from user's quizzes array
        await User.findByIdAndUpdate(req.userId, {
            $pull: { quizzes: quizId }
        });
        
        res.json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        console.error('Delete quiz error:', err);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
};

// Submit quiz attempt (single player)
exports.submitQuizAttempt = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { score } = req.body;
        
        if (!score || typeof score !== 'object') {
            return res.status(400).json({ error: 'Valid score object is required' });
        }
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Create quiz attempt
        const quizAttempt = new QuizAttempt({
            user: req.userId,
            quiz: quizId,
            isMultiplayer: false,
            score: {
                points: score.points || 0,
                correctAnswers: score.correctAnswers || 0,
                totalQuestions: score.totalQuestions || quiz.questions.length
            }
        });
        
        await quizAttempt.save();
        
        // Add attempt to quiz
        quiz.quiz_attempts.push(quizAttempt._id);
        await quiz.save();
        
        res.status(201).json({
            message: 'Quiz attempt submitted successfully',
            quizAttempt
        });
    } catch (err) {
        console.error('Submit quiz attempt error:', err);
        res.status(500).json({ error: 'Failed to submit quiz attempt' });
    }
};

// Get quiz leaderboard
exports.getQuizLeaderboard = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Get all attempts for this quiz
        const attempts = await QuizAttempt.find({ quiz: quizId })
            .populate('user', 'username');
        
        // Sort by points (highest first)
        attempts.sort((a, b) => b.score.points - a.score.points);
        
        res.json({
            leaderboard: attempts
        });
    } catch (err) {
        console.error('Get leaderboard error:', err);
        res.status(500).json({ error: 'Failed to retrieve leaderboard' });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ categories });
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to retrieve categories' });
    }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
    try {
        // Check if user is admin
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin privileges required' });
        }
        
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        
        const category = new Category({
            name,
            description: description || ''
        });
        
        await category.save();
        
        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (err) {
        console.error('Create category error:', err);
        res.status(500).json({ error: 'Failed to create category' });
    }
};