import Chat from "../chat";
import "./index.css"
import { getAllUsers, startOrGetChat } from "../../firebase/service";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { ref } from "firebase/database";
import { database } from "../../firebase/firebase";
import { onChildChanged } from "firebase/database";
const ChatList = ({onChatSelect}) => {
    const {currentUser} = useAuth();
    const [users, setUsers] = useState([]);
    useEffect(()=>{
        getAllUsers().then(users=>{
            setUsers(users);
        })
    },[])

    const handleChatSelect = async(user) => {
        try {
            const chatId = await startOrGetChat(currentUser.uid, user.uid);
            onChatSelect({...user, chatId})
        } catch (error) {
            console.error("Error starting a chat", error);
        }
    }

    useEffect(() => {
        const userRef = ref(database, `users`);
        const unsubscribeChanged = onChildChanged(userRef, (snapshot) => {
            const changedUser = snapshot.val();
            setUsers((prevUsers) =>
                prevUsers.map((user) => (user.uid === snapshot.key ? { ...user, ...changedUser } : user))
            );
        });

        return () => {
            unsubscribeChanged();
        };
    }, []);
    return (
        <div className="chat_container">
            <div className="chat_inner_container">
                <ul className="allchatlist_container">
                    {users
                    .filter(user => user.uid !== currentUser.uid)
                    .map(user => (
                        <li key={user.uid} onClick={()=>handleChatSelect(user)}>
                            <Chat user={user}/>
                        </li>
                    ))}
                    
                </ul>
            </div>
        </div>
    )
}

export default ChatList;