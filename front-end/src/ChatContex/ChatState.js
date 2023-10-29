import { useEffect, useState } from "react";
import Context from "./ChatContex";
import { useNavigate } from "react-router-dom"

const ChatState = ({ children }) => {
    const [user, setUser] = useState("");
    const navigate = useNavigate()
    const [selectedChat, setSelectedChats] = useState(null)
    const [chats, setChats] = useState([])
    const [notification, setNotification] = useState([])
    useEffect(() => {
        const userDataString = localStorage.getItem('userInfo');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUser(userData);
        } else {
            console.log('User data not found in localStorage');
        }

        if (!userDataString) {
            navigate('/');
        }
    }, []);
    const getSender = (loggedUser, chatUser) => {
        if (chatUser && Array.isArray(chatUser) && chatUser.length >= 2) {
            return loggedUser.id === chatUser[0]._id ? chatUser[1].name : chatUser[0].name;
        } else {
            return 'Unknown Sender';
        }
    }
    const getSenderFull = (loggedUser, chatUser) => {
        // return chatUser[1];
            return loggedUser.id === chatUser[0]._id ? chatUser[1] : chatUser[0];
    }

    const isSameSender = (messages, m, i, userId) => {
        return (
            i < messages.length - 1 &&
            (messages[i + 1].sender._id !== m.sender._id ||
                messages[i + 1].sender._id === undefined) &&
            messages[i].sender._id !== userId
        );
    };
    const isLastMessage = (messages, i, userId) => {
        return (
            i === messages.length - 1 &&
            messages[messages.length - 1].sender._id !== userId &&
            messages[messages.length - 1].sender._id
        );
    };
    const isSameSenderMargin = (messages, m, i, userId) => {


        if (
            i < messages.length - 1 &&
            messages[i + 1].sender._id === m.sender._id &&
            messages[i].sender._id !== userId
        )
            return 33;
        else if (
            (i < messages.length - 1 &&
                messages[i + 1].sender._id !== m.sender._id &&
                messages[i].sender._id !== userId) ||
            (i === messages.length - 1 && messages[i].sender._id !== userId)
        )
            return 0;
        else return "auto";
    };
    const isSameUser = (messages, m, i) => {
        return i > 0 && messages[i - 1].sender._id === m.sender._id;
    };
    return (
        <Context.Provider value={{ user, selectedChat, setSelectedChats, chats, setChats, getSender, getSenderFull, isSameSender, isLastMessage, isSameSenderMargin, isSameUser, notification, setNotification }}>
            {children}
        </Context.Provider>
    )
}

export default ChatState;