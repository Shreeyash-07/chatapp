import "./index.css";
const Chat = ({ user}) => {
    const statusClass = user.status === "online" ? "online" : user.status === "offline" ? "offline" : "away";
    return (
        <div className="chat_main_container">
            <div className="chat_main_inner_container">
                <div className="chat_avatar">
                    <img className="avatar_img" src={user.photoURL} alt="here"/>
                </div>
                <div className="chat_other_details">
                    <div className="username">{user.displayName}</div>
                    <div className="status_details">
                    <div className={`dot ${statusClass}`}></div> {/* Corrected line */}
                    <div className="current_status">{user.status}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat