import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import ChatList from "../chatslist";
import ChatSpace from "../chatspace";
import "./index.css"
import { getAllChatsForUser, markMessagesAsDeliveredListener } from "../../firebase/service";
import { get, onChildAdded,ref } from "firebase/database";
import { database } from "../../firebase/firebase";
import PresenceService from "../presenceservice";
import DefaultPage from "../defaultpage";
const Home = () => {
    const [openedChat, setOpenedChat] = useState(null);
    const {currentUser} = useAuth();
    const handleChatSelect = (data) => {
        setOpenedChat(data);
    };

    useEffect(() => {
        const chatsListener = async () => {
            const chats = await getAllChatsForUser(currentUser.uid) || [];
            const unsubscribeFunctions = [];

            try {
                chats.forEach(async(chatId) => {
                    const messagesRef = ref(database, `messages/${chatId}`);
                    const snapshot = await get(messagesRef);
                    if(snapshot.exists()){
                        const unsubscribe = onChildAdded(messagesRef, (snap) => {
                            markMessagesAsDeliveredListener(snap.val(), snap.key, currentUser.uid, messagesRef);
                        });
                        unsubscribeFunctions.push(unsubscribe);
                    }
                });
    
                return () => {
                    unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
                };
            } catch (error) {
                console.log("error listenting : ",error)
            }
        };

        chatsListener();
    }, [currentUser]);
    return (
        <div className="main">
            {process.env.REACT_APP_NAME_ME}
            {currentUser && <PresenceService/>}
            <div className="sidechat_main"><ChatList onChatSelect={handleChatSelect}/></div>
            <div className="chatspace_main">{openedChat ? <ChatSpace user={openedChat}/>:<DefaultPage/>}</div>
        </div>

    )
}

export default Home;
