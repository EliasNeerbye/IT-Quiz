const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: null,
    },
    isDraft: {
        type: Boolean,
        default: true,
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question',
    }],
    settings: {
        type: Schema.Types.ObjectId,
        ref: 'Settings',
    },
    category: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    quiz_attempts: [{
        type: Schema.Types.ObjectId,
        ref: 'QuizAttempt',
    }]
}, {
    timestamps: true,
});

module.exports = mongoose.model('Quiz', quizSchema);