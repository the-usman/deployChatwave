import { FormControl, Input, InputGroup, FormLabel, InputRightElement, VStack, Button } from '@chakra-ui/react';
import React, { useContext, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import Context from '../../ChatContex/ChatContex';

function Signup() {
    const navigate = useNavigate();
    const { setChats } = useContext(Context)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        pic: null,
        confirmPass: ""
    })
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const onChangeHandle = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const postDetail = (pic) => {
        setLoading(true);
        if (pic === undefined) {
            toast({
                title: 'Error to upload image',
                description: "Image not found",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            })
            return;
        }
        if (pic.type === 'image/jpg' || pic.type === 'image/jpeg' || pic.type === 'image/png') {
            const data = new FormData();
            data.append("file", pic);
            data.append("upload_preset", "chat-wave");
            data.append("cloud_name", "dbzjzgav7");

            fetch("https://api.cloudinary.com/v1_1/dbzjzgav7/image/upload", {
                method: 'post',
                body: data
            }).then((res) => {
                return res.json(); // Add a return statement here
            }).then((data) => {
                setFormData({
                    ...formData,
                    pic: data.url.toString()
                });
                console.log(data);
                setLoading(false);
            }).catch((error) => {
                console.log(error);
                setLoading(false);
            });
        } else {
            toast({
                title: 'Error to upload image',
                description: "Please use an image in jpg or png format",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            setLoading(false)
        }
    }
    const submitHandler = async () => {
        if (!formData.name || !formData.password || !formData.email) {
            toast({
                title: 'Fill all Field',
                description: "Data of some flied is missing",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            setLoading(false)
            return;
        }
        if (formData.password !== formData.confirmPass) {
            toast({
                title: 'confirm password',
                description: "Please confirm password",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
        }
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json"
                }
            }
            const { data } = await axios.post('/api/user/signup', formData, config)
            localStorage.setItem("userInfo", JSON.stringify(data))
            navigate('/chat')
            setChats("")
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
    }

    // For Storing image in the multer 
    // TODO

    const [show, setShow] = React.useState(false)
    const handleClick = () => setShow(!show)
    return (
        <VStack>
            <FormControl id='name' isRequired fontWeight={900}
                m={'5px 0px 5px 0px'}
            >
                <FormLabel fontWeight={900}>
                    Enter your Name
                </FormLabel>
                <Input
                    type='text'
                    placeholder="Enter your Name"
                    onChange={onChangeHandle}
                    value={formData.name}
                    name='name'
                />
            </FormControl>
            <FormControl id='email' isRequired fontWeight={900}
                m={'5px 0px 5px 0px'}
            >
                <FormLabel fontWeight={900}>
                    Enter your Email
                </FormLabel>
                <Input
                    type='email'
                    placeholder="Enter your Email"
                    onChange={onChangeHandle}
                    value={formData.email}
                    name='email'
                />
            </FormControl>
            <FormControl isRequired id='password'>
                <FormLabel fontWeight={900}>
                    Enter your Password
                </FormLabel>
                <InputGroup>
                    <Input
                        type={show ? 'text' : 'password'}
                        placeholder="Enter your Password"
                        onChange={onChangeHandle}
                        value={formData.password}
                        name='password'
                    />
                    <InputRightElement>
                        <InputRightElement width='4.5rem'>
                            <Button h='1.75rem' size='sm' onClick={handleClick}>
                                {show ? 'Hide' : 'Show'}
                            </Button>
                        </InputRightElement>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl isRequired>
                <FormLabel fontWeight={900}>
                    Confirm Password
                </FormLabel>
                <InputGroup>

                    <Input
                        type={show ? 'text' : 'password'}
                        placeholder="Enter your Password"
                        onChange={onChangeHandle}
                        value={formData.confirmPass}
                        name='confirmPass'
                    />
                    <InputRightElement>
                        <InputRightElement width='4.5rem'>
                            <Button h='1.75rem' size='sm' onClick={handleClick}>
                                {show ? 'Hide' : 'Show'}
                            </Button>
                        </InputRightElement>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='pic' isRequired>
                <FormLabel
                    fontWeight={900}
                >
                    Select Picture
                </FormLabel>
                <Input
                    type='file'
                    p={1.5}
                    accept='image/*'
                    onChange={(e) => { postDetail(e.target.files[0]) }}
                />
            </FormControl>
            <Button
                width={"100%"}
                colorScheme='blue'
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                SignUp
            </Button>
        </VStack>
    )
}

export default Signup
