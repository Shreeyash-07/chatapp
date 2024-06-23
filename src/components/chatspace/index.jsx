import { useEffect, useState } from "react";
import "./index.css";
import { getAuth } from "firebase/auth";
import { IoSend } from "react-icons/io5";
import { markMessageSeen, sendMessage } from "../../firebase/service";
import { ref, onChildAdded } from "firebase/database";
import { database } from "../../firebase/firebase";
import { FaCheck, FaCheckDouble } from "react-icons/fa6";
import ChatBody from "../chatbody";
const ChatSpace = ({user}) => {
    const { currentUser } = getAuth();
    const [textMessage, setTextMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const handleMessage = async() => {
        await sendMessage(user.chatId,currentUser.uid,textMessage)
        setTextMessage("");
    }
    useEffect(() => {
        if(user?.chatId){
            const messagesRef = ref(database, `messages/${user.chatId}`);
            const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
                const newMessage = snapshot.val();
                if (newMessage.senderId !== currentUser.uid && newMessage.status === "sent"){
                    markMessageSeen(user.chatId, snapshot.key)
                }
                setMessages((prevMessages) => [...prevMessages, snapshot.val()]);
            });
        
            return () => unsubscribe();
        }
      }, [user?.chatId, currentUser.uid]);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; 
        minutes = minutes < 10 ? `0${minutes}` : minutes; 
        return `${hours}:${minutes} ${ampm}`;
    };


    return(
        <div className="chatspace_container"> 
            <div className="chatspace_inner_container">
                <div className="chat_head">
                    <div className="chat_head_inner_container">
                        <div className="chat_head_avatar">
                            <img className="chat_head_avatar_img" src={user?.photoURL} alt="kuch" />
                        </div>
                        <div className="chat_head_middle_details">
                            <div className="chat_head_username">{user?.displayName}</div>
                        </div>
                    </div>
                </div>


                <div className="chat_middle">
                    {/* <div className="chat_middle_inner">
                            <ul className="messages">
                                {messages.map(message => (
                                    <li key={message.id}>
                                        <div className={message.senderId === currentUser.uid ? `outgoing_message`:`incoming_message`}>{message.message}</div>
                                        <span className={message.status === "seen" && "blue_tick"}>   
                                            {message.senderId === currentUser.uid && getMessageStatusIcon(message)}
                                        </span>
                                        {message.senderId === currentUser.uid && (
                                            <span>{formatTimestamp(message.timestamp)}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                    </div> */}
                    <ChatBody chatId={user.chatId}/>
                </div>

                <div className="chat_input_box">
                    <input className="chat_input" 
                        type="text"
                        placeholder="Type your message here"
                        value={textMessage}
                        onChange={(e)=> setTextMessage(e.target.value)}
                    >
                    </input>
                    <IoSend className="send_button" onClick={handleMessage}/>
                </div>
            </div>
        </div>
    )
}

export default ChatSpace;