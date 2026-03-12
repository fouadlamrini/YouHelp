const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { userSockets } = require("./state");
const { toUserId } = require("./helpers");
const { isUserOnline, getLastSeen, registerPresenceHandlers } = require("./presence");
const { registerCallHandlers } = require("./calls");

const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_FRONTEND_URL = "http://localhost:5173";

function createSocketAuthMiddleware() {
  return (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Auth required"));
    }

    if (!JWT_SECRET) {
      console.error("[socket] JWT_SECRET is not configured");
      return next(new Error("Invalid token"));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);

      if (!payload || !payload.id) {
        return next(new Error("Invalid token"));
      }

      socket.userId = toUserId(payload.id);
      return next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  };
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL },
  });

  io.use(createSocketAuthMiddleware());

  function emitToUser(userId, event, data) {
    const targetUserId = toUserId(userId);
    const socketSet = userSockets.get(targetUserId);

    if (!socketSet || socketSet.size === 0) {
      console.log("[socket] no active socket for user:", targetUserId);
      return;
    }

    socketSet.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log("[socket] connected:", userId);

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    registerPresenceHandlers({ io, socket });
    registerCallHandlers({ socket, emitToUser });
  });

  return { io, emitToUser, isUserOnline, getLastSeen };
}

module.exports = {
  setupSocket,
  isUserOnline,
  getLastSeen,
};
