let socketApi = null;

function setSocketApi(api) {
  socketApi = api;
}

function getSocketApi() {
  return socketApi;
}

function emitToUser(userId, eventName, payload) {
  if (!socketApi || typeof socketApi.emitToUser !== "function") return;
  socketApi.emitToUser(userId, eventName, payload);
}

function isUserOnline(userId) {
  if (!socketApi || typeof socketApi.isUserOnline !== "function") return false;
  return socketApi.isUserOnline(userId);
}

function getLastSeen(userId) {
  if (!socketApi || typeof socketApi.getLastSeen !== "function") return null;
  return socketApi.getLastSeen(userId);
}

module.exports = {
  setSocketApi,
  getSocketApi,
  emitToUser,
  isUserOnline,
  getLastSeen,
};
