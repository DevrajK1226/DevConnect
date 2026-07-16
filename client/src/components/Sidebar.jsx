import { Search, MessageSquarePlus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Sidebar({ rooms, activeRoomId, onSelectRoom, onNewChat }) {
  const { user, logout } = useAuth();

  const getOtherMember = (room) => room.members.find((m) => m._id !== user._id);

  const getRoomName = (room) => {
    if (room.isGroup) return room.name;
    return getOtherMember(room)?.name || 'Unknown User';
  };

  const isOnline = (room) => !room.isGroup && getOtherMember(room)?.isOnline;

  const getLastMessagePreview = (room) => {
    if (!room.lastMessage) return 'No messages yet';
    return room.lastMessage.text.length > 28
      ? room.lastMessage.text.slice(0, 28) + '...'
      : room.lastMessage.text;
  };

  return (
    <div className="w-full sm:w-80 h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
            </p>
          </div>
        </div>
        <button onClick={logout} title="Logout" className="text-slate-400 hover:text-red-500 transition p-1.5">
          <LogOut size={17} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">No conversations yet. Start a new chat!</div>
        ) : (
          rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => onSelectRoom(room)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left ${
                activeRoomId === room._id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-medium">
                  {getRoomName(room).charAt(0).toUpperCase()}
                </div>
                {isOnline(room) && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-slate-800 truncate">{getRoomName(room)}</p>
                  {room.lastMessage?.time && (
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{room.lastMessage.time}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{getLastMessagePreview(room)}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* New chat button */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition"
        >
          <MessageSquarePlus size={16} />
          New Chat
        </button>
      </div>
    </div>
  );
}

export default Sidebar;