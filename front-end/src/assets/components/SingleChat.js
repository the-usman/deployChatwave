import React, { useContext, useEffect, useState } from 'react'
import Context from '../../ChatContex/ChatContex'
import { IconButton, Box, Text, Spinner, FormControl, Input, useToast, } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import ProfileModal from './ProfileModal'
import axios from 'axios'
import UpdateGroupModal from './UpdateGroupModal'
import ScrollChat from './ScrollChat'
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from '../assests/images/typing.json'

const ENDPOINT = "https://chatwav.vercel.app/";
var socket, selectedChatCompare;
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false)
    const [newMessage, setNewMessage] = useState([]);
    const [typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const toast = useToast()
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };
    const { user, setSelectedChats, selectedChat, getSender, getSenderFull,notification, setNotification } = useContext(Context)
    const [socketConnected, setSocketConnected] = useState("");
    const fetchMessages = async () => {
        if (!selectedChat)
            return
        try {
            setLoading(true)
            const config = {
                headers: {
                    token: user.token,
                },
            };
            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );
            setMessages(data)
            setLoading(false)
            // socket = io(EndPoint);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            console.log(error)
            toast({
                title: "Error Occured!",
                description: "Failed to send the Message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }
    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        token: user.token,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat,
                    },
                    config
                );
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };
    useEffect(() => {
        socket = io(ENDPOINT);
        user._id = user.id
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on('typing', () => setIsTyping(true))
        socket.on('stop typing', () => setIsTyping(false))
        // eslint-disable-next-line
    }, []);

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    }


    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    }, [selectedChat]);


    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (
                !selectedChatCompare || 
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"

                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChats("")}
                        />{!selectedChat.isGroupChat ? (<>
                            {getSender(user, selectedChat.user)}
                            <ProfileModal
                                user={getSenderFull(user, selectedChat.user)}
                            />
                        </>
                        ) :
                            (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                                </>
                            )}
                    </Text>
                    <Box
                        display={'flex'}
                        flexDirection={'column'}
                        justifyContent={'flex-end'}
                        p={3}
                        bg={'#E8E8E8'}
                        w={'100%'}
                        h={'100%'}
                        borderRadius={'lg'}
                        overflow={'hidden '}
                    >
                        {
                            loading ? (<Spinner
                                size={'xl'}
                                w={50}
                                h={50}
                                alignSelf={'center'}
                                margin={'auto'}
                            />) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowY: 'scroll',
                                    scrollbarWidth: 'none',
                                }}>
                                    <ScrollChat messages={messages} />
                                </div>
                            )
                        }
                        <FormControl
                            onKeyDown={sendMessage}
                            isRequired
                            mt={3}
                        >
                            {isTyping ? <div><Lottie
                                options={defaultOptions}
                                width={70}
                                style={{ marginBottom: 15, marginLeft: 0,  position:'relative', marginTop:'30px' }}
                            /></div> : (<></>)}
                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Enter a message.."
                                value={newMessage}
                                onChange={typingHandler}
                            />
                        </FormControl>
                    </Box>
                </>)
                : (<Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="3xl" pb={3} >
                        Click on a user to start chatting
                    </Text>
                </Box>)
            }
        </>
    )
}

export default SingleChat
