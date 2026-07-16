import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';

// Dummy data just to test the layout — we'll replace with real API calls on Day 9
const dummyRooms = [
  {
    _id: 'room1',
    isGroup: false,
    members: [
      { _id: 'me', name: 'You' },
      { _id: 'u1', name: 'Priya Sharma', isOnline: true }
    ]
  },
  {
    _id: 'room2',
    isGroup: false,
    members: [
      { _id: 'me', name: 'You' },
      { _id: 'u2', name: 'Rahul Verma', isOnline: false }
    ]
  }
];

const dummyMessages = {
  room1: [
    { _id: 'm1', sender: { _id: 'u1', name: 'Priya Sharma' }, text: 'Hey! Hows the project going?' },
    { _id: 'm2', sender: { _id: 'me', name: 'You' }, text: 'Going well! Just finished the chat UI 🎉' }
  ],
  room2: []
};

function Chat() {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    setMessages(dummyMessages[room._id] || []);
  };

  const handleSendMessage = (text) => {
    const newMsg = {
      _id: Date.now().toString(),
      sender: { _id: user._id, name: user.name },
      text
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        rooms={dummyRooms}
        activeRoomId={activeRoom?._id}
        onSelectRoom={handleSelectRoom}
        onNewChat={() => alert('New chat modal — building this on Day 9')}
      />
      <ChatWindow
        room={activeRoom}
        messages={messages}
        currentUserId={user?._id}
        onSendMessage={handleSendMessage}
        typingUser={null}
      />
    </div>
  );
}

export default Chat;