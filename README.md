# DevConnect 💬

A real-time chat platform built with the MERN stack and Socket.io, featuring private messaging, group chats, live typing indicators, read receipts, and online presence tracking.

## Features

- 🔐 **Secure Authentication** — JWT-based auth with bcrypt password hashing
- 💬 **Real-Time Messaging** — Instant message delivery via Socket.io, no page refresh needed
- 🟢 **Online Presence** — Live online/offline status with "last seen" timestamps
- ⌨️ **Typing Indicators** — See when the other person is typing, in real time
- ✓✓ **Read Receipts** — Know when your messages have been seen
- 🔒 **Authorized Rooms** — Server-side checks ensure only room members can send/receive messages in that room
- 📱 **Responsive Design** — Works across desktop and mobile

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS v4, React Router, Axios, Socket.io-client, Lucide Icons

**Backend:** Node.js, Express, Socket.io, MongoDB, Mongoose, JWT, bcrypt

**Architecture:** REST API for auth/data fetching + WebSocket (Socket.io) for real-time events

## Screenshots

Coming soon! The chat interface is currently under development.

## Live Demo

Coming Soon

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (free tier)

### Installation

1. Clone the repository
```bash
git clone https://github.com/DevrajK1226/devconnect.git
cd devconnect
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Create a `.env` file in `server/`
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret_key
CLIENT_URL=http://localhost:5173
```

4. Install frontend dependencies
```bash
cd ../client
npm install
```

5. Run the backend (from `server/`)
```bash
npm run dev
```

6. Run the frontend (from `client/`)
```bash
npm run dev
```

7. Open `http://localhost:5173` in your browser

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
```

### Rooms
```
POST   /api/rooms
GET    /api/rooms
GET    /api/rooms/users
```

### Messages
```
GET    /api/messages/:roomId
```

> Message *sending* happens via Socket.io (`send_message` event), not REST — real-time delivery requires a persistent connection rather than a request/response cycle.

## Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `join_room` | Client → Server | Join a chat room |
| `send_message` | Client → Server | Send a message to a room |
| `receive_message` | Server → Client | Broadcast new message to room members |
| `typing` / `stop_typing` | Client → Server | Notify room of typing state |
| `user_typing` / `user_stop_typing` | Server → Client | Relay typing state to other members |
| `mark_read` | Client → Server | Mark messages as read |
| `messages_read` | Server → Client | Notify sender their message was read |
| `user_online` / `user_offline` | Server → Client | Broadcast presence changes |

## Project Structure

```
devconnect/
│
├── client/
│   ├── src/
│   │   ├── pages/          # Login, Register
│   │   ├── context/        # AuthContext (global user + socket state)
│   │   ├── components/     # ProtectedRoute, etc.
│   │   └── utils/          # api.js (Axios), socket.js (Socket.io client)
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/        # authController, roomController, messageController
│   ├── middleware/         # authMiddleware (REST), socketAuth (Socket.io)
│   ├── models/              # User, Room, Message
│   ├── routes/              # authRoutes, roomRoutes, messageRoutes
│   └── index.js             # Express + Socket.io server entry point
│
└── README.md
```

## Architecture Notes

- **Auth flow:** Passwords are hashed with bcrypt before storage; JWT tokens (7-day expiry) authenticate both REST API calls and Socket.io connections
- **Socket.io rooms:** Each user auto-joins a personal room (their user ID) for future direct notifications; chat rooms are separate Socket.io rooms joined explicitly when a chat is opened
- **Authorization:** Every message send is verified server-side against the room's member list — a user cannot send to a room they don't belong to, even if they know the room ID
- **Real-time events:** `send_message`, `typing`, `stop_typing`, `mark_read`, `user_online`, `user_offline` are handled via Socket.io; all other data operations (fetching users, rooms, message history) use REST endpoints

## Roadmap

- [ ] Chat UI (sidebar + message window)
- [ ] Group chat UI
- [ ] File/image sharing in messages
- [ ] Message search
- [ ] Deployment (Render + Vercel)

## Author

**Devraj Kanki**
- GitHub: [github.com/DevrajK1226](https://github.com/DevrajK1226)
- LinkedIn: *add your LinkedIn URL here*

## License

MIT