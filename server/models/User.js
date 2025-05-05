const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    quizzes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Quiz',
        }
    ]
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);