const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faqSchema = new Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: 'General',
    },
    isForAdmin: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('FAQ', faqSchema);