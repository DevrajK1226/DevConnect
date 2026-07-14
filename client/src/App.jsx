import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { getSocket } from './utils/socket';

const TEST_ROOM_ID = '6a562163c522bbff01d1bd66';

function Home() {
  const { user, logout } = useAuth();
  const [testMessages, setTestMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.error('No socket instance found!');
      return;
    }

    const joinRoom = () => {
      console.log('Joining room:', TEST_ROOM_ID);
      socket.emit('join_room', TEST_ROOM_ID);
      setConnected(true);
    };

    socket.on('connect', joinRoom);
    if (socket.connected) joinRoom();

    const handleReceive = (msg) => {
      console.log('📥 Received message on client:', msg);
      setTestMessages((prev) => [...prev, msg]);
    };
    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('receive_message', handleReceive);
    };
  }, []);

  const sendTestMessage = () => {
    const socket = getSocket();
    console.log('Sending... socket connected?', socket?.connected);
    socket.emit('send_message', { roomId: TEST_ROOM_ID, text: 'Hello from socket test!' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
      <h1 className="text-2xl font-bold">Welcome, {user?.name} 👋</h1>
      <p className="text-sm text-gray-500">Socket status: {connected ? '🟢 Joined room' : '🔴 Not joined yet'}</p>
      <button onClick={sendTestMessage} className="bg-green-600 text-white px-4 py-2 rounded-md">
        Send Test Socket Message
      </button>
      <div className="bg-white p-4 rounded w-96 max-h-64 overflow-y-auto">
        {testMessages.length === 0 && <p className="text-gray-400 text-sm">No messages yet</p>}
        {testMessages.map((m) => (
          <p key={m._id} className="text-sm">{m.sender.name}: {m.text}</p>
        ))}
      </div>
      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-md">Logout</button>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;