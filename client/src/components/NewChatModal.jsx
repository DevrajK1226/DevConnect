import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getAllUsers } from '../utils/chatApi';

function NewChatModal({ onClose, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Start a new chat</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-5 text-sm text-slate-400 text-center">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="p-5 text-sm text-slate-400 text-center">No other users found</p>
          ) : (
            users.map((u) => (
              <button
                key={u._id}
                onClick={() => onSelectUser(u)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-medium">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;