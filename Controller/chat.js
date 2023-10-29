const asyncHandler = require('express-async-handler');
const Chat = require('../Models/ChatModel');
const User = require('../Models/User');

const AccessChat = asyncHandler(async (req, res) => {
    let success = false
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success, error: "No User Provided" })
    }
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { user: { $elemMatch: { $eq: req.user.id } } },
            { user: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("user", "-password").populate("latestMessage")
    console.log(isChat)
    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: "name email pic"
    })
    if (isChat.length > 0) {
        return res.status(200).json({ success: true, chat: isChat[0] })
    }
    else {
        const chatData = {
            isGroupChat: false,
            user: [req.user.id, userId],
            chatName: "Sender"
        }
        try {
            const chat = await Chat.create(chatData)
            const fullChat = await Chat.findOne({
                _id: chat.id
            }).populate("user", "-password")
            return res.status(200).json({ success: true, chat: fullChat })
        } catch (error) {
            return res.status(500).json({ success: false, error: "internal server error" })
        }
    }
})


const FetchChats = async (req, res) => {
    let success = false
    try {
        const chat = await Chat.find({
            user: { $elemMatch: { $eq: req.user.id } }
        }).populate("user", "-password")
            .populate("latestMessage")
            .populate("groupAdmin")
            .sort({ updatedAt: -1 })
        const FullChat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "name email pic"
        })
        return res.status(200).json({ success: true, chat: FullChat })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success,
            error: "Internal server error"
        })
    }
}

const createGroup = async (req, res) => {
    let success = false;
    const { usersArr, name } = req.body;
    if (!usersArr || !name) {
        return res.status(400).json({
            success,
            error: "Fill All credentials"
        })
    }
    const users = JSON.parse(usersArr)
    console.log(users, usersArr)
    users.push(req.user.id)

    if (users.length <= 2) {
        return res.status(400).json({
            success,
            error: "Group of less 3 people cannot be created"
        })
    }
    try {


        const groupChat = await Chat.create({
            isGroupChat: true,
            user: users,
            chatName: name,
            groupAdmin: req.user.id
        })
        const fullChat = await Chat.findOne({
            _id: groupChat.id
        }).populate("user", "-password").populate('groupAdmin', '-password')
        return res.status(200).json({ success: true, chat: fullChat })
    } catch (error) {
        console.log(error)

    }
}

const RenameGroup = async (req, res) => {
    let success = false;
    const { chatId, name } = req.body;
    if (!name || !chatId) {
        return res.status(400).json({
            success,
            error: "Fill All credentials"
        })
    }
    try {
        const updatedGroup = await Chat.findByIdAndUpdate(chatId, { chatName: name }, { new: true })
        const fullChat = await Chat.findOne({
            _id: updatedGroup.id
        }).populate("user", "-password").populate('groupAdmin', '-password')
        return res.status(200).json({ success: true, chat: fullChat })
    } catch (error) {
        res.status(500).json(("Internal Server error"))
    }
}

const AddGroup = async (req, res) => {
    let success = false;
    const { chatId, userId } = req.body;
    if (!userId || !chatId) {
        return res.status(400).json({
            success,
            error: "Fill All credentials"
        })
    }
    try {
        const updatedGroup = await Chat.findByIdAndUpdate(chatId, { $push: { user: userId } }, { new: true })
        if (!updatedGroup)
            return res.status(400).json({ success, error: "Chat not found" })
        const fullChat = await Chat.findOne({
            _id: updatedGroup.id
        }).populate("user", "-password").populate('groupAdmin', '-password')
        return res.status(200).json({ success: true, chat: fullChat })
    } catch (error) {
        res.status(500).json(("Internal Server error"))
        console.log(error)
    }
}
const RemoveGroup = async (req, res) => {
    let success = false;
    const { chatId, userId } = req.body;
    if (!userId || !chatId) {
        return res.status(400).json({
            success,
            error: "Fill All credentials"
        })
    }
    try {
        const updatedGroup = await Chat.findByIdAndUpdate(chatId, { $pull: { user: userId } }, { new: true })
        if (!updatedGroup)
            return res.status(400).json({ success, error: "Chat not found" })
        const fullChat = await Chat.findOne({
            _id: updatedGroup.id
        }).populate("user", "-password").populate('groupAdmin', '-password')
        return res.status(200).json({ success: true, chat: fullChat })
    } catch (error) {
        res.status(500).json(("Internal Server error"))
        console.log(error)
    }
}
module.exports = {
    AccessChat,
    FetchChats,
    createGroup,
    RenameGroup,
    AddGroup,
    RemoveGroup
}
