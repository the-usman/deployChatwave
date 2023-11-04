const mongoose = require('mongoose')

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


const ProjectSchema = new mongoose.Schema({
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    files: [{
        type: String,
    }],
    name: {
        type: String,
        required: true
    },
    data: {
        type: [mongoose.Schema.Types.Mixed]
    },
    thumbnail: {
        type: String
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'like'
        }
    ],
    contributors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    comment : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'comment'
        }
    ],
    score: [dailyScoreSchema], 
    lastLikes : [dailyLikeSchema],
    isCompleted : {
        type : Boolean,
        default : false
    },
    tags : [
        {
            type: String,
        }
    ],
    caption: {
        type: String,
    }
}, {
    timestamps: true
}
);


const Project = mongoose.model('project', ProjectSchema);

module.exports = Project;