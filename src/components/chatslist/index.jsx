import Chat from "../chat";
import "./index.css";
import { getAllUsers, startOrGetChat } from "../../firebase/service";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { ref, onChildAdded, onChildChanged } from "firebase/database";
import { database } from "../../firebase/firebase";

const ChatList = ({ onChatSelect }) => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        getAllUsers().then(users => {
            setUsers(users);
        });
    }, []);

    const handleChatSelect = async (user) => {
        try {
            const chatId = await startOrGetChat(currentUser.uid, user.uid);
            setSelectedUser(user.uid);
            onChatSelect({ ...user, chatId });
        } catch (error) {
            console.error("Error starting a chat", error);
        }
    };

    useEffect(() => {
        const userRef = ref(database, `users`);

        const handleUserAdded = (snapshot) => {
            const newUser = snapshot.val();
            setUsers((prevUsers) => [...prevUsers, { uid: snapshot.key, ...newUser }]);
        };

        const handleUserChanged = (snapshot) => {
            const changedUser = snapshot.val();
            setUsers((prevUsers) =>
                prevUsers.map((user) => (user.uid === snapshot.key ? { ...user, ...changedUser } : user))
            );
        };

        const unsubscribeAdded = onChildAdded(userRef, handleUserAdded);
        const unsubscribeChanged = onChildChanged(userRef, handleUserChanged);

        return () => {
            unsubscribeAdded();
            unsubscribeChanged();
        };
    }, []);

    const sortedUsers = [...users].sort((a, b) => {
        const statusOrder = { online: 1, away: 2, offline: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    return (
        <div className="chat_container">
            <div className="chat_inner_container">
                <div className="users_title">Users</div>
                <ul className="allchatlist_container">
                    {sortedUsers.map(user => (
                        <li 
                            key={user.uid} 
                            onClick={() => handleChatSelect(user)}
                        >
                            <Chat user={user} />
                        </li>
                    ))}
                </ul>
                <div className="currentuser_box">
                    <div className="currentuser_box_inner">
                        <div className="currentuser_avatar">
                            <img className="currentuser_avatar_img" src={currentUser.photoURL} alt="User Avatar" />
                        </div>
                        <div className="currentuser_other_details">
                            <div className="currentuser_username">{currentUser.displayName}</div>
                            <div className="currentuser_status">(Me)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatList;
