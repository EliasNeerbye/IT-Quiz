const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizAttemptSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    isMultiplayer: {
        type: Boolean,
        required: true,
        default: false
    },
    score: {
        points: {
            type: Number,
            required: true
        },
        correctAnswers: {
            type: Number,
            required: true
        },
        totalQuestions: {
            type: Number,
            required: true
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);