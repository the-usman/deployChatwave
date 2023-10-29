const mongoose = require('mongoose')
const {Schema} = mongoose;

const UserModel = new Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password :{
        type : String,
        required : true
    },
    pic : {
        type : String,
        default : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"

    }
},
{
    timestamps : true
})

const User = mongoose.model("User", UserModel);

module.exports = User