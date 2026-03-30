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
  markUserOnline(io, userId);

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
}

module.exports = {
  isUserOnline,
  getLastSeen,
  registerPresenceHandlers,
};
