import { FaCheck, FaCheckDouble } from "react-icons/fa6";
import { useEffect, useState, useRef } from "react";
import { ref, onChildAdded, onChildChanged } from "firebase/database";
import { useAuth } from "../../contexts/authContext";
import { database } from "../../firebase/firebase";
import { getAllChatMessages, markMessageSeen } from "../../firebase/service";
import "./index.css";

const ChatBody = ({ chatId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleNewMessage = async (message, messageId) => {
      if (message.status === "delivered" && message.senderId !== currentUser.uid) {
        await markMessageSeen(chatId, messageId);
        return { ...message, status: "seen" };
      }
      return message;
    };

    const fetchMessages = async () => {
      const chatMessages = await getAllChatMessages(chatId);

      const updatedMessages = await Promise.all(
        chatMessages.map(async (message) => {
          return handleNewMessage(message, message.id);
        })
      );
      setMessages(updatedMessages);
      scrollToBottom();
    };

    if (chatId) {
      fetchMessages();
    }
  }, [chatId, currentUser.uid]);

  useEffect(() => {
    const handleNewMessage = async (message, messageId) => {
      if ((message.status === "delivered" || message.status === "sent") && message.senderId !== currentUser.uid) {
        await markMessageSeen(chatId, messageId);
        return { ...message, status: "seen" };
      }
      return message;
    };

    if (chatId) {
      const messagesRef = ref(database, `messages/${chatId}`);
      setMessages([]);
      const unsubscribeAdded = onChildAdded(messagesRef, async (snapshot) => {
        let newMessage = snapshot.val();
        newMessage = { id: snapshot.key, ...newMessage };
        newMessage = await handleNewMessage(newMessage, snapshot.key);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom();
      });

      const unsubscribeChanged = onChildChanged(messagesRef, (snapshot) => {
        const changedMessage = snapshot.val();
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === snapshot.key ? { ...msg, ...changedMessage } : msg))
        );
      });

      return () => {
        unsubscribeAdded();
        unsubscribeChanged();
      };
    }
  }, [chatId, currentUser.uid]);

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

  const getMessageStatusIcon = (message) => {
    if (message.senderId === currentUser.uid) {
      switch (message.status) {
        case "sent":
          return <FaCheck />;
        case "delivered":
          return <FaCheckDouble />;
        case "seen":
          return <FaCheckDouble style={{ color: "blue" }} />;
        default:
          return null;
      }
    }
  };

  return (
    <div className="chat_middle_inner">
      <ul className="messages">
        {messages.map((message) => (
          <li className={message.senderId === currentUser.uid ? `outgoing_message` : `incoming_message`} key={message.id}>
            <div className="message_content">
              {message.message}
                <div className="message_info">
                {message.senderId === currentUser.uid && getMessageStatusIcon(message)}
                <span>{formatTimestamp(message.timestamp)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBody;
