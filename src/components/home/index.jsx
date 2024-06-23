import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import ChatList from "../chatslist";
import ChatSpace from "../chatspace";
import "./index.css"
import { getAllChatsForUser, markMessagesAsDeliveredListener } from "../../firebase/service";
import { get, onChildAdded,ref } from "firebase/database";
import { database } from "../../firebase/firebase";
import PresenceService from "../presenceservice";
const Home = () => {
    const [openedChat, setOpenedChat] = useState(null);
    const {currentUser} = useAuth();
    const handleChatSelect = (data) => {
        setOpenedChat(data);
    };

    useEffect(() => {
        console.log(process.env.FIREBASE_API_KEY)
        const chatsListener = async () => {
            const chats = await getAllChatsForUser(currentUser.uid) || [];
            const unsubscribeFunctions = [];

            try {
                chats.forEach(async(chatId) => {
                    const messagesRef = ref(database, `messages/${chatId}`);
                    const snapshot = await get(messagesRef);
                    if(snapshot.exists()){
                        console.log(`messages/${chatId}`)
                        const unsubscribe = onChildAdded(messagesRef, (snap) => {
                            console.log({addedHere: snap.val()})
                            debugger;
                            const msg = snap.val();
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
            <div className="chatspace_main">{openedChat && <ChatSpace user={openedChat}/>}</div>
        </div>

    )
}

export default Home;


    // useEffect(()=>{
    //     const fetchChatsAndMarksMessages = async() => {
    //         try{
    //             if(currentUser){
    //                 const chats = await getAllChatsForUser(currentUser.uid);
    //                 console.log({chats})
    //                 chats.forEach(async(chat)=>{
    //                     await markMessagesAsDelivered(chat.chatId, currentUser.uid)
    //                 })
    //             }
    //         } catch (error) {
    //             console.error("Error fetching chats or marking messages:", error);
    //         }
    //     };
    //     fetchChatsAndMarksMessages();
    // },[currentUser])