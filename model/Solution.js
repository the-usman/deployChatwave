const mongoose = require('mongoose');
const { Schema } = mongoose;

const SolutionSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    data: [
        {
            type: mongoose.Schema.Types.Mixed
        }
    ],
    boost: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issue' 
        }
    ],
    boostCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Solution = mongoose.model('solution', SolutionSchema);

module.exports = Solution;
