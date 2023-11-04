const mongoose = require('mongoose');

const dislikeModel = new mongoose.Schema({
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

const dislike = mongoose.model('dislike', dislikeModel);

module.exports = dislike;