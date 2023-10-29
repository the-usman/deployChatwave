import React, { useContext, useState } from 'react'
import Context from '../../ChatContex/ChatContex';
import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Spinner, Text, Tooltip, useToast } from '@chakra-ui/react';
import { Search2Icon, BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure
} from '@chakra-ui/react'
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from './ChatLoading';
import UserAvatar from './UserAvatar';
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
function SideDrawer() {


    const { isOpen, onOpen, onClose } = useDisclosure()
    const { user, setSelectedChats, chats, setChats, notification, setNotification, getSender } = useContext(Context)
    const navigate = useNavigate()

    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChats, setLoadingChats] = useState(false);
    const handleLogout = () => {
        localStorage.removeItem('userInfo')
        setSelectedChats("")
        setChats("")
        navigate('/')
    }
    const toast = useToast()
    const HandleSearch = async () => {
        setLoading(true);
        if (!search) {
            toast({
                title: 'Error To Search Account',
                description: "Please enter some to search",
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
            });
        }
        try {
            const config = {
                headers: {
                    token: (user.token)
                }
            }
            const { data } = await axios.get(`/api/user?search=${search}`, config)
            setLoading(false)
            setSearchResults(data)


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
    const accessChat = async (userId) => {
        setLoadingChats(true)
        try {
            const config = {
                headers: {
                    token: (user.token),
                    "Content-Type": "application/json"
                }
            }
            const { data } = await axios.post('/api/chat', { userId }, config)
            if (!chats.find((c) => c._id === data.chat._id)) setChats([data.chat, ...chats]);
            setSelectedChats(data.chat)
            console.log(data.chat)
            setLoadingChats(false)
            console.log(data.chat)
            onClose();
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
    return (
        <>
            <Box
                bg={'White'}
                justifyContent={'space-between'}
                alignItems={'center'}
                p={'5px 10px 5px 5px'}
                width={'100%'}
                display={'flex'}
            >
                <Tooltip
                    label="Search Yours Friends"
                    hasArrow
                    placement='bottom-end'
                >
                    <Button
                        variant={'ghost'}
                        onClick={onOpen}
                    >
                        <Search2Icon />
                        <Text
                            display={{ base: 'none', md: 'flex' }}
                            px={1}
                        >
                            Search Friends
                        </Text>
                    </Button>

                </Tooltip>
                <Text
                    fontSize={'2xl'}
                    fontWeight={600}
                >
                    ChatWave
                </Text>
                <div>
                    <Menu>
                        <MenuButton
                            fontSize={'2xl'}
                            mr={3}
                        >
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No New Messages"}
                            {notification.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        setSelectedChats(notif.chat);
                                        setNotification(notification.filter((n) => n !== notif));
                                    }}
                                >
                                    {notif.chat.isGroupChat
                                        ? `New Message in ${notif.chat.chatName}`
                                        : `New Message from ${getSender(user, notif.chat.user)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size={'sm'}
                                cursor={'pointer'}
                                name={user.name}
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem >My Profile</MenuItem>
                            </ProfileModal>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>

                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay>
                    <DrawerContent>
                        <DrawerHeader borderBottomWidth={'1px'}>
                            Search Your Friends
                        </DrawerHeader>
                        <DrawerBody>
                            <Box pb={2} display={'flex'}>
                                <Input
                                    placeholder='Search by email or name'
                                    mr={2}
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value) }}
                                />
                                <Button onClick={HandleSearch}>Go</Button>
                            </Box>
                            {loading ? (<ChatLoading />)
                                : (
                                    searchResults.map((result) => {
                                        return <UserAvatar
                                            key={result._id}
                                            user={result}
                                            handleFunction={() => {
                                                accessChat(result._id)
                                            }
                                            }
                                        />
                                    })
                                )}
                            {loadingChats && <Spinner
                                ml={'auto'}
                                display={'flex'}
                            />}
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </>
    )
}

export default SideDrawer
