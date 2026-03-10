import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

let socket = null;
let presenceInitialized = false;

export function getSocket() {
  if (socket?.connected) return socket;
  const token = localStorage.getItem("token");
  if (!token) return null;
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
    });
  }

  if (!presenceInitialized) {
    presenceInitialized = true;
    socket.on("connect", () => {
      try {
        const raw = localStorage.getItem("user");
        const parsed = raw ? JSON.parse(raw) : null;
        const userId = parsed?._id || parsed?.id;
        if (userId) {
          socket.emit("user:online", userId);
        }
      } catch {
        // ignore JSON errors
      }
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
