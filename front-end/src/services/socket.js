import { io } from "socket.io-client";
import { API_BASE } from "./api";

let socket = null;

function getSocketBaseUrl() {
  return (import.meta.env.VITE_SOCKET_URL || API_BASE || "http://localhost:3000").replace(/\/$/, "");
}

export function connectSocket(token) {
  if (!token) return null;

  if (!socket) {
    socket = io(getSocketBaseUrl(), {
      autoConnect: false,
      auth: { token },
    });
  }

  if (socket.auth?.token !== token) {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

export function onSocket(eventName, handler) {
  if (!socket) return () => {};
  socket.on(eventName, handler);
  return () => socket.off(eventName, handler);
}

export function emitSocket(eventName, payload) {
  if (!socket || !socket.connected) return;
  socket.emit(eventName, payload);
}

export const realtimeCallApi = {
  requestVideoCall: (to, fromUser) => emitSocket("video-call-request", { to, fromUser }),
  requestVoiceCall: (to, fromUser) => emitSocket("voice-call-request", { to, fromUser }),
  sendOffer: (to, offer, callId = null) => emitSocket("offer", { to, offer, callId }),
  sendAnswer: (to, answer, callId = null) => emitSocket("answer", { to, answer, callId }),
  sendIceCandidate: (to, candidate, callId = null) => emitSocket("ice-candidate", { to, candidate, callId }),
  sendVoiceOffer: (to, offer, callId = null) => emitSocket("voice-offer", { to, offer, callId }),
  sendVoiceAnswer: (to, answer, callId = null) => emitSocket("voice-answer", { to, answer, callId }),
  sendVoiceIceCandidate: (to, candidate, callId = null) => emitSocket("voice-ice-candidate", { to, candidate, callId }),
  notifyScreenShareStarted: (to, callId = null) => emitSocket("screen-share-started", { to, callId }),
  notifyScreenShareStopped: (to, callId = null) => emitSocket("screen-share-stopped", { to, callId }),
  notifyVoiceMessage: (to, payload) => emitSocket("voice-message", { to, ...payload }),
};

export const socketEvents = {
  PRESENCE: "user:status",
  MESSAGE_NEW: "message:new",
  MESSAGE_SENT: "message:sent",
  VIDEO_CALL_REQUEST: "video-call-request",
  VOICE_CALL_REQUEST: "voice-call-request",
  VOICE_MESSAGE: "voice-message",
  SCREEN_SHARE_STARTED: "screen-share-started",
  SCREEN_SHARE_STOPPED: "screen-share-stopped",
  CALL_BUSY: "call:busy",
  CALL_NO_ANSWER: "call:no-answer",
};
