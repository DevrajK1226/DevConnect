import {
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  ArrowLeft,
  Search,
  X,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getSocket } from "../utils/socket";
import { searchMessages } from "../utils/chatApi";
import RoomInfoPanel from "./RoomInfoPanel";

function ChatWindow({
  room,
  messages,
  currentUserId,
  onSendMessage,
  onDeleteMessage,
  typingUser,
  onBack,
}) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUser]);

  useEffect(() => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults(null);
  }, [room?._id]);

  const getOtherMember = () =>
    room?.members.find((m) => m._id !== currentUserId);

  const getRoomName = () => {
    if (!room) return "";
    if (room.isGroup) return room.name;
    return getOtherMember()?.name || "Unknown User";
  };

  const isOnline = () => !room?.isGroup && getOtherMember()?.isOnline;

  const handleChange = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket || !room) return;

    socket.emit("typing", { roomId: room._id });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { roomId: room._id });
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    onSendMessage(trimmed);
    setText("");

    const socket = getSocket();
    if (socket && room) socket.emit("stop_typing", { roomId: room._id });

    setTimeout(() => setIsSending(false), 300);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const results = await searchMessages(room._id, query);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults(null);
  };

  const handleDeleteClick = (messageId) => {
    if (confirmDeleteId === messageId) {
      onDeleteMessage(messageId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(messageId);
      setTimeout(() => {
        setConfirmDeleteId((current) =>
          current === messageId ? null : current,
        );
      }, 3000);
    }
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-linear-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <Send size={24} className="text-indigo-300" />
          </div>
          <p className="text-lg font-medium text-slate-500">
            Select a conversation
          </p>
          <p className="text-sm">
            Choose a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="sm:hidden text-slate-400 hover:text-slate-600 p-1 -ml-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-medium">
              {getRoomName().charAt(0).toUpperCase()}
            </div>
            {isOnline() && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full pulse-online" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800">
              {getRoomName()}
            </p>
            <p className="text-xs text-slate-400">
              {typingUser ? (
                <span className="text-indigo-500">
                  {typingUser} is typing...
                </span>
              ) : room.isGroup ? (
                `${room.members.length} members`
              ) : isOnline() ? (
                <span className="text-green-500">Online</span>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => setShowSearch((prev) => !prev)}
            className="p-2 hover:bg-slate-100 rounded-full transition"
            title="Search messages"
          >
            <Search size={18} />
          </button>
          <button
            className="p-2 hover:bg-slate-100 rounded-full transition"
            title="Voice call (coming soon)"
          >
            <Phone size={18} />
          </button>
          <button
            className="p-2 hover:bg-slate-100 rounded-full transition"
            title="Video call (coming soon)"
          >
            <Video size={18} />
          </button>
          <button
            onClick={() => setShowInfo(true)}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search in this conversation..."
            className="flex-1 text-sm focus:outline-none"
          />
          <button
            onClick={closeSearch}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-3"
        style={{
          backgroundImage:
            "radial-gradient(circle, #e8ecff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          backgroundColor: "#fafbff",
        }}
      >
        {searchQuery.trim() ? (
          searching ? (
            <div className="text-center text-sm text-slate-400 mt-10">
              Searching...
            </div>
          ) : searchResults?.length === 0 ? (
            <div className="text-center text-sm text-slate-400 mt-10">
              No messages found for "{searchQuery}"
            </div>
          ) : (
            searchResults?.map((msg) => {
              const isOwn = msg.sender._id === currentUserId;
              const time = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={msg._id}
                  className={`flex min-w-0 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md px-4 py-3 rounded-[22px] text-sm shadow-sm break-all ${
                      isOwn
                        ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                        : "bg-yellow-50 text-slate-800 border border-yellow-200"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-medium text-indigo-500 mb-0.5">
                        {msg.sender.name}
                      </p>
                    )}
                    <p>{msg.text}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {time}
                    </span>
                  </div>
                </div>
              );
            })
          )
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-slate-400 mt-10">
            No messages yet. Say hello 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender._id === currentUserId;
            const isRead = msg.readBy?.length > 1;
            const time = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={msg._id}
                className={`flex min-w-0 items-end gap-1.5 ${isOwn ? "justify-end" : "justify-start"} animate-message-in group`}
                onMouseEnter={() => setHoveredMessageId(msg._id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {isOwn && hoveredMessageId === msg._id && (
                  <button
                    onClick={() => handleDeleteClick(msg._id)}
                    className={`transition p-1 mb-1 ${
                      confirmDeleteId === msg._id
                        ? "text-red-500"
                        : "text-slate-300 hover:text-red-500"
                    }`}
                    title={
                      confirmDeleteId === msg._id
                        ? "Click again to confirm"
                        : "Delete message"
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div
                  className={`max-w-xs sm:max-w-md px-4 py-3 rounded-[22px] text-sm shadow-sm break-all ${
                    isOwn
                      ? "bg-linear-to-br from-indigo-500 to-violet-600 text-white rounded-br-md"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                  }`}
                >
                  {!isOwn && room.isGroup && (
                    <p className="text-xs font-medium text-indigo-500 mb-0.5">
                      {msg.sender.name}
                    </p>
                  )}
                  <p>{msg.text}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <span
                      className={`text-[10px] ${isOwn ? "text-indigo-200" : "text-slate-400"}`}
                    >
                      {time}
                    </span>
                    {isOwn &&
                      (isRead ? (
                        <CheckCheck size={13} className="text-indigo-200" />
                      ) : (
                        <Check size={13} className="text-indigo-200" />
                      ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingUser && !searchQuery.trim() && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-[22px] rounded-bl-md px-4 py-3 flex items-center gap-1 shadow-sm">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border-t border-slate-200 p-3 flex items-center gap-2"
      >
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-2"
        >
          <Paperclip size={19} />
        </button>
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-2"
        >
          <Smile size={20} />
        </button>
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Message"
          maxLength={1000}
          className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-linear-to-br from-indigo-500 to-violet-600 text-white p-2.5 rounded-full hover:opacity-90 transition disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </form>
      {showInfo && (
        <RoomInfoPanel
          room={room}
          currentUserId={currentUserId}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
}

export default ChatWindow;
