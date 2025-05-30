const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['multiple-choice', 'true-false'],
        required: true,
    },
    answers: [{
        text: String,
        isCorrect: Boolean,
    }],
    image: {
        type: String,
        default: null,
    },
    time_limit: {
        type: Number,
        default: 0,
    },
    max_points: {
        type: Number,
        default: 1000,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Question', questionSchema);