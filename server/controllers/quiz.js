const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Settings = require('../models/Settings');
const QuizAttempt = require('../models/Quiz_Attempt');
const Category = require('../models/Category');

const createQuiz = async (req, res) => {
    try {
        const { title, description, questions, settings: settingsData } = req.body;
        const settings = await Settings.create(settingsData);
        
        const quiz = await Quiz.create({
            title,
            description,
            creator: req.session.userId,
            settings: settings._id
        });

        const questionDocs = await Question.insertMany(
            questions.map(q => ({ ...q, quiz: quiz._id }))
        );

        quiz.questions = questionDocs.map(q => q._id);
        await quiz.save();

        res.status(201).json({ quiz });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('questions')
            .populate('settings')
            .populate('creator', 'username');

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        res.json({ quiz });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const submitQuizAttempt = async (req, res) => {
    try {
        const { answers, isMultiplayer } = req.body;
        const quiz = await Quiz.findById(req.params.id).populate('questions');
        
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        let correctAnswers = 0;
        let points = 0;

        answers.forEach((answer, idx) => {
            const question = quiz.questions[idx];
            if (isMultiplayer) {
                points += calculateMultiplayerPoints(answer, question);
            } else if (isAnswerCorrect(answer, question)) {
                correctAnswers++;
            }
        });

        const attempt = await QuizAttempt.create({
            user: req.session.userId,
            quiz: quiz._id,
            isMultiplayer,
            score: {
                points: isMultiplayer ? points : 0,
                correctAnswers,
                totalQuestions: quiz.questions.length
            }
        });

        res.json({ attempt });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const calculateMultiplayerPoints = (answer, question) => {
    if (!isAnswerCorrect(answer, question)) return 0;
    return question.max_points;
};

const isAnswerCorrect = (answer, question) => {
    switch (question.type) {
        case 'multiple-choice':
        case 'true-false':
            return question.answers.find(a => a.isCorrect)?.text === answer;
        case 'correct-order':
            return JSON.stringify(answer) === JSON.stringify(question.answers.map(a => a.text));
        default:
            return false;
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        
        if (quiz.creator.toString() !== req.session.userId && 
            req.session.userRole !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await Question.deleteMany({ _id: { $in: quiz.questions } });
        await Settings.findByIdAndDelete(quiz.settings);
        await QuizAttempt.deleteMany({ quiz: quiz._id });
        await quiz.deleteOne();

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getQuizzes = async (req, res) => {
    try {
        const { category, creator, search } = req.query;
        let query = {};
        
        // Filter by category if provided
        if (category) {
            query.category = category;
        }
        
        // Filter by creator if provided
        if (creator) {
            query.creator = creator;
        }
        
        // Search by title or description if provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const quizzes = await Quiz.find(query)
            .populate('creator', 'username')
            .populate('category', 'name')
            .populate('settings')
            .sort({ createdAt: -1 });
        
        res.json({ quizzes });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description });
        res.status(201).json({ category });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { createQuiz, getQuiz, submitQuizAttempt, deleteQuiz, getQuizzes, getCategories, createCategory };