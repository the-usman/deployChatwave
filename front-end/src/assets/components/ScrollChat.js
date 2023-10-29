import React, { useContext, useEffect } from 'react'
import Context from '../../ChatContex/ChatContex'
import ScrollableFeed from 'react-scrollable-feed'
import { Tooltip, Avatar } from '@chakra-ui/react'

const ScrollChat = ({ messages }) => {
    const { isSameSender, isLastMessage, user, isSameSenderMargin, isSameUser } = useContext(Context)
    
    return (
        <ScrollableFeed>
            {messages &&
                messages.map((m, i) => {

                    return (<div style={{ display: 'flex' }} key={m._id}>
                        {(isSameSender(messages, m, i, user.id) ||
                            isLastMessage(messages, i, user.id)) && (
                                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                                    <Avatar
                                        mt="7px"
                                        mr={1}
                                        size="sm"
                                        cursor="pointer"
                                        name={m.sender.name}
                                        src={m.sender.pic}
                                    />
                                </Tooltip>
                            )}
                        <span
                            style={{
                                backgroundColor: `${m.sender._id === user.id ? "#BEE3F8" : "#B9F5D0"
                                    }`,
                                marginLeft: isSameSenderMargin(messages, m, i, user.id),
                                marginTop: isSameUser(messages, m, i, user.id) ? 3 : 10,
                                borderRadius: "20px",
                                padding: "5px 15px",
                                maxWidth: "75%",
                            }}
                        >
                            {m.content}
                        </span>
                    </div>)
                })
            }
        </ScrollableFeed>
    )
}

export default ScrollChat
