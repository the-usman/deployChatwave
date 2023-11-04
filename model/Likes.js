const mongoose = require('mongoose');

const LikeModel = new mongoose.Schema({
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }
    ,
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    
}, {
    timestamps: true
})

const like = mongoose.model('like', LikeModel);

module.exports = like;