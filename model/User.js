const mongoose = require('mongoose')

const User = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pic: {
        type: String
    },
    username : {
        type: String,
        required: true
    },
    confirmationToken : {
        type : String
    },
    isConfirmed : {
        type : Boolean,
        default : false
    },
    isActive : {
        type : Boolean,
        default : false
    },
    isBlock : {
        type : Boolean,
        default : false
    },
    Bio : {
        type : String,
    },
    city : {
        type : String
    },
    bgPic : {
        type : String
    },
    institution : {
        type : String
    },
    name : {
        type : String,
        required : true
    },
    score: {
        type: Number,
    }
}, {
    timestamps: true,
    
})

const UserModel = mongoose.model('user', User);

module.exports = UserModel;