import { set, ref, get, child, push, query, orderByChild, equalTo, update } from "firebase/database"
import { database } from "./firebase"

// ----------- userService ----------- //
export const createUser = async(user, displayName, photoURL) => {
    try{
        await set(ref(database,`users/${user.uid}`),{
            uid: user.uid,
            email: user.email,
            displayName,
            photoURL,
            status: "offline"
        })
    } catch(err){
        console.error({err})
    }

}

export const getAllUsers = async () => {
    const users = [];
    const dbRef = ref(database);
  
    try {
      const snapshot = await get(child(dbRef, 'users/'));
      snapshot.forEach((childSnapshot) => {
        users.push(childSnapshot.val());
      });
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; 
    }
};
  
export const testDB = async() => {
    try{
        await set(ref(database,`test`),{
            test: "test"
        })
    } catch(err){
        console.error({err})
    }

}

// ----------- Chats Service ------------- //

export const getExistingChat = async(currentUserId, otherUserId) => {
    const userChatsRef = ref(database, `chats/${currentUserId}`);
    const existingChatQuery = query(userChatsRef, orderByChild('otherUserId'), equalTo(otherUserId));

    try {
        const snapshot = await get(existingChatQuery);
        if (snapshot.exists()){
            const chatId = Object.keys(snapshot.val())[0];
            return chatId;
        }
        return null;
    } catch (err) {
        console.error("Error checking for existing chat", err);
        throw err;
    }
} 

export const startOrGetChat = async(currentUserId, otherUserId) => {
    const exisitingChatId = await getExistingChat(currentUserId, otherUserId);
    if (exisitingChatId) {
        return exisitingChatId;
    } else {
        const newChatRef = push(ref(database, 'chats'));
        const newChatId = newChatRef.key;

        const updates = {};
        updates[`/chats/${currentUserId}/${newChatId}`] = {otherUserId};
        updates[`/chats/${otherUserId}/${newChatId}`] = {otherUserId: currentUserId};

        try{
            await set(newChatRef, {});
            await update(ref(database),updates);
            return newChatId;
        } catch (err) {
            console.error("Error starting new chat :", err);
            throw Error;
        }
    }
}

// ---------- Message Service ------------//

export const sendMessage = async(chatId, senderId, message) =>{
    const messageRef = ref(database, `messages/${chatId}`);
    const newMessageRef = push(messageRef);

    const newMessage = {
        senderId,
        message,
        timestamp: Date.now(),
        status: 'sent'
    };

    try{
        await set(newMessageRef, newMessage);
        return newMessageRef.key;
    }catch(error){
        console.error("Error sending message", error)
        throw error;
    }
}

export const getAllChatMessages = async(chatId) => {
    const messagesRef = ref(database, `messages/${chatId}`);
    try{
        const snapshot = await get(messagesRef);
        if(snapshot.exists()){
            const messages = snapshot.val();
            const chatMessages = Object.keys(messages).map(key=>({
                id:key,
                ...messages[key]
            }))
            return chatMessages;
        } else {
            console.log("No Messages");
            return [];
        }
    } catch(error){
        console.error("Error getting messages:",error);
        throw error;
    }
}

export const markMessageSeen = async (chatId, messageId) => {
    const messageRef = ref(database, `messages/${chatId}/${messageId}`);
    try {
      await update(messageRef, { status: "seen" });
    } catch (error) {
      console.error("Error marking message as seen:", error);
      throw error;
    }
  };

export const getAllChatsForUser = async(userId) => {
    const chats = [];
    const dbRef = ref(database);
    const userChatRef = child(dbRef, `chats/${userId}`);
    try{
        const snapshot = await get(userChatRef);
        if (snapshot.exists()){
            snapshot.forEach((snap)=>{
                chats.push(snap.key)
            })
        } else {
            console.log("No chats found for the user");        
        }
        return chats;
    }catch(error){
        console.error("Error fetching chats:", error);
        throw error;
    }
}

export const markMessagesAsDeliveredListener = (message, key, userId, messageRef) => {
    try {
        debugger;
      get(messageRef).then(snapshot => {
        if (snapshot.exists()) {
          if (message.status.senderId !== userId && message.status === "sent") {
            const updates = {};
            updates[`${key}/status`] = "delivered";
            update(messageRef, updates);
          }
        } else {
          console.log("doesn't exist");
        }
      }).catch(error => {
        console.log("ERROR: ", error);
      });
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };