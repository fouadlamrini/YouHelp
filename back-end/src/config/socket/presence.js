const { userSockets, lastSeenMap } = require("./state");
const { toUserId } = require("./helpers");

function isUserOnline(userId) {
  return userSockets.has(toUserId(userId));
}

function getLastSeen(userId) {
  return lastSeenMap.get(toUserId(userId)) || null;
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

function registerPresenceHandlers({ io, socket }) {
  const userId = socket.userId;
  // Mark user online as soon as authenticated socket connects.
  markUserOnline(io, userId);

  socket.on("user:online", () => {
    // Keep the event for compatibility, but trust the authenticated socket user.
    markUserOnline(io, userId);
  });

  socket.on("presence:batch-status", (payload, ack) => {
    const rawIds = Array.isArray(payload?.userIds) ? payload.userIds : [];
    const userIds = [...new Set(rawIds.map((id) => toUserId(id)).filter(Boolean))];

    const data = userIds.map((id) => {
      const lastSeen = getLastSeen(id);
      return {
        userId: id,
        status: isUserOnline(id) ? "online" : "offline",
        lastSeen: lastSeen ? lastSeen.toISOString() : null,
      };
    });

    if (typeof ack === "function") {
      ack({ data });
    }
  });

  socket.on("disconnect", () => {
    const socketSet = userSockets.get(userId);

    if (!socketSet) return;

    socketSet.delete(socket.id);
    if (socketSet.size === 0) {
      userSockets.delete(userId);
      markUserOffline(io, userId);
    }
  });
}

module.exports = {
  isUserOnline,
  getLastSeen,
  registerPresenceHandlers,
};
