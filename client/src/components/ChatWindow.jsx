import { Send, Smile, Paperclip, Phone, Video, Info, Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';

function ChatWindow({ room, messages, currentUserId, onSendMessage, typingUser }) {
  const [text, setText] = useState('');

  const getOtherMember = () => room?.members.find((m) => m._id !== currentUserId);

  const getRoomName = () => {
    if (!room) return '';
    if (room.isGroup) return room.name;
    return getOtherMember()?.name || 'Unknown User';
  };

  const isOnline = () => !room?.isGroup && getOtherMember()?.isOnline;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <Send size={24} className="text-indigo-300" />
          </div>
          <p className="text-lg font-medium text-slate-500">Select a conversation</p>
          <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-medium">
              {getRoomName().charAt(0).toUpperCase()}
            </div>
            {isOnline() && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800">{getRoomName()}</p>
            <p className="text-xs text-slate-400">
              {typingUser ? (
                <span className="text-indigo-500">{typingUser} is typing...</span>
              ) : isOnline() ? (
                <span className="text-green-500">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-2 hover:bg-slate-100 rounded-full transition"><Phone size={18} /></button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition"><Video size={18} /></button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition"><Info size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-slate-400 mt-10">No messages yet. Say hello 👋</div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender._id === currentUserId;
            const isRead = msg.readBy?.length > 1;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isOwn
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                  }`}
                >
                  {!isOwn && room.isGroup && (
                    <p className="text-xs font-medium text-indigo-500 mb-0.5">{msg.sender.name}</p>
                  )}
                  <p>{msg.text}</p>
                  {isOwn && (
                    <div className="flex justify-end mt-1">
                      {isRead ? <CheckCheck size={14} className="text-indigo-200" /> : <Check size={14} className="text-indigo-200" />}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-white border-t border-slate-200 p-3 flex items-center gap-2">
        <button type="button" className="text-slate-400 hover:text-slate-600 p-2">
          <Paperclip size={19} />
        </button>
        <button type="button" className="text-slate-400 hover:text-slate-600 p-2">
          <Smile size={20} />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message"
          className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-2.5 rounded-full hover:opacity-90 transition disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;