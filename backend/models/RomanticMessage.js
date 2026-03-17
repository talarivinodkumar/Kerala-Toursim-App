const mongoose = require('mongoose');

const romanticMessageSchema = mongoose.Schema({
    title: {
        type: String,
        default: "For You ❤️"
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RomanticMessage', romanticMessageSchema);
