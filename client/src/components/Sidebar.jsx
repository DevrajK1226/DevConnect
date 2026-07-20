import { useAuth } from "../context/AuthContext";
import { Search, MessageSquarePlus, Users, LogOut } from "lucide-react";

function Sidebar({
  rooms,
  roomsLoading,
  roomsError,
  activeRoomId,
  onSelectRoom,
  onNewChat,
  onNewGroup,
}) {
  const { user, logout } = useAuth();

  const getOtherMember = (room) => room.members.find((m) => m._id !== user._id);

  const getRoomName = (room) => {
    if (room.isGroup) return room.name;
    return getOtherMember(room)?.name || "Unknown User";
  };

  const isOnline = (room) => !room.isGroup && getOtherMember(room)?.isOnline;

  const getLastMessagePreview = (room) => {
    if (!room.lastMessage) return "No messages yet";
    return room.lastMessage.text.length > 28
      ? room.lastMessage.text.slice(0, 28) + "..."
      : room.lastMessage.text;
  };

  return (
    <div className="w-full sm:w-80 h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 leading-tight">
              {user?.name}
            </p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="text-slate-400 hover:text-red-500 transition p-1.5"
        >
          <LogOut size={17} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {roomsLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : roomsError ? (
          <div className="p-6 text-center text-sm text-red-400">
            Couldn't connect to server. Retrying...
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => onSelectRoom(room)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left ${
                activeRoomId === room._id ? "bg-indigo-50" : ""
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-medium">
                  {getRoomName(room).charAt(0).toUpperCase()}
                </div>
                {isOnline(room) && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full pulse-online" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">
                      {getRoomName(room)}
                    </p>
                    {room.isGroup && (
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({room.members.length})
                      </span>
                    )}
                  </div>
                  {room.lastMessage?.time && (
                    <span className="text-xs text-slate-400 shrink-0 ml-2">
                      {room.lastMessage.time}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs truncate ${room.unreadCount > 0 ? "text-slate-700 font-medium" : "text-slate-400"}`}
                  >
                    {getLastMessagePreview(room)}
                  </p>
                  {room.unreadCount > 0 && (
                    <span className="ml-2 shrink-0 bg-indigo-600 text-white text-[10px] font-semibold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1">
                      {room.unreadCount > 9 ? "9+" : room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* New chat button */}
      <div className="p-3 border-t border-slate-100 flex gap-2">
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center justify-center gap-1.5 bg-linear-to-r from-indigo-500 to-violet-600 text-white py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition"
        >
          <MessageSquarePlus size={16} />
          Chat
        </button>
        <button
          onClick={onNewGroup}
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 py-2.5 rounded-full text-sm font-medium hover:bg-slate-200 transition"
        >
          <Users size={16} />
          Group
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
