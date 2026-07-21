const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const socketAuth = require('./middleware/socketAuth');
const Message = require('./models/Message');
const User = require('./models/User');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
io.use(socketAuth);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

io.on('connection', async (socket) => {
  console.log(`✅ CONNECTED: ${socket.user.name} (${socket.id})`);

  await User.findByIdAndUpdate(socket.user._id, { isOnline: true });
  socket.join(socket.user._id.toString());
  socket.broadcast.emit('user_online', { userId: socket.user._id });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`🚪 ${socket.user.name} JOINED room ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
  });

  socket.on('send_message', async ({ roomId, text }) => {
    const trimmedText = text?.trim();
    if (!trimmedText || trimmedText.length > 1000) {
      return socket.emit('error_message', { message: 'Invalid message' });
    }
    console.log(`📩 send_message from ${socket.user.name} | room: ${roomId} | text: ${trimmedText}`);
    try {
      const room = await Room.findById(roomId);
      if (!room || !room.members.includes(socket.user._id)) {
        console.log('❌ REJECTED: not a member of this room');
        return socket.emit('error_message', { message: 'Not authorized for this room' });
      }

      const message = await Message.create({
        room: roomId,
        sender: socket.user._id,
        text: trimmedText,
        readBy: [socket.user._id]
      });

      const populatedMessage = await message.populate('sender', 'name email');
      io.to(roomId).emit('receive_message', populatedMessage);
    } catch (error) {
      console.error('send_message error:', error);
      socket.emit('error_message', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ roomId }) => {
    socket.to(roomId).emit('user_typing', { userId: socket.user._id, name: socket.user.name });
  });

  socket.on('stop_typing', ({ roomId }) => {
    socket.to(roomId).emit('user_stop_typing', { userId: socket.user._id });
  });

  socket.on('mark_read', async ({ roomId }) => {
    try {
      await Message.updateMany(
        { room: roomId, readBy: { $ne: socket.user._id } },
        { $addToSet: { readBy: socket.user._id } }
      );
      socket.to(roomId).emit('messages_read', { roomId, userId: socket.user._id });
    } catch (error) {
      console.error('mark_read error:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`❌ DISCONNECTED: ${socket.user.name}`);
    await User.findByIdAndUpdate(socket.user._id, { isOnline: false, lastSeen: new Date() });
    socket.broadcast.emit('user_offline', { userId: socket.user._id, lastSeen: new Date() });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));