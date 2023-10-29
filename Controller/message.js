const Chat = require("../Models/ChatModel")
const Message = require("../Models/MessageModel")
const User = require("../Models/User")

const sendMessage = async (req, res)=>{
    const {content, chatId} = req.body
    if(!content || !chatId){
        res.status(400).json({success : false, error : "Fill all credentials"})
    }
    let newMessage = {
        sender : req.user.id,
        content : content,
        chat : chatId
    }

    try {
        let message = await Message.create(newMessage)
        message = await message.populate('sender', 'name, pic')
        message = await message.populate('chat')
        message = await User.populate(message, {
            path:'chat.user',
            select:'name pic email'
        })
        await Chat.findByIdAndUpdate(chatId, {
            llatestMessage : message
        })
        res.json(message)

    } catch (error) {
        console.log(error)
        res.status(500).json({success : false, error : "internal Server Error"})
    }
    
}

const allMessage = async (req, res)=> {
    try {
        const message = await Message.find({
            chat : req.params.chatId
        }).populate('sender', 'name pic email').populate('chat')
        res.json(message)
    } catch (error) {
        console.log(error)
        res.status(500).json({success : false, error : "internal Server Error"})
    }
}

module.exports = {
    sendMessage,
    allMessage
}