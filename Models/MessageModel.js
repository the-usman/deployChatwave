const mongoose = require('mongoose');
const {Schema} = mongoose;

const MessageModel = new Schema({
    content : {
        type : String,
        trim : true,
    },
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    chat : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Chat"
    }

},
{
    timestamps : true
})

const Message = mongoose.model("Message" , MessageModel)

module.exports = Message;