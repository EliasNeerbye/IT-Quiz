const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Settings = require('../models/Settings');
const Category = require('../models/Category');
const QuizAttempt = require('../models/Quiz_Attempt');
const User = require('../models/User');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fileUtils = require('../utils/fileUtils');


exports.getAllPublicQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ isDraft: false })
            .populate('creator', 'username')
            .populate('category', 'name')
            .populate('settings');
        
        
        const publicQuizzes = quizzes.filter(quiz => 
            !quiz.settings || !quiz.settings.private
        );
        
        res.json({ quizzes: publicQuizzes });
    } catch (err) {
        console.error('Get public quizzes error:', err);
        res.status(500).json({ error: 'Failed to retrieve quizzes' });
    }
};


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

exports.createQuiz = async (req, res) => {
    try {
        const { title, description } = req.body;
        let imagePath = null;
        
        // Debug logging to see exact format received
        console.log("Request body:", req.body);
        console.log("Category IDs received:", req.body.categoryIds);
        
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }
        
        // Handle image upload
        if (req.files && req.files.image) {
            try {
                imagePath = await fileUtils.handleImageUpload(req.files.image, 'quiz_');
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }
        
        // Parse category IDs with extra care
        let categoryIds = [];
        
        if (req.body.categoryIds) {
            // If it's already an array, use it
            if (Array.isArray(req.body.categoryIds)) {
                categoryIds = req.body.categoryIds;
            } 
            // If it's a single ID
            else if (typeof req.body.categoryIds === 'string') {
                // Check if it's a stringified array
                if (req.body.categoryIds.startsWith('[') && req.body.categoryIds.endsWith(']')) {
                    try {
                        const parsed = JSON.parse(req.body.categoryIds);
                        if (Array.isArray(parsed)) {
                            categoryIds = parsed;
                        } else {
                            categoryIds = [req.body.categoryIds];
                        }
                    } catch (e) {
                        // If parsing fails, use as is
                        categoryIds = [req.body.categoryIds];
                    }
                } else {
                    // Not a stringified array, use as is
                    categoryIds = [req.body.categoryIds];
                }
            }
        }
        
        // Create settings
        const settings = new Settings({
            private: false,
            multiplayer: true,
            default_time_limit: 60
        });
        
        await settings.save();
        
        // Create quiz with clean category IDs
        const quiz = new Quiz({
            title,
            description,
            image: imagePath,
            isDraft: true,
            settings: settings._id,
            creator: req.userId,
            category: categoryIds,
            questions: []
        });
        
        await quiz.save();
        
        // Update user's quizzes
        await User.findByIdAndUpdate(req.userId, {
            $push: { quizzes: quiz._id }
        });
        
        res.status(201).json({ 
            message: 'Quiz draft created successfully',
            quiz 
        });
    } catch (err) {
        console.error('Create quiz error:', err);
        res.status(500).json({ error: err.message || 'Failed to create quiz' });
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        // Get data from request body or use defaults
        const { title, description, categoryIds, settings } = req.body || {};
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only edit your own quizzes' });
        }
        
        if (!quiz.isDraft) {
            return res.status(400).json({ error: 'Published quizzes cannot be edited' });
        }
        
        if (req.files && req.files.image) {
            try {
                if (quiz.image) {
                    fileUtils.deleteFile(quiz.image);
                }
                
                const imagePath = await fileUtils.handleImageUpload(req.files.image, 'quiz_');
                quiz.image = imagePath;
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }
        
        // Only update properties if they are provided
        if (title !== undefined) quiz.title = title;
        if (description !== undefined) quiz.description = description;
        
        // Special handling for categoryIds
        if (categoryIds !== undefined) {
            // Handle empty array case properly
            if (categoryIds === '[]' || 
                (Array.isArray(categoryIds) && categoryIds.length === 0) ||
                (typeof categoryIds === 'string' && categoryIds.trim() === '[]')) {
                quiz.category = [];
            } else {
                quiz.category = categoryIds;
            }
        }
        
        await quiz.save();
        
        // Improved settings update logic
        if (settings && quiz.settings) {
            let settingsData = settings;
            
            // Parse settings if it's a string
            if (typeof settings === 'string') {
                try {
                    settingsData = JSON.parse(settings);
                } catch (e) {
                    return res.status(400).json({ error: 'Invalid settings format' });
                }
            }
            
            // Create a clean update object with only valid fields
            const settingsUpdate = {};
            if (settingsData.private !== undefined) settingsUpdate.private = Boolean(settingsData.private);
            if (settingsData.multiplayer !== undefined) settingsUpdate.multiplayer = Boolean(settingsData.multiplayer);
            if (settingsData.default_time_limit !== undefined) {
                settingsUpdate.default_time_limit = Number(settingsData.default_time_limit);
            }
            
            // Update settings with proper operators and options
            await Settings.findByIdAndUpdate(
                quiz.settings,
                { $set: settingsUpdate },
                { new: true, runValidators: true }
            );
        }
        
        // Return fully populated quiz with updated settings
        const updatedQuiz = await Quiz.findById(quizId)
            .populate('creator', 'username')
            .populate('category', 'name')
            .populate('settings');
        
        res.json({ 
            message: 'Quiz updated successfully',
            quiz: updatedQuiz 
        });
    } catch (err) {
        console.error('Update quiz error:', err);
        res.status(500).json({ error: err.message || 'Failed to update quiz' });
    }
};

exports.updateQuizSettings = async (req, res) => {
    try {
        const { quizId } = req.params;
        const settingsData = req.body;
        
        console.log("Received settings data:", settingsData); // Debug log
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only edit your own quizzes' });
        }
        
        if (!quiz.isDraft) {
            return res.status(400).json({ error: 'Published quizzes cannot be edited' });
        }
        
        if (!quiz.settings) {
            return res.status(404).json({ error: 'Settings not found for this quiz' });
        }
        
        const settingsUpdate = {};
        
        // Explicitly handle boolean conversions
        if (settingsData.private !== undefined) {
            settingsUpdate.private = settingsData.private === true;
        }
        
        if (settingsData.multiplayer !== undefined) {
            settingsUpdate.multiplayer = settingsData.multiplayer === true;
        }
        
        if (settingsData.default_time_limit !== undefined) {
            settingsUpdate.default_time_limit = Number(settingsData.default_time_limit);
        }
        
        console.log("Updating settings with:", settingsUpdate); // Debug log
        
        const updatedSettings = await Settings.findByIdAndUpdate(
            quiz.settings,
            { $set: settingsUpdate },
            { new: true, runValidators: true }
        );
        
        res.json({
            message: 'Quiz settings updated successfully',
            settings: updatedSettings
        });
    } catch (err) {
        console.error('Update settings error:', err);
        res.status(500).json({ error: 'Failed to update quiz settings' });
    }
};

exports.addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { title, text, type, answers, time_limit, max_points } = req.body;
        let imagePath = null;
        
        if (!title || !text || !type) {
            return res.status(400).json({ error: 'Title, text, and question type are required' });
        }
        
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only edit your own quizzes' });
        }
        
        
        if (!quiz.isDraft) {
            return res.status(400).json({ error: 'Published quizzes cannot be edited' });
        }
        
        
        if (req.files && req.files.image) {
            try {
                imagePath = await fileUtils.handleImageUpload(req.files.image, 'question_');
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }
        
        
        let parsedAnswers = answers;
        if (typeof answers === 'string') {
            try {
                parsedAnswers = JSON.parse(answers);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid answers format' });
            }
        }
        
        
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


exports.removeQuestion = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only edit your own quizzes' });
        }
        
        
        if (!quiz.isDraft) {
            return res.status(400).json({ error: 'Published quizzes cannot be edited' });
        }
        
        
        const question = await Question.findById(questionId);
        if (question && question.image) {
            
            fileUtils.deleteFile(question.image);
        }
        
        
        quiz.questions = quiz.questions.filter(
            q => q.toString() !== questionId
        );
        
        await quiz.save();
        
        
        await Question.findByIdAndDelete(questionId);
        
        res.json({ message: 'Question removed successfully' });
    } catch (err) {
        console.error('Remove question error:', err);
        res.status(500).json({ error: 'Failed to remove question' });
    }
};


exports.publishQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only publish your own quizzes' });
        }
        
        
        if (!quiz.isDraft) {
            return res.status(400).json({ error: 'Quiz is already published' });
        }
        
        
        if (quiz.questions.length === 0) {
            return res.status(400).json({ error: 'Quiz must have at least one question' });
        }
        
        
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


exports.deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        
        const quiz = await Quiz.findById(quizId).populate('questions');
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        
        if (quiz.creator.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You can only delete your own quizzes' });
        }
        
        
        if (quiz.image) {
            fileUtils.deleteFile(quiz.image);
        }
        
        
        for (const question of quiz.questions) {
            if (question.image) {
                fileUtils.deleteFile(question.image);
            }
            await Question.findByIdAndDelete(question._id);
        }
        
        
        await Settings.findByIdAndDelete(quiz.settings);
        
        
        await Quiz.findByIdAndDelete(quizId);
        
        
        await User.findByIdAndUpdate(req.userId, {
            $pull: { quizzes: quizId }
        });
        
        res.json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        console.error('Delete quiz error:', err);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
};


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


exports.getQuizLeaderboard = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        
        const attempts = await QuizAttempt.find({ quiz: quizId })
            .populate('user', 'username');
        
        
        attempts.sort((a, b) => b.score.points - a.score.points);
        
        res.json({
            leaderboard: attempts
        });
    } catch (err) {
        console.error('Get leaderboard error:', err);
        res.status(500).json({ error: 'Failed to retrieve leaderboard' });
    }
};


exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ categories });
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to retrieve categories' });
    }
};


exports.createCategory = async (req, res) => {
    try {
        
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