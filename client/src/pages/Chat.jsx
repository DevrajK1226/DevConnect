import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import NewChatModal from "../components/NewChatModal";
import NewGroupModal from "../components/NewGroupModal";
import { useAuth } from "../context/AuthContext";
import { getSocket, onConnectionChange } from "../utils/socket";
import {
  getRooms,
  createRoom,
  createGroupRoom,
  getMessages,
} from "../utils/chatApi";

function Chat() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [showSidebarMobile, setShowSidebarMobile] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const activeRoomRef = useRef(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    getRooms()
      .then((data) => {
        setRooms(data);
        setRoomsError(false);
      })
      .catch(() => setRoomsError(true))
      .finally(() => setRoomsLoading(false));
  }, []);

  useEffect(() => {
    const unsubscribe = onConnectionChange(setConnectionStatus);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceive = (msg) => {
      const isActiveRoom =
        activeRoomRef.current && msg.room === activeRoomRef.current._id;

      if (isActiveRoom) {
        setMessages((prev) => [...prev, msg]);
      }

      setRooms((prev) => {
        const updated = prev.map((r) => {
          if (r._id !== msg.room) return r;
          const newUnread = isActiveRoom ? 0 : (r.unreadCount || 0) + 1;
          return {
            ...r,
            lastMessage: {
              text: msg.text,
              time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            unreadCount: newUnread,
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
    setShowSidebarMobile(false);

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

  const handleCreateGroup = async (name, memberIds) => {
    try {
      const room = await createGroupRoom(name, memberIds);
      setRooms((prev) => [room, ...prev]);
      setShowNewGroup(false);
      handleSelectRoom(room);

      const socket = getSocket();
      socket?.emit("join_room", room._id);
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {(connectionStatus === "disconnected" ||
        connectionStatus === "error") && (
        <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-xs text-center py-1.5 z-50">
          Reconnecting...
        </div>
      )}

      <div className={`${showSidebarMobile ? "flex" : "hidden"} sm:flex`}>
        <Sidebar
          rooms={rooms}
          roomsLoading={roomsLoading}
          roomsError={roomsError}
          activeRoomId={activeRoom?._id}
          onSelectRoom={handleSelectRoom}
          onNewChat={() => setShowNewChat(true)}
          onNewGroup={() => setShowNewGroup(true)}
        />
      </div>

      <div
        className={`${showSidebarMobile ? "hidden" : "flex"} sm:flex flex-1`}
      >
        <ChatWindow
          room={activeRoom}
          messages={messages}
          currentUserId={user?._id}
          onSendMessage={handleSendMessage}
          typingUser={typingUser}
          onBack={() => setShowSidebarMobile(true)}
        />
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSelectUser={handleSelectUserForNewChat}
        />
      )}
      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  );
}

export default Chat;
