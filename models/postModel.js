const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Untitled'
    },
    body: {
        type: String,
        required: [true, 'Body is required']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;