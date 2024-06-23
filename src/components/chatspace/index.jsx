import { useEffect, useState } from "react";
import "./index.css";
import { getAuth } from "firebase/auth";
import { IoSend } from "react-icons/io5";
import { markMessageSeen, sendMessage } from "../../firebase/service";
import { ref, onChildAdded } from "firebase/database";
import { database } from "../../firebase/firebase";
import ChatBody from "../chatbody";

const ChatSpace = ({ user }) => {
    const { currentUser } = getAuth();
    const [textMessage, setTextMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const handleMessage = async () => {
        if (textMessage.trim() === "") return;
        await sendMessage(user.chatId, currentUser.uid, textMessage);
        setTextMessage("");
    }

    useEffect(() => {
        if (user?.chatId) {
            const messagesRef = ref(database, `messages/${user.chatId}`);
            const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
                const newMessage = snapshot.val();
                if (newMessage.senderId !== currentUser.uid && newMessage.status === "sent") {
                    markMessageSeen(user.chatId, snapshot.key);
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

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleMessage();
        }
    }

    return (
        <div className="chatspace_container">
            <div className="chatspace_inner_container">
                <div className="chat_head">
                    <div className="chat_head_inner_container">
                        <div className="chat_head_avatar">
                            <img className="chat_head_avatar_img" src={user?.photoURL} alt="User Avatar" />
                        </div>
                        <div className="chat_head_middle_details">
                            <div className="chat_head_username">{user?.displayName}</div>
                        </div>
                    </div>
                </div>

                <div className="chat_middle">
                    <ChatBody chatId={user.chatId} />
                </div>

                <div className="chat_input_box">
                    <input
                        className="chat_input"
                        type="text"
                        placeholder="Type your message here"
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                        onKeyDown={handleKeyDown} // Add this line
                    />
                    <IoSend className="send_button" onClick={handleMessage} />
                </div>
            </div>
        </div>
    );
}

export default ChatSpace;
