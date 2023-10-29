const mongoose = require('mongoose')
const {Schema} = mongoose

const ChatModel = new Schema({
    chatName : {
        type : String,
        trim : true
    },
    isGroupChat : {
        type : Boolean,
        defualt : false
    },
    user : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref  : 'User'
        }
    ],
    latestMessage : {
        type : mongoose.Schema.Types.ObjectId,
        ref :"Message"
    },
    groupAdmin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
},
{
    timestamps : true
})

const Chat = mongoose.model("Chat", ChatModel);

module.exports = Chat