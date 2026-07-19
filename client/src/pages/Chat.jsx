import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import NewChatModal from "../components/NewChatModal";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../utils/socket";
import { getRooms, createRoom, getMessages } from "../utils/chatApi";

function Chat() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const activeRoomRef = useRef(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    getRooms().then(setRooms).catch(console.error);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceive = (msg) => {
  const isActiveRoom = activeRoomRef.current && msg.room === activeRoomRef.current._id;
  console.log('📥 handleReceive fired | msg.room:', msg.room, '| activeRoom:', activeRoomRef.current?._id, '| isActiveRoom:', isActiveRoom);

  if (isActiveRoom) {
    setMessages((prev) => [...prev, msg]);
  }

  setRooms((prev) => {
    const updated = prev.map((r) => {
      if (r._id !== msg.room) return r;
      const newUnread = isActiveRoom ? 0 : (r.unreadCount || 0) + 1;
      console.log(`🔢 Updating room ${r._id} unreadCount: ${r.unreadCount} → ${newUnread}`);
      return {
        ...r,
        lastMessage: { text: msg.text, time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        unreadCount: newUnread
      };
    });
    const roomIndex = updated.findIndex((r) => r._id === msg.room);
    if (roomIndex > 0) {
      const [room] = updated.splice(roomIndex, 1);
      updated.unshift(room);
    }
    return updated;
  });
};

    const handleTyping = ({ name }) => setTypingUser(name);
    const handleStopTyping = () => setTypingUser(null);

    const handleMessagesRead = ({ roomId, userId }) => {
      if (activeRoomRef.current && activeRoomRef.current._id === roomId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.readBy.includes(userId)
              ? m
              : { ...m, readBy: [...m.readBy, userId] },
          ),
        );
      }
    };

    socket.on("receive_message", handleReceive);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
      socket.off("messages_read", handleMessagesRead);
    };
  }, []);

  const handleSelectRoom = useCallback(async (room) => {
    setActiveRoom(room);
    setTypingUser(null);

    // Clear unread count for this room immediately in local state
    setRooms((prev) =>
      prev.map((r) => (r._id === room._id ? { ...r, unreadCount: 0 } : r)),
    );

    const socket = getSocket();
    socket?.emit("join_room", room._id);
    try {
      const msgs = await getMessages(room._id);
      setMessages(msgs);
      socket?.emit("mark_read", { roomId: room._id });
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  const handleSendMessage = (text) => {
    const socket = getSocket();
    if (!socket || !activeRoom) return;
    socket.emit("send_message", { roomId: activeRoom._id, text });
  };

  const handleSelectUserForNewChat = async (selectedUser) => {
    try {
      const room = await createRoom(selectedUser._id);
      setRooms((prev) => {
        const exists = prev.find((r) => r._id === room._id);
        return exists ? prev : [room, ...prev];
      });
      setShowNewChat(false);
      handleSelectRoom(room);
    } catch (err) {
      console.error("Failed to create room:", err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        rooms={rooms}
        activeRoomId={activeRoom?._id}
        onSelectRoom={handleSelectRoom}
        onNewChat={() => setShowNewChat(true)}
      />
      <ChatWindow
        room={activeRoom}
        messages={messages}
        currentUserId={user?._id}
        onSendMessage={handleSendMessage}
        typingUser={typingUser}
      />
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSelectUser={handleSelectUserForNewChat}
        />
      )}
    </div>
  );
}

export default Chat;
