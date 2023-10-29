import React from 'react'
import { Box, Container, Text } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Login from '../components/Login'
import Signup from '../components/Signup'

export default function Home() {
    return (
        <Container maxW="xl" float={'left'} m={'0px 0px 0px 10px'}>
            <Box
                d="flex"
                justifyContent="center"
                p={3}
                bg="white"
                w="100%"
                m="10px 0px 15px 0px"
                borderRadius="lg"
            >
                <Text
                    color={'#002047'}
                    fontSize={'25px'}
                    fontWeight={900}
                    textAlign={'center'}

                >Welcome to ChatWave</Text>
            </Box>
            <Box
                p={4}
                w={'100%'}
                bgColor={'white'}
                borderRadius={'lg'}
            >
                <Tabs variant='soft-rounded' colorScheme='yellow'>
                    <TabList 
                    mb={'1em'}
                    >
                        <Tab
                        w='50%'
                        >Login</Tab>
                        <Tab
                        w='50%'
                        >SignUp</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login/>
                        </TabPanel>
                        <TabPanel>
                            <Signup/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

            </Box>
        </Container>
    )
}
