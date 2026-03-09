let emitFn = null;

function setNotificationEmitter(fn) {
  emitFn = typeof fn === "function" ? fn : null;
}

function emitNotification(recipientId, payload) {
  if (!emitFn || !recipientId) return;
  try {
    emitFn(String(recipientId), "notification-updated", payload || {});
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to emit notification via socket", e);
  }
}

module.exports = {
  setNotificationEmitter,
  emitNotification,
};

