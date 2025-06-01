const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    author: String, // Email or username of the author
});

module.exports = mongoose.model('Post', postSchema);
