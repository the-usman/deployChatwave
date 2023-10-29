import { Avatar, Box, Text } from '@chakra-ui/react'
import React from 'react'

const UserAvatar = ({ user, handleFunction }) => {
    return (
        <Box
            onClick={handleFunction}
            cursor={'pointer'}
            bg={'#E8E8E8'}
            _hover={{
                bg : "#38AC38",
                color : 'white'
            }}
            w={'100%'}
            display={'flex'}
            alignItems={'center'}
            color={'black'}
            px={3}
            py={2}
            mb={2}
            borderRadius={'lg'}
        >
        <Avatar
        name={user.name}
        src={user.pic}
        mx={2}
        cursor={'pointer'}
        size={'sm'}
        />
        <Box>
            <Text>
                {user.name}
            </Text>
            <Text fontSize={'xs'}>
                <b>Email : </b>
                {user.email}
            </Text>
        </Box>

        </Box>
    )
}

export default UserAvatar
