const mongoose = require('mongoose');

const dailyScoreSchema = new mongoose.Schema({
    date: {
        type: String,
        default: Date.now,
    },
    score: {
        type: Number,
        default: 0,
    },
});
const dailyLikeSchema = new mongoose.Schema({
    date: {
        type: String,
        default: Date.now,
    },
    likes: {
        type: Number,
        default: 0,
    },
});

const Post = new mongoose.Schema({
    caption: {
        type: String,
        required: true,
    },
    tags: [
        {
            type: String,
        },
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'like'
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment',
        },
    ],
    files: [
        {
            type: String,
        },
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user', 
    },
    score: [dailyScoreSchema], 
    thumbnail : {
        type : String,
    },
    isCompleted : {
        type : Boolean,
        default : false
    },
    dislike : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'dislike'
        }
    ],
    lastLikes : [dailyLikeSchema],
    totalLikes : {
        type : Number,
        default : 0
    },
    totalDislike : {
        type : Number,
        default : 0
    }
}, {
    timestamps: true,
});

const PostModel = mongoose.model('Post', Post);

module.exports = PostModel;