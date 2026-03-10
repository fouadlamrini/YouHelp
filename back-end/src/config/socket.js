const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Global maps shared across the server for presence
// userId -> Set(socketId)
const userSockets = new Map();
// userId -> Date (last time we saw the user disconnected)
const lastSeenMap = new Map();

/** Attach Socket.io and auth, map userId -> socketId for private messages */
function setupSocket(server) {
  const { Server } = require("socket.io");
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Auth required"));
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.userId = payload.id;
      next();
    } catch (e) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.userId;
    console.log('🔗 Socket connected - User ID:', uid);
    
    if (!userSockets.has(uid)) userSockets.set(uid, new Set());
    userSockets.get(uid).add(socket.id);

    // Explicit presence event from client (used on initial connect / reconnect)
    socket.on("user:online", (userId) => {
      const id = String(userId || uid);
      lastSeenMap.delete(id);
      // broadcast to everyone (including sender)
      io.emit("user:status", { userId: id, status: "online" });
    });

    socket.on("disconnect", () => {
      console.log('❌ Socket disconnected - User ID:', uid);
      const set = userSockets.get(uid);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(uid);
          const id = String(uid);
          const now = new Date();
          lastSeenMap.set(id, now);
          io.emit("user:status", { userId: id, status: "offline", lastSeen: now.toISOString() });
        }
      }
    });

    // Video Call Events
    socket.on("video-call-request", (data) => {
      console.log('📹 Video call request received:', data);
      const { from, to, fromUser } = data;
      
      // Forward the request to the target user
      emitToUser(to, "video-call-request", {
        from,
        to,
        fromUser
      });
    });

    socket.on("join-video-call", (data) => {
      console.log('🎥 Join video call:', data);
      const { userId, otherUserId } = data;
      
      // Join both users to a room for WebRTC signaling
      const room = [userId, otherUserId].sort().join("-");
      socket.join(room);
      console.log(`📞 Users ${userId} and ${otherUserId} joined room ${room}`);
    });

    socket.on("offer", (data) => {
      console.log('[socket] 🤝 offer from', socket.userId, 'to', data.to, '| userSockets keys:', Array.from(userSockets.keys()));
      emitToUser(data.to, "offer", {
        offer: data.offer,
        from: socket.userId
      });
    });

    socket.on("answer", (data) => {
      console.log('[socket] ✅ answer from', socket.userId, 'to', data.to, '| userSockets keys:', Array.from(userSockets.keys()));
      emitToUser(data.to, "answer", {
        answer: data.answer,
        from: socket.userId
      });
    });

    socket.on("ice-candidate", (data) => {
      console.log('[socket] 🧊 ice-candidate from', socket.userId, 'to', data.to);
      emitToUser(data.to, "ice-candidate", {
        candidate: data.candidate,
        from: socket.userId
      });
    });

    socket.on("callee-ready", (data) => {
      console.log('[socket] 📞 callee-ready from', socket.userId, 'to', data.to);
      emitToUser(data.to, "callee-ready", { from: socket.userId });
    });

    socket.on("video-call-ended", (data) => {
      const to = data.to;
      if (to) emitToUser(to, "video-call-ended", { from: socket.userId });
    });

    // Voice Call Events (same logic as video, separate events to avoid mixing)
    socket.on("voice-call-request", (data) => {
      console.log('📞 Voice call request received:', data);
      const { from, to, fromUser } = data;
      emitToUser(to, "voice-call-request", { from, to, fromUser });
    });

    socket.on("join-voice-call", (data) => {
      console.log('🎧 Join voice call:', data);
      const { userId, otherUserId } = data;
      const room = "voice-" + [userId, otherUserId].sort().join("-");
      socket.join(room);
      console.log(`📞 Voice: users ${userId} and ${otherUserId} joined room ${room}`);
    });

    socket.on("voice-offer", (data) => {
      emitToUser(data.to, "voice-offer", { offer: data.offer, from: socket.userId });
    });
    socket.on("voice-answer", (data) => {
      emitToUser(data.to, "voice-answer", { answer: data.answer, from: socket.userId });
    });
    socket.on("voice-ice-candidate", (data) => {
      emitToUser(data.to, "voice-ice-candidate", { candidate: data.candidate, from: socket.userId });
    });
    socket.on("voice-callee-ready", (data) => {
      emitToUser(data.to, "voice-callee-ready", { from: socket.userId });
    });

    socket.on("voice-call-ended", (data) => {
      const to = data.to;
      if (to) emitToUser(to, "voice-call-ended", { from: socket.userId });
    });
  });

  /** Send event to one user (all his sockets) */
  function emitToUser(userId, event, data) {
    const id = String(userId);
    const set = userSockets.get(id);
    if (!set) {
      console.log('[socket] ⚠️ emitToUser: no socket for userId', id, '| available:', Array.from(userSockets.keys()));
      return;
    }
    set.forEach((sid) => io.to(sid).emit(event, data));
    console.log('[socket] 📤', event, 'sent to', id);
  }

  function isUserOnline(userId) {
    return userSockets.has(String(userId));
  }

  function getLastSeen(userId) {
    return lastSeenMap.get(String(userId)) || null;
  }

  return { io, emitToUser, isUserOnline, getLastSeen };
}

function isUserOnline(userId) {
  return userSockets.has(String(userId));
}

function getLastSeen(userId) {
  return lastSeenMap.get(String(userId)) || null;
}

module.exports = { setupSocket, isUserOnline, getLastSeen };
