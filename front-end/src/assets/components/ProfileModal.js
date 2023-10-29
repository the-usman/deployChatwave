import React from 'react'
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
    Image,
    Flex,
    Text
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'

function ProfileModal({ user, children }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <div>
            {
                children ? <span onClick={onOpen}>{children}</span> : <span onClick={onOpen} ><ViewIcon display={{base:'flex'}}/></span>
            }
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize={'3xl'}
                        display={'flex'}
                        justifyContent={'center'}
                    >
                        {user.name}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display={'flex'}
                        alignItems={'center'}
                        flexDirection={'column'}
                    >
                        <Image
                            borderRadius='full'
                            src={user.pic}

                            p={'10px 5px'}
                            width={'130px'}
                        />
                        <Text
                        fontSize={'3xl'}
                        >
                            {user.email}
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default ProfileModal
