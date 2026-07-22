import { X, LogOut } from 'lucide-react';

function RoomInfoPanel({ room, currentUserId, onClose }) {
  if (!room) return null;

  const getRoomName = () => {
    if (room.isGroup) return room.name;
    const other = room.members.find((m) => m._id !== currentUserId);
    return other?.name || 'Unknown User';
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-xs shadow-xl flex flex-col animate-message-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">
            {room.isGroup ? 'Group Info' : 'Contact Info'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center py-8 border-b border-slate-100">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-medium mb-3">
            {getRoomName().charAt(0).toUpperCase()}
          </div>
          <p className="font-semibold text-slate-800">{getRoomName()}</p>
          {room.isGroup && (
            <p className="text-xs text-slate-400 mt-1">{room.members.length} members</p>
          )}
        </div>

        {room.isGroup && (
          <div className="flex-1 overflow-y-auto">
            <p className="px-5 pt-4 pb-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
              Members
            </p>
            {room.members.map((m) => (
              <div key={m._id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-medium">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  {m.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-800">
                    {m._id === currentUserId ? `${m.name} (You)` : m.name}
                  </p>
                  <p className="text-xs text-slate-400">{m.isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomInfoPanel;