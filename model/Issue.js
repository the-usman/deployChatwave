const mongoose = require('mongoose');
const { Schema } = mongoose;

const IssueSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'like'
        },
    ],
    solutions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'solution'
        }
    ],
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Issue = mongoose.model('issue', IssueSchema);

module.exports = Issue;
