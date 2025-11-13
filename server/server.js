require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Test route
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
// app.use('/api/chats', require('./routes/chats'));

// HTTP + Socket server
const server = http.createServer(app);

// =======================
// SOCKET.IO WITH JWT AUTH
// =======================
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
});

io.use(async (socket, next) => {
  try {
    const tokenFromAuth = socket.handshake?.auth?.token;
    const headerAuth = socket.handshake?.headers?.authorization;
    const rawToken = tokenFromAuth || headerAuth;

    if (!rawToken) return next(new Error("unauthorized"));

    const token = rawToken.startsWith("Bearer ")
      ? rawToken.slice(7)
      : rawToken;

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.id) return next(new Error("unauthorized"));

    const user = await User.findById(payload.id).select("-password");
    if (!user) return next(new Error("unauthorized"));

    socket.user = user;
    socket.join(String(user._id));

    console.log("🟢 Socket authenticated:", socket.id, user.username);
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("unauthorized"));
  }
});

// Socket event handlers
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.user.username);

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", socket.id, "reason:", reason);
  });
});

// Emit helper
const emitToUser = (userId, event, payload) => {
  io.to(String(userId)).emit(event, payload);
};
app.set("emitToUser", emitToUser);
app.set("io", io);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB Error:", err.message);
  }
};

startServer();
