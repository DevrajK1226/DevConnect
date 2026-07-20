import { io } from 'socket.io-client';

let socket = null;
let connectionListeners = [];

export const onConnectionChange = (callback) => {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter((cb) => cb !== callback);
  };
};

const notifyConnectionChange = (status) => {
  connectionListeners.forEach((cb) => cb(status));
};

export const initSocket = (token) => {
  if (socket) {
    return socket;
  }
  socket = io('http://localhost:5000', { auth: { token } });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    notifyConnectionChange('connected');
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
    notifyConnectionChange('error');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
    notifyConnectionChange('disconnected');
    socket = null;
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};