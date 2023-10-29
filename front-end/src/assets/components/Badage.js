import { Box,  } from '@chakra-ui/react'
import{CloseIcon} from '@chakra-ui/icons'
import React from 'react'

const Badage = (props) => {
    return (
        <Box
        px={2}
        py={1}
        borderRadius={'lg'}
        m={1}
        mb={2}
        bg={"#38AC38"}
        color={'white'}
        fontSize={'12px'}
        cursor={'pointer'}
        onClick={props.handleFunction}
        >
            {props.user.name}
            <CloseIcon pl={1}/>
        </Box>
    )
}

export default Badage
