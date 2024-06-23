import { set, ref, get, child, push, query, orderByChild, equalTo, update } from "firebase/database"
import { database } from "./firebase"

// ----------- userService ----------- //
export const createUser = async(user, displayName, photoURL) => {
    console.log({user})
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
      console.log("Users:", users); // Log users array after population
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; // Return empty array if there's an error
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
            console.log({chatMessages})
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


// export const markMessageDelivered = async(chatId, messageId) => {
//     const messageRef = ref(database, `messages/${chatId}/${messageId}`);

//     try {
//         await update(messageRef, {status: "delivered"});
//     } catch (error) {
//         console.error("Error marking message as delivered:", error);
//         throw error;    
//     }
// }

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
    console.log({userId})
    const chats = [];
    const dbRef = ref(database);
    const userChatRef = child(dbRef, `chats/${userId}`);
    console.log({userChatRef})
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

// export const markMessagesAsDelivered = async(chatId, userId) => {
//     const messageRef = ref(database, `messages/${chatId}`);

//     try {
//         const snapshot = await get(messageRef);
//         if(snapshot.exists()){
//             const updates = {};
//             snapshot.forEach((snap) => {
//                 const message = snap.val();
//                 const messageId = snap.key;
//                 if (message.senderId !== userId && message.status === "sent" && message.status !== "seen") {
//                     updates[`${messageId}/status`] = "delivered";
//                 }
//             });
//             await update(ref(messageRef),updates);
//         }
//     } catch (error) {
//         console.error("Error marking messages as delivered:", error);
//         throw error;
//     }
// }

export const markMessagesAsDeliveredListener = (message, key, userId, messageRef) => {
    console.log({messagere:message})
    try {
        debugger;
      get(messageRef).then(snapshot => {
        if (snapshot.exists()) {
          if (message.status.senderId !== userId && message.status === "sent") {
            const updates = {};
            updates[`${key}/status`] = "delivered";
            console.log({ message, key, userId, messageRef });
            update(messageRef, updates);
          } else {
            console.log({sender:message.senderId,userId, status:message.status })
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