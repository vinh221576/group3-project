// models/Log.js
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String, // Ví dụ: 'LOGIN_SUCCESS', 'UPDATE_PROFILE', 'DELETE_USER'
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Log', LogSchema);