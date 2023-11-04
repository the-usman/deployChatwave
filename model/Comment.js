const mongoose = require('mongoose');

const CommentPost = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    post: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post' 
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post' 
    }
}, {
    timestamps: true
});



const Comment = mongoose.model('comment', CommentPost);

module.exports = Comment;




