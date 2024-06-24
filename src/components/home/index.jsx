import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import ChatList from "../chatslist";
import ChatSpace from "../chatspace";
import "./index.css";
import { getAllChatsForUser, markMessagesAsDeliveredListener } from "../../firebase/service";
import { get, onChildAdded, ref } from "firebase/database";
import { database } from "../../firebase/firebase";
import PresenceService from "../presenceservice";
import DefaultPage from "../defaultpage";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const [openedChat, setOpenedChat] = useState(null);
    const [unsubscribeFunctions, setUnsubscribeFunctions] = useState({});
    const [unSubChatId, setUnSubChatId] = useState(null);
    const { currentUser } = useAuth();

    const handleChatSelect = async(data) => {
        if(unSubChatId && unSubChatId !== data.chatId){
            const messagesRef = ref(database, `messages/${unSubChatId}`);
            const snapshot = await get(messagesRef);
            if (snapshot.exists()) {
                const unsubscribe = onChildAdded(messagesRef, (snap) => {
                    markMessagesAsDeliveredListener(snap.val(), snap.key, currentUser.uid, messagesRef);
                });
                setUnsubscribeFunctions(prevUnsubs => ({
                    ...prevUnsubs,
                    [unSubChatId]: unsubscribe
                }));
            }
        }
        if (unsubscribeFunctions[data.chatId]) {
            setUnSubChatId(data.chatId); 
            unsubscribeFunctions[data.chatId]();
            delete unsubscribeFunctions[data.chatId]; 
        }
        setUnSubChatId(data.chatId); 
        setOpenedChat(data); 
    };

    
    useEffect(() => {
        const checkforUser = () => {
            if(!currentUser){
                return navigate("/")
            }
        }
        
        const chatsListener = async () => {
            const chats = await getAllChatsForUser(currentUser?.uid) || [];
            const newUnsubscribeFunctions = {};
            try {
                chats.forEach(async (chatId) => {
                    const messagesRef = ref(database, `messages/${chatId}`);
                    const snapshot = await get(messagesRef);
                    if (snapshot.exists()) {
                        const unsubscribe = onChildAdded(messagesRef, (snap) => {
                            markMessagesAsDeliveredListener(snap.val(), snap.key, currentUser?.uid, messagesRef);
                        });
                        newUnsubscribeFunctions[chatId] = () => unsubscribe();
                    }
                });

                setUnsubscribeFunctions(newUnsubscribeFunctions);

                return () => {
                    Object.values(newUnsubscribeFunctions).forEach((unsubscribe) => unsubscribe());
                };
            } catch (error) {
                console.log("Error listening: ", error);
            }
        };
        checkforUser()
        chatsListener();
    }, [currentUser , navigate]);

    return (
        <div className="main">
            {currentUser && 
            <>
                <PresenceService />
                <div className="sidechat_main">
                    <ChatList onChatSelect={handleChatSelect} />
                </div>
                <div className="chatspace_main">
                    {openedChat ? <ChatSpace user={openedChat} /> : <DefaultPage />}
                </div>
            </>
            }
        </div>
    );
};

export default Home;
