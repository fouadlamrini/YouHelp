import { io } from "socket.io-client";
import { API_BASE } from "./api";

const SOCKET_URL = API_BASE;

let socket = null;

export function getSocket() {
  if (socket?.connected) return socket;
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
    });

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
