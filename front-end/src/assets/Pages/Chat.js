import React, { useContext, useState } from 'react'
import ChatContext from '../../ChatContex/ChatContex';
import {Box} from '@chakra-ui/react'
import SideDrawer from '../components/SideDrawer';
import MyChat from '../components/MyChat';
import ChatBox from '../components/ChatBox';

function Chat() {
    const { user } = useContext(ChatContext)
    const [fetchAgain, setFetchAgain] = useState()
    return (
        <div>
            <Box>
                {user && <SideDrawer/>}
            </Box>
            <Box
            display={'flex'}
            w={'100%'}
            height={'91vh'}
            justifyContent={'space-between'}
            p={'10px'}
            >
                {user && <MyChat fetchAgain = {fetchAgain}/>}
                {user && <ChatBox fetchAgain = {fetchAgain} setFetchAgain={setFetchAgain}/>}
            </Box>
        </div>
    )
}

export default Chat
