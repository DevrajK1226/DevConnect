import { useEffect, useState } from 'react';
import { X, Users } from 'lucide-react';
import { getAllUsers } from '../utils/chatApi';

function NewGroupModal({ onClose, onCreateGroup }) {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getAllUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length < 2) return;
    setCreating(true);
    await onCreateGroup(groupName.trim(), selectedIds);
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-indigo-500" /> Create Group
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-100">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
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
                onClick={() => toggleUser(u._id)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition text-left"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(u._id)}
                  readOnly
                  className="w-4 h-4 accent-indigo-600"
                />
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-medium">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-800">{u.name}</span>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-2">{selectedIds.length} member(s) selected (min. 2)</p>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedIds.length < 2 || creating}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewGroupModal;