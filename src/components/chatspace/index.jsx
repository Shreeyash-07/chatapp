import { useEffect, useState } from "react";
import "./index.css";
import { getAuth } from "firebase/auth";
import { IoSend } from "react-icons/io5";
import { sendMessage } from "../../firebase/service";
import ChatBody from "../chatbody";

const ChatSpace = ({ user }) => {
    const { currentUser } = getAuth();
    const [textMessage, setTextMessage] = useState("");

    const handleMessage = async () => {
        if (textMessage.trim() === "") return;
        await sendMessage(user.chatId, currentUser.uid, textMessage);
        setTextMessage("");
    }

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
                        onKeyDown={handleKeyDown} 
                    />
                    <IoSend className="send_button" onClick={handleMessage} />
                </div>
            </div>
        </div>
    );
}

export default ChatSpace;
