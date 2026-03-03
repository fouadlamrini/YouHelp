const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/** Attach Socket.io and auth, map userId -> socketId for private messages */
function setupSocket(server) {
  const { Server } = require("socket.io");
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173" },
  });

  const userSockets = new Map(); // userId -> Set(socketId)

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
    if (!userSockets.has(uid)) userSockets.set(uid, new Set());
    userSockets.get(uid).add(socket.id);

    socket.on("disconnect", () => {
      const set = userSockets.get(uid);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) userSockets.delete(uid);
      }
    });
  });

  /** Send event to one user (all his sockets) */
  function emitToUser(userId, event, data) {
    const set = userSockets.get(userId);
    if (!set) return;
    set.forEach((sid) => io.to(sid).emit(event, data));
  }

  return { io, emitToUser };
}

module.exports = { setupSocket };
