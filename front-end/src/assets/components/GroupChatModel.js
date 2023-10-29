import React, { useContext, useState } from 'react'
import axios from 'axios'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    useToast,
    FormControl,
    Input,
    Spinner,
    Box
} from '@chakra-ui/react'
import Context from '../../ChatContex/ChatContex'
import UserAvatar from './UserAvatar'
import Badage from './Badage'

const GroupChatModel = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [GroupChatName, setGroupChatName] = useState()
    const [selectedUser, setSelectedUser] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const toast = useToast()
    const { user, chats, setChats } = useContext(Context)
    const [loading, setLoading] = useState(false);
    const handleSearch = async (search1) => {
        setSearch(search1);
        if (!search1)
            return
        try {
            setLoading(true)
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
                title: 'Error!',
                description: "Faild to load sreach results",
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
            });
        }
    }
    const handleSubmit = async () => {
        try{
            const config = {
                headers: {
                    token: (user.token)
                }
            }
            const { data } = await axios.post(`http://localhost:5000/api/chat/group`,{
                name : GroupChatName,
                usersArr : JSON.stringify(selectedUser.map((u)=> u._id))
            }, config)
            setChats([data.chat, ...chats])

        } catch (error) {
            toast({
                title: 'Error!',
                description: "Faild to load sreach results",
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
            });
        }
    }

    const handleGroup = (user) => {
        if (selectedUser.includes(user)) {
            toast({
                title: 'Error',
                description: "User already added",
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
            });
            return
        }
        setSelectedUser([...selectedUser, user])
    }
    const handleDeleteName = (user) => {
        setSelectedUser(selectedUser.filter(u => u !== user))
        
    }
    return (
        <div>
            <span onClick={onOpen}>{children}</span>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize={'3xl'}
                        display={'flex'}
                        justifyContent={'center'}
                    >
                        Create Group
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display={'flex'}
                        alignItems={'center'}
                        flexDirection={'column'}
                    >
                        <FormControl>
                            <Input
                                placeholder='Chat Name'
                                mb={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder='Search User'
                                mb={3}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box
                            display={'flex'}
                            flexWarp={'wrap'}
                            w={'100%'}
                        >
                            {
                                selectedUser.map((user) => {

                                    return <Badage
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => {
                                            handleDeleteName(user)
                                        }}
                                    />
                                })

                            }
                        </Box>

                        {
                            loading ? (<Spinner />) : (
                                searchResults.slice(0, 4).map((result) => {
                                    return <UserAvatar
                                        key={result._id}
                                        user={result}
                                        handleFunction={() => {
                                            handleGroup(result)
                                        }
                                        }
                                    />
                                })
                            )
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='green' mr={3} onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>

    )
}

export default GroupChatModel
