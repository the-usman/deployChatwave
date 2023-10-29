import React, { useContext, useEffect, useState } from 'react'
import Context from '../../ChatContex/ChatContex'
import { Box, Button, Stack, useToast, Text } from '@chakra-ui/react'
import axios from 'axios'
import { AddIcon } from '@chakra-ui/icons'
import ChatLoading from './ChatLoading'
import GroupChatModel from './GroupChatModel'

const MyChat = ({ fetchAgain }) => {
    const [loggedUser, setLoggedUser] = useState()
    const { user, selectedChat, setSelectedChats, chats, setChats, getSender } = useContext(Context)
    const [now, setNow]= useState(false)
    const fetchChat = async () => {
        try {
            const config = {
                headers: {
                    token: (user.token),
                    "Content-Type": "application/json"
                }
            }
            const { data } = await axios.get('/api/chat', config)

            setChats(data.chat)
        } catch (error) {
            toast({
                title: 'Error To Search Account',
                description: "Some error occured",
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
            });
            console.log(error)
        }
    }
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        setLoggedUser(userInfo)
        fetchChat();
        setNow(true)
    }, [fetchAgain])

    const toast = useToast();
    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems="center"
            p={3}
            bg="white"
            w={{ base: "100%", md: "31%" }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <Box
                pb={3}
                px={3}
                fontSize={{ base: '20px', md: '22px' }}
                display={'flex'}
                w={'100%'}
                justifyContent={'space-between'}
                alignItems={'center'}
                fontWeight={600}
                borderBottomWidth={1}
            >
                My Chats
                <GroupChatModel>
                    <Button
                        display={'flex'}
                        fontSize={{ base: "12px", md: '10px', lg: '12px' }}
                        rightIcon={<AddIcon />}
                    >
                        New Group
                    </Button>
                </GroupChatModel>
            </Box>
            <Box
                d="flex"
                flexDir="column"
                p={3}
                bg="#F8F8F8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
            >
                {
                    chats ? (
                        <Stack
                            overflowY={'scroll'}
                        >
                            {now &&
                                chats.map((chat) => {
                                    // console.log(chat.user)
                                    return (<Box
                                        onClick={() => {
                                            setSelectedChats(chat)
                                        }}
                                        bg={selectedChat === chat ? '#38AC38' : '#E8E8E8'}
                                        color={selectedChat === chat ? 'white' : 'black'}
                                        px={3}
                                        py={2}
                                        borderRadius={'lg'}
                                        key={chat._id}
                                        cursor={'pointer'}
                                    // w={'300px'}
                                    >
                                        <Text
                                            fontWeight={600}
                                            fontSize={'15px'}
                                        >
                                            {!chat.isGroupChat ?(getSender(loggedUser, chat.user)) : (
                                                chat.chatName
                                            )
                                            }
                                            
                                        </Text>
                                    </Box>)
                                })}

                        </Stack>
                    ) : (
                        <ChatLoading />
                    )
                }
            </Box>
        </Box>
    )
}

export default MyChat
