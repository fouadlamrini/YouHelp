const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_FRONTEND_URL = "http://localhost:5173";

// Shared presence state
// userId -> Set(socketId)
const userSockets = new Map();
// userId -> Date
const lastSeenMap = new Map();

function toUserId(value) {
  return String(value);
}

function isObject(value) {
  return value && typeof value === "object";
}

function isPresent(value) {
  return value !== undefined && value !== null && value !== "";
}

function isUserOnline(userId) {
  return userSockets.has(toUserId(userId));
}

function getLastSeen(userId) {
  return lastSeenMap.get(toUserId(userId)) || null;
}

function getTargetUserId(data) {
  if (!isObject(data) || !isPresent(data.to)) return null;
  return toUserId(data.to);
}

function getOtherUserId(data) {
  if (!isObject(data) || !isPresent(data.otherUserId)) return null;
  return toUserId(data.otherUserId);
}

function markUserOnline(io, userId) {
  const id = toUserId(userId);
  lastSeenMap.delete(id);
  io.emit("user:status", { userId: id, status: "online" });
}

function markUserOffline(io, userId) {
  const id = toUserId(userId);
  const now = new Date();
  lastSeenMap.set(id, now);
  io.emit("user:status", {
    userId: id,
    status: "offline",
    lastSeen: now.toISOString(),
  });
}

/** Attach Socket.IO and auth, map userId -> socketId for private messages */
function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL },
  });

  io.use((socket, next) => {
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
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log("[socket] connected:", userId);

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.on("user:online", () => {
      // Keep the event for compatibility, but trust the authenticated socket user.
      markUserOnline(io, userId);
    });

    socket.on("disconnect", () => {
      console.log("[socket] disconnected:", userId);
      const socketSet = userSockets.get(userId);

      if (!socketSet) return;

      socketSet.delete(socket.id);
      if (socketSet.size === 0) {
        userSockets.delete(userId);
        markUserOffline(io, userId);
      }
    });

    // Video call events
    socket.on("video-call-request", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId) return;

      const payload = isObject(data) ? data : {};
      const { from, to, fromUser } = payload;

      emitToUser(targetUserId, "video-call-request", { from, to, fromUser });
    });

    socket.on("join-video-call", (data) => {
      const otherUserId = getOtherUserId(data);
      if (!otherUserId) return;

      // Keep room join for compatibility and future room-based signaling.
      const room = [userId, otherUserId].sort().join("-");
      socket.join(room);
      console.log("[socket] video room joined:", room);
    });

    socket.on("offer", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId || !isObject(data) || !data.offer) return;

      emitToUser(targetUserId, "offer", {
        offer: data.offer,
        from: userId,
      });
    });

    socket.on("answer", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId || !isObject(data) || !data.answer) return;

      emitToUser(targetUserId, "answer", {
        answer: data.answer,
        from: userId,
      });
    });

    socket.on("ice-candidate", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId || !isObject(data) || !data.candidate) return;

      emitToUser(targetUserId, "ice-candidate", {
        candidate: data.candidate,
        from: userId,
      });
    });

    socket.on("callee-ready", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId) return;

      emitToUser(targetUserId, "callee-ready", { from: userId });
    });

    socket.on("video-call-ended", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId) return;

      emitToUser(targetUserId, "video-call-ended", { from: userId });
    });

    // Voice call events
    socket.on("voice-call-request", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId) return;

      const payload = isObject(data) ? data : {};
      const { from, to, fromUser } = payload;

      emitToUser(targetUserId, "voice-call-request", { from, to, fromUser });
    });

    socket.on("join-voice-call", (data) => {
      const otherUserId = getOtherUserId(data);
      if (!otherUserId) return;

      // Keep room join for compatibility and future room-based signaling.
      const room = "voice-" + [userId, otherUserId].sort().join("-");
      socket.join(room);
      console.log("[socket] voice room joined:", room);
    });

    socket.on("voice-offer", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId || !isObject(data) || !data.offer) return;

      emitToUser(targetUserId, "voice-offer", {
        offer: data.offer,
        from: userId,
      });
    });

    socket.on("voice-answer", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId || !isObject(data) || !data.answer) return;

      emitToUser(targetUserId, "voice-answer", {
        answer: data.answer,
        from: userId,
      });
    });

    socket.on("voice-ice-candidate", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId || !isObject(data) || !data.candidate) return;

      emitToUser(targetUserId, "voice-ice-candidate", {
        candidate: data.candidate,
        from: userId,
      });
    });

    socket.on("voice-callee-ready", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId) return;

      emitToUser(targetUserId, "voice-callee-ready", { from: userId });
    });

    socket.on("voice-call-ended", (data) => {
      const targetUserId = getTargetUserId(data);
      if (!targetUserId) return;

      emitToUser(targetUserId, "voice-call-ended", { from: userId });
    });
  });

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

  return { io, emitToUser, isUserOnline, getLastSeen };
}

module.exports = { setupSocket, isUserOnline, getLastSeen };
