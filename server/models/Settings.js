const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingsSchema = new Schema({
    private: {
        type: Boolean,
        default: false,
    },
    multiplayer: {
        type: Boolean,
        default: true,
    },
    default_time_limit: {
        type: Number,
        default: 60,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);