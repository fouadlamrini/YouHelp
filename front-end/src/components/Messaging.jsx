import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp, FiEdit, FiMic, FiMinus, FiMonitor, FiMoreHorizontal, FiPaperclip, FiPause, FiPhone, FiPlay, FiSearch, FiSend, FiSliders, FiSmile, FiTrash2, FiVideo, FiX } from "react-icons/fi";
import { API_BASE, callsApi, friendsApi, messagesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { connectSocket, disconnectSocket, onSocket, emitSocket, socketEvents, realtimeCallApi } from "../services/socket";

function resolveAvatarUrl(src) {
  if (!src) return `${API_BASE}/avatars/default-avatar.jpg`;
  if (src.startsWith("http")) {
    try {
      const parsed = new URL(src);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return `${API_BASE}${parsed.pathname}`;
      }
    } catch {
      // keep fallback behavior
    }
    return src;
  }
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_BASE}${src}`;
  if (src.startsWith("media-")) return `${API_BASE}/uploads/images/${src}`;
  if (src === "default-avatar.png" || src === "default-avatar.jpg") return `${API_BASE}/avatars/default-avatar.jpg`;
  return `${API_BASE}/avatars/${src}`;
}

const POLL_INTERVAL_MS = 30000;
const CALLER_RINGTONE_URL = `/sounds/${encodeURIComponent("bruit tonalité du telephone.mp3")}`;
const CALLEE_RINGTONE_URL = `/sounds/${encodeURIComponent("Toque Galaxy Bells (Samsung).mp3")}`;

const Messaging = ({ openChatUserId = null }) => {
  const { user } = useAuth();
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [deleteModalMessageId, setDeleteModalMessageId] = useState(null);
  const [deleteForMeMessageId, setDeleteForMeMessageId] = useState(null);
  const [showClearConversationModal, setShowClearConversationModal] = useState(false);
  const activeChatIdRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [callType, setCallType] = useState(null);
  const [callPeerUser, setCallPeerUser] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [callError, setCallError] = useState("");
  const [activeCallId, setActiveCallId] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState(null);
  const [recordingElapsedSec, setRecordingElapsedSec] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recorderChunksRef = useRef([]);
  const peerConnectionRef = useRef(null);
  const screenStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const outgoingCallRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const inCallRef = useRef(false);
  const callerRingtoneRef = useRef(null);
  const calleeRingtoneRef = useRef(null);
  const audioPlayersRef = useRef({});
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioProgressMap, setAudioProgressMap] = useState({});
  const [audioDurationMap, setAudioDurationMap] = useState({});
  const audioUnlockedRef = useRef(false);
  const pendingCallerRingtoneRef = useRef(false);
  const pendingCalleeRingtoneRef = useRef(false);

  const EMOJI_LIST = "😀 😃 😄 😁 🥹 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 😎 🤓 😏 😒 🙄 😬 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😶 😐 😑 😯 😦 😧 😮 😲 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤠 🥳 🥸 😈 👿 👹 👺 💀 ☠️ 💩 🤡 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾 👍 👎 👊 ✊ 🤛 🤜 🤞 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 💪 🦾 🙏 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝".split(/\s+/).filter(Boolean);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const cleanupStreams = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    const currentLocal = localStreamRef.current;
    if (currentLocal) {
      currentLocal.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    const currentRemote = remoteStreamRef.current;
    if (currentRemote) {
      currentRemote.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setScreenSharing(false);
  };

  const stopRingtones = () => {
    pendingCallerRingtoneRef.current = false;
    pendingCalleeRingtoneRef.current = false;
    if (callerRingtoneRef.current) {
      callerRingtoneRef.current.pause();
      callerRingtoneRef.current.currentTime = 0;
    }
    if (calleeRingtoneRef.current) {
      calleeRingtoneRef.current.pause();
      calleeRingtoneRef.current.currentTime = 0;
    }
  };

  const playCallerRingtone = async () => {
    try {
      if (!callerRingtoneRef.current) {
        callerRingtoneRef.current = new Audio(CALLER_RINGTONE_URL);
        callerRingtoneRef.current.loop = true;
      }
      await callerRingtoneRef.current.play();
      pendingCallerRingtoneRef.current = false;
    } catch (error) {
      pendingCallerRingtoneRef.current = true;
      console.warn("Caller ringtone blocked by browser autoplay policy.", error);
    }
  };

  const playCalleeRingtone = async () => {
    try {
      if (!calleeRingtoneRef.current) {
        calleeRingtoneRef.current = new Audio(CALLEE_RINGTONE_URL);
        calleeRingtoneRef.current.loop = true;
      }
      await calleeRingtoneRef.current.play();
      pendingCalleeRingtoneRef.current = false;
    } catch (error) {
      pendingCalleeRingtoneRef.current = true;
      console.warn("Incoming ringtone blocked by browser autoplay policy.", error);
    }
  };

  const unlockAudioPlayback = async () => {
    if (audioUnlockedRef.current) return;
    try {
      if (!callerRingtoneRef.current) {
        callerRingtoneRef.current = new Audio(CALLER_RINGTONE_URL);
        callerRingtoneRef.current.loop = true;
      }
      callerRingtoneRef.current.muted = true;
      await callerRingtoneRef.current.play();
      callerRingtoneRef.current.pause();
      callerRingtoneRef.current.currentTime = 0;
      callerRingtoneRef.current.muted = false;

      if (!calleeRingtoneRef.current) {
        calleeRingtoneRef.current = new Audio(CALLEE_RINGTONE_URL);
        calleeRingtoneRef.current.loop = true;
      }
      calleeRingtoneRef.current.muted = true;
      await calleeRingtoneRef.current.play();
      calleeRingtoneRef.current.pause();
      calleeRingtoneRef.current.currentTime = 0;
      calleeRingtoneRef.current.muted = false;

      audioUnlockedRef.current = true;
    } catch {
      // Keep locked; next user interaction will retry.
    }
  };

  useEffect(() => {
    const onUserGesture = async () => {
      await unlockAudioPlayback();
      if (pendingCallerRingtoneRef.current) {
        playCallerRingtone();
      }
      if (pendingCalleeRingtoneRef.current) {
        playCalleeRingtone();
      }
    };

    window.addEventListener("pointerdown", onUserGesture, { passive: true });
    window.addEventListener("keydown", onUserGesture, { passive: true });
    window.addEventListener("touchstart", onUserGesture, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onUserGesture);
      window.removeEventListener("keydown", onUserGesture);
      window.removeEventListener("touchstart", onUserGesture);
    };
  }, []);

  const closePeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const resetCallState = () => {
    stopRingtones();
    closePeerConnection();
    cleanupStreams();
    setIncomingCall(null);
    setOutgoingCall(null);
    setCallType(null);
    setCallPeerUser(null);
    setInCall(false);
    setCallStatus("");
    setActiveCallId(null);
  };

  const getCurrentPeerId = () => {
    if (incomingCall?.from) return incomingCall.from;
    if (outgoingCall?.to) return outgoingCall.to;
    if (callPeerUser?._id) return callPeerUser._id;
    return activeChat?.user?._id || null;
  };

  const emitCallEvent = (videoEventName, voiceEventName, payload = {}) => {
    if (!callType) return;
    emitSocket(callType === "video" ? videoEventName : voiceEventName, payload);
  };

  const createPeerConnection = (currentCallType, peerId, stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (!event.candidate || !peerId) return;
      if (currentCallType === "video") {
        realtimeCallApi.sendIceCandidate(peerId, event.candidate, activeCallId);
      } else {
        realtimeCallApi.sendVoiceIceCandidate(peerId, event.candidate, activeCallId);
      }
    };

    pc.ontrack = (event) => {
      const [streamFromRemote] = event.streams;
      if (streamFromRemote) {
        setRemoteStream(streamFromRemote);
      }
    };

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  const ensureLocalMedia = async (type) => {
    const constraints = type === "video" ? { audio: true, video: true } : { audio: true, video: false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    setLocalStream(stream);
    return stream;
  };

  const startOffer = async (peerId, type, stream) => {
    const pc = createPeerConnection(type, peerId, stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    if (type === "video") {
      realtimeCallApi.sendOffer(peerId, offer, activeCallId);
    } else {
      realtimeCallApi.sendVoiceOffer(peerId, offer, activeCallId);
    }
  };

  const applyMessageToConversations = (message) => {
    const senderId = message?.sender?._id || message?.sender;
    const receiverId = message?.receiver?._id || message?.receiver;
    const myId = user?.id;
    const partnerId = String(senderId) === String(myId) ? receiverId : senderId;
    if (!partnerId) return;

    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.user?._id && String(c.user._id) === String(partnerId)
          ? {
              ...c,
              lastMessage: {
                content: message.content || "",
                attachment: message.attachment || null,
                createdAt: message.createdAt || new Date().toISOString(),
              },
            }
          : c
      );
      return updated;
    });
  };

  const loadCallHistory = () => {
    if (!user?.id) return;
    callsApi
      .getHistory()
      .then((res) => setCallHistory(res.data?.data || []))
      .catch(() => setCallHistory([]));
  };

  const getMessageKey = (message) => {
    if (!message) return null;
    const explicitId = message._id || message.id;
    if (explicitId) return String(explicitId);

    const senderId = message?.sender?._id || message?.sender || "unknown-sender";
    const receiverId = message?.receiver?._id || message?.receiver || "unknown-receiver";
    const attachmentUrl = message?.attachment?.url || "";
    return `${senderId}-${receiverId}-${message.createdAt || ""}-${message.content || ""}-${attachmentUrl}`;
  };

  const appendMessageUnique = (previousMessages, incomingMessage) => {
    const incomingKey = getMessageKey(incomingMessage);
    if (!incomingKey) return previousMessages;
    const exists = previousMessages.some((m) => getMessageKey(m) === incomingKey);
    return exists ? previousMessages : [...previousMessages, incomingMessage];
  };

  const loadConversations = () => {
    if (!user?.id) return;
    setLoading((v) => (conversations.length === 0 ? true : v));
    messagesApi
      .getConversations()
      .then((res) => setConversations(res.data.data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();
    const id = window.setInterval(loadConversations, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [user?.id]);

  useEffect(() => {
    loadCallHistory();
  }, [user?.id]);

  useEffect(() => {
    if (!openChatUserId || conversations.length === 0) return;
    const conv = conversations.find(
      (c) => (c.user._id || c.user).toString() === openChatUserId.toString()
    );
    if (conv) {
      setActiveChat(conv);
      setIsMinimized(false);
      setPendingUserId(null);
    } else {
      setPendingUserId(openChatUserId);
    }
  }, [openChatUserId, conversations]);

  useEffect(() => {
    if (!pendingUserId || conversations.length === 0) return;
    const conv = conversations.find(
      (c) => (c.user._id || c.user).toString() === pendingUserId.toString()
    );
    if (conv) {
      setActiveChat(conv);
      setIsMinimized(false);
      setPendingUserId(null);
    }
  }, [pendingUserId, conversations]);

  useEffect(() => {
    const handler = (e) => {
      const userId = e.detail?.userId;
      if (!userId) return;
      setIsMinimized(false);
      setPendingUserId(userId);
    };
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  useEffect(() => {
    if (!showNewChat || !user?.id) return;
    setFriendsLoading(true);
    friendsApi
      .list()
      .then((res) => setFriends(res.data?.data || []))
      .catch(() => setFriends([]))
      .finally(() => setFriendsLoading(false));
  }, [showNewChat, user?.id]);

  const loadActiveConversation = () => {
    if (!activeChat?.user?._id) {
      setMessages([]);
      return;
    }
    setLoading(true);
    messagesApi
      .getConversation(activeChat.user._id)
      .then((res) => {
        setMessages(res.data.data || []);
        window.dispatchEvent(new CustomEvent("messages-read"));
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActiveConversation();
    const id = window.setInterval(loadActiveConversation, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [activeChat?.user?._id]);

  useEffect(() => {
    activeChatIdRef.current = activeChat?.user?._id ? String(activeChat.user._id) : null;
  }, [activeChat?.user?._id]);

  useEffect(() => {
    outgoingCallRef.current = outgoingCall;
  }, [outgoingCall]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    remoteStreamRef.current = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    inCallRef.current = inCall;
  }, [inCall]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const token = localStorage.getItem("token");
    const socket = connectSocket(token);
    if (!socket) return undefined;

    emitSocket("user:online");

    const offPresence = onSocket(socketEvents.PRESENCE, (payload) => {
      const targetUserId = payload?.userId ? String(payload.userId) : null;
      if (!targetUserId) return;
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user?._id && String(conv.user._id) === targetUserId
            ? {
                ...conv,
                user: {
                  ...conv.user,
                  status: payload.status,
                  online: payload.status === "online",
                  lastSeen: payload.lastSeen || null,
                },
              }
            : conv
        )
      );
    });

    const handleIncomingMessage = (message) => {
      if (!message) return;
      const senderId = message?.sender?._id || message?.sender;
      if (senderId && activeChatIdRef.current && String(senderId) === String(activeChatIdRef.current)) {
        setMessages((prev) => appendMessageUnique(prev, message));
      }
      applyMessageToConversations(message);
    };

    const handleSentMessage = (message) => {
      if (!message) return;
      const receiverId = message?.receiver?._id || message?.receiver;
      if (receiverId && activeChatIdRef.current && String(receiverId) === String(activeChatIdRef.current)) {
        setMessages((prev) => appendMessageUnique(prev, message));
      }
      applyMessageToConversations(message);
    };

    const offNew = onSocket(socketEvents.MESSAGE_NEW, handleIncomingMessage);
    const offSent = onSocket(socketEvents.MESSAGE_SENT, handleSentMessage);
    const offVideoRequest = onSocket(socketEvents.VIDEO_CALL_REQUEST, (payload) => {
      if (!payload?.from) return;
      playCalleeRingtone();
      setIncomingCall({ from: payload.from, fromUser: payload.fromUser || null, type: "video", callId: payload.callId || null });
      setCallPeerUser(payload.fromUser || null);
      setCallType("video");
      setActiveCallId(payload.callId || null);
      setCallStatus("Appel video entrant...");
      setCallError("");
    });
    const offVoiceRequest = onSocket(socketEvents.VOICE_CALL_REQUEST, (payload) => {
      if (!payload?.from) return;
      playCalleeRingtone();
      setIncomingCall({ from: payload.from, fromUser: payload.fromUser || null, type: "voice", callId: payload.callId || null });
      setCallPeerUser(payload.fromUser || null);
      setCallType("voice");
      setActiveCallId(payload.callId || null);
      setCallStatus("Appel vocal entrant...");
      setCallError("");
    });
    const offCalleeReady = onSocket("callee-ready", async (payload) => {
      if (!payload?.from || !outgoingCallRef.current || outgoingCallRef.current.type !== "video") return;
      if (String(payload.from) !== String(outgoingCallRef.current.to)) return;
      try {
        const stream = localStreamRef.current || (await ensureLocalMedia("video"));
        setCallStatus("Connexion en cours...");
        stopRingtones();
        if (payload.callId) setActiveCallId(payload.callId);
        await startOffer(payload.from, "video", stream);
      } catch (error) {
        console.error(error);
        resetCallState();
      }
    });
    const offVoiceCalleeReady = onSocket("voice-callee-ready", async (payload) => {
      if (!payload?.from || !outgoingCallRef.current || outgoingCallRef.current.type !== "voice") return;
      if (String(payload.from) !== String(outgoingCallRef.current.to)) return;
      try {
        const stream = localStreamRef.current || (await ensureLocalMedia("voice"));
        setCallStatus("Connexion vocale en cours...");
        stopRingtones();
        if (payload.callId) setActiveCallId(payload.callId);
        await startOffer(payload.from, "voice", stream);
      } catch (error) {
        console.error(error);
        resetCallState();
      }
    });
    const offOffer = onSocket("offer", async (payload) => {
      if (!payload?.from || !payload?.offer) return;
      try {
        const stream = localStreamRef.current || (await ensureLocalMedia("video"));
        const pc = createPeerConnection("video", payload.from, stream);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        realtimeCallApi.sendAnswer(payload.from, answer, payload.callId || activeCallId);
        stopRingtones();
        setInCall(true);
        setCallType("video");
        if (payload.callId) setActiveCallId(payload.callId);
        setCallStatus("Appel video connecte");
        loadCallHistory();
      } catch (error) {
        console.error(error);
        resetCallState();
      }
    });
    const offVoiceOffer = onSocket("voice-offer", async (payload) => {
      if (!payload?.from || !payload?.offer) return;
      try {
        const stream = localStreamRef.current || (await ensureLocalMedia("voice"));
        const pc = createPeerConnection("voice", payload.from, stream);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        realtimeCallApi.sendVoiceAnswer(payload.from, answer, payload.callId || activeCallId);
        stopRingtones();
        setInCall(true);
        setCallType("voice");
        if (payload.callId) setActiveCallId(payload.callId);
        setCallStatus("Appel vocal connecte");
        loadCallHistory();
      } catch (error) {
        console.error(error);
        resetCallState();
      }
    });
    const offAnswer = onSocket("answer", async (payload) => {
      if (!payload?.answer || !peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        stopRingtones();
        setInCall(true);
        if (payload.callId) setActiveCallId(payload.callId);
        setCallStatus("Appel video connecte");
        loadCallHistory();
      } catch (error) {
        console.error(error);
      }
    });
    const offVoiceAnswer = onSocket("voice-answer", async (payload) => {
      if (!payload?.answer || !peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        stopRingtones();
        setInCall(true);
        if (payload.callId) setActiveCallId(payload.callId);
        setCallStatus("Appel vocal connecte");
        loadCallHistory();
      } catch (error) {
        console.error(error);
      }
    });
    const offIce = onSocket("ice-candidate", async (payload) => {
      if (!payload?.candidate || !peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (error) {
        console.error(error);
      }
    });
    const offVoiceIce = onSocket("voice-ice-candidate", async (payload) => {
      if (!payload?.candidate || !peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (error) {
        console.error(error);
      }
    });
    const offVoiceMessage = onSocket(socketEvents.VOICE_MESSAGE, () => {
      loadConversations();
      if (activeChatIdRef.current) loadActiveConversation();
    });
    const offCallBusy = onSocket(socketEvents.CALL_BUSY, (payload) => {
      setCallError(payload?.message || "Utilisateur indisponible.");
      setCallStatus("Appel impossible");
      stopRingtones();
      loadCallHistory();
      resetCallState();
    });
    const offNoAnswer = onSocket(socketEvents.CALL_NO_ANSWER, (payload) => {
      setCallError(payload?.message || "Aucune reponse.");
      setCallStatus("Sans reponse");
      stopRingtones();
      loadCallHistory();
      resetCallState();
    });
    const offVideoEnded = onSocket("video-call-ended", () => {
      loadCallHistory();
      resetCallState();
    });
    const offVoiceEnded = onSocket("voice-call-ended", () => {
      loadCallHistory();
      resetCallState();
    });
    const offScreenStarted = onSocket(socketEvents.SCREEN_SHARE_STARTED, () => setCallStatus("Partage d'ecran actif"));
    const offScreenStopped = onSocket(socketEvents.SCREEN_SHARE_STOPPED, () => setCallStatus(inCallRef.current ? "Appel en cours" : ""));

    return () => {
      offPresence();
      offNew();
      offSent();
      offVideoRequest();
      offVoiceRequest();
      offCalleeReady();
      offVoiceCalleeReady();
      offOffer();
      offVoiceOffer();
      offAnswer();
      offVoiceAnswer();
      offIce();
      offVoiceIce();
      offVoiceMessage();
      offCallBusy();
      offNoAnswer();
      offVideoEnded();
      offVoiceEnded();
      offScreenStarted();
      offScreenStopped();
      resetCallState();
      disconnectSocket();
    };
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!recording || !recordingStartedAt) return undefined;
    const timerId = window.setInterval(() => {
      setRecordingElapsedSec(Math.max(0, Math.floor((Date.now() - recordingStartedAt) / 1000)));
    }, 300);
    return () => window.clearInterval(timerId);
  }, [recording, recordingStartedAt]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream || null;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream || null;
  }, [remoteStream]);

  useEffect(() => {
    if (localAudioRef.current) localAudioRef.current.srcObject = localStream || null;
  }, [localStream]);

  useEffect(() => {
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream || null;
  }, [remoteStream]);

  const handleSelectChat = (conv) => {
    setActiveChat(conv);
  };

  const handleStartChatWithFriend = (friend) => {
    if (!friend?._id) return;
    const existing = conversations.find((c) => c.user._id === friend._id);
    const conv = existing || { user: friend, lastMessage: null };
    if (!existing) {
      setConversations((prev) => [conv, ...prev]);
    }
    setActiveChat(conv);
    setShowNewChat(false);
  };

  const handleSend = async (attachmentFile = null) => {
    const text = inputText.trim();
    if ((!text && !attachmentFile) || !activeChat?.user?._id || sending) return;
    setSending(true);
    try {
      let createdMessage = null;
      if (attachmentFile) {
        const formData = new FormData();
        formData.append("receiverId", String(activeChat.user._id));
        formData.append("content", text);
        formData.append("attachment", attachmentFile);
        const res = await messagesApi.send(formData);
        createdMessage = res.data.data;
        setMessages((prev) => appendMessageUnique(prev, createdMessage));
      } else {
        const res = await messagesApi.send({ receiverId: activeChat.user._id, content: text });
        createdMessage = res.data.data;
        setMessages((prev) => appendMessageUnique(prev, createdMessage));
      }
      setInputText("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (createdMessage) {
        if (createdMessage?.attachment?.type === "audio") {
          realtimeCallApi.notifyVoiceMessage(activeChat.user._id, {
            messageId: createdMessage._id || createdMessage.id,
            attachment: createdMessage.attachment,
            createdAt: createdMessage.createdAt,
          });
        }

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.user?._id && String(c.user._id) === String(activeChat.user._id)
              ? {
                  ...c,
                  lastMessage: {
                    content: createdMessage.content || "",
                    createdAt: createdMessage.createdAt || new Date().toISOString(),
                  },
                }
              : c
          );

          const exists = updated.some(
            (c) => c.user?._id && String(c.user._id) === String(activeChat.user._id)
          );
          if (!exists) {
            return [
              {
                user: activeChat.user,
                lastMessage: {
                  content: createdMessage.content || "",
                  createdAt: createdMessage.createdAt || new Date().toISOString(),
                },
              },
              ...updated,
            ];
          }
          return updated;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat?.user?._id) return;
    handleSend(file);
  };

  const startCall = async (type) => {
    if (!activeChat?.user?._id) return;
    try {
      const stream = await ensureLocalMedia(type);
      setCallError("");
      setCallType(type);
      setCallPeerUser(activeChat.user);
      setOutgoingCall({ to: activeChat.user._id, type });
      setCallStatus(type === "video" ? "Appel video..." : "Appel vocal...");
      setInCall(false);
      playCallerRingtone();

      if (type === "video") {
        realtimeCallApi.requestVideoCall(activeChat.user._id, {
          _id: user?.id,
          name: user?.name,
          profilePicture: user?.profilePicture,
        });
        emitSocket("join-video-call", { otherUserId: activeChat.user._id });
      } else {
        realtimeCallApi.requestVoiceCall(activeChat.user._id, {
          _id: user?.id,
          name: user?.name,
          profilePicture: user?.profilePicture,
        });
        emitSocket("join-voice-call", { otherUserId: activeChat.user._id });
      }

      setLocalStream(stream);
    } catch (error) {
      console.error(error);
      setCallStatus("Impossible d'acceder au micro/camera");
      resetCallState();
    }
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall?.from || !incomingCall?.type) return;
    try {
      const stream = await ensureLocalMedia(incomingCall.type);
      setCallError("");
      setCallType(incomingCall.type);
      setActiveCallId(incomingCall.callId || null);
      setOutgoingCall(null);
      setInCall(true);
      setCallStatus(incomingCall.type === "video" ? "Connexion video..." : "Connexion vocale...");
      stopRingtones();
      setLocalStream(stream);

      if (incomingCall.type === "video") {
        emitSocket("join-video-call", { otherUserId: incomingCall.from });
        emitSocket("callee-ready", { to: incomingCall.from, callId: incomingCall.callId || null });
      } else {
        emitSocket("join-voice-call", { otherUserId: incomingCall.from });
        emitSocket("voice-callee-ready", { to: incomingCall.from, callId: incomingCall.callId || null });
      }
    } catch (error) {
      console.error(error);
      resetCallState();
    }
  };

  const declineIncomingCall = () => {
    if (incomingCall?.from) {
      emitCallEvent("video-call-ended", "voice-call-ended", { to: incomingCall.from, callId: incomingCall.callId || activeCallId });
    }
    stopRingtones();
    loadCallHistory();
    resetCallState();
  };

  const endCurrentCall = () => {
    const peerId = getCurrentPeerId();
    if (peerId) {
      emitCallEvent("video-call-ended", "voice-call-ended", { to: peerId, callId: activeCallId });
    }
    stopRingtones();
    loadCallHistory();
    resetCallState();
  };

  const toggleScreenShare = async () => {
    if (callType !== "video" || !peerConnectionRef.current || !localStream) return;
    const peerId = getCurrentPeerId();
    const sender = peerConnectionRef.current
      .getSenders()
      .find((s) => s.track && s.track.kind === "video");
    if (!sender) return;

    if (screenSharing) {
      const cameraTrack = localStream.getVideoTracks()[0];
      if (cameraTrack) {
        await sender.replaceTrack(cameraTrack);
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      setScreenSharing(false);
      if (peerId) realtimeCallApi.notifyScreenShareStopped(peerId, activeCallId);
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const displayTrack = displayStream.getVideoTracks()[0];
      await sender.replaceTrack(displayTrack);
      screenStreamRef.current = displayStream;
      setScreenSharing(true);
      if (peerId) realtimeCallApi.notifyScreenShareStarted(peerId, activeCallId);

      displayTrack.onended = async () => {
        const cameraTrack = localStream.getVideoTracks()[0];
        if (cameraTrack && peerConnectionRef.current) {
          const currentSender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (currentSender) await currentSender.replaceTrack(cameraTrack);
        }
        setScreenSharing(false);
        if (peerId) realtimeCallApi.notifyScreenShareStopped(peerId, activeCallId);
      };
    } catch (error) {
      console.error(error);
    }
  };

  const toggleVoiceRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      setRecordingStartedAt(null);
      setRecordingElapsedSec(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) recorderChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(recorderChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        await handleSend(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingStartedAt(Date.now());
      setRecordingElapsedSec(0);
      setRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const formatAudioTime = (secondsValue) => {
    const seconds = Math.max(0, Math.floor(Number(secondsValue) || 0));
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const toggleAudioMessagePlayback = (messageKey) => {
    const audioEl = audioPlayersRef.current[messageKey];
    if (!audioEl) return;

    if (playingAudioId && playingAudioId !== messageKey) {
      const currentAudio = audioPlayersRef.current[playingAudioId];
      if (currentAudio) currentAudio.pause();
    }

    if (audioEl.paused) {
      audioEl.play().then(() => setPlayingAudioId(messageKey)).catch(console.error);
    } else {
      audioEl.pause();
      setPlayingAudioId((prev) => (prev === messageKey ? null : prev));
    }
  };

  const performDelete = async (messageId, scope) => {
    try {
      await messagesApi.delete(messageId, scope);
      setMessages((prev) => prev.filter((m) => (m._id || m.id) !== messageId));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteModalMessageId(null);
      setDeleteForMeMessageId(null);
    }
  };

  const handleClearConversationConfirm = async () => {
    if (!activeChat?.user?._id || !messages.length) {
      setShowClearConversationModal(false);
      return;
    }
    try {
      const ids = messages.map((m) => m._id || m.id).filter(Boolean);
      // Supprimer pour moi uniquement, message par message
      // (utilise la logique hiddenFor côté backend)
      // On envoie les requêtes en série pour rester simple
      // et éviter de saturer l'API.
      // eslint-disable-next-line no-restricted-syntax
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        await messagesApi.delete(id, "forMe");
      }
      setMessages([]);
      setConversations((prev) =>
        prev.map((c) =>
          c.user?._id && String(c.user._id) === String(activeChat.user._id)
            ? { ...c, lastMessage: null }
            : c
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setShowClearConversationModal(false);
    }
  };

  const handleDeleteMessage = (msg, scope) => {
    const messageId = msg?._id || msg?.id || msg;
    const senderId = msg?.sender?._id || msg?.sender;
    const isMyMessage = user?.id && String(senderId) === String(user.id);
    if (scope) {
      performDelete(messageId, scope);
      return;
    }
    if (!isMyMessage) {
      setDeleteForMeMessageId(messageId);
      return;
    }
    setDeleteModalMessageId(messageId);
  };

  const insertEmoji = (emoji) => {
    setInputText((t) => t + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString();
  };

  const isUserOnline = (u) => u?.status === "online" || u?.online === true;
  const callStatusLabelMap = {
    terminated: "Appel termine",
    no_answer: "Appel sans reponse",
    rejected: "Appel refuse",
    busy: "Utilisateur occupe",
    in_progress: "Appel en cours",
    ringing: "Vous appelez...",
    failed: "Echec d'appel",
  };

  const filteredCallHistory = activeChat?.user?._id
    ? callHistory.filter((row) => {
        const callerId = row?.caller?._id || row?.caller;
        const calleeId = row?.callee?._id || row?.callee;
        return (
          (String(callerId) === String(user?.id) && String(calleeId) === String(activeChat.user._id)) ||
          (String(calleeId) === String(user?.id) && String(callerId) === String(activeChat.user._id))
        );
      }).slice(0, 5)
    : [];

  const timelineItems = [
    ...filteredCallHistory.map((row) => ({
      kind: "call",
      id: `call-${row.callId}-${row.createdAt || row.endedAt || ""}`,
      at: row.endedAt || row.createdAt || null,
      payload: row,
    })),
    ...messages.map((msg) => ({
      kind: "message",
      id: getMessageKey(msg) || `message-${msg.createdAt || ""}`,
      at: msg.createdAt || null,
      payload: msg,
    })),
  ].sort((a, b) => new Date(a.at || 0).getTime() - new Date(b.at || 0).getTime());

  return (
    <div className="fixed bottom-0 right-8 flex items-end gap-4 z-[100] font-sans">
      <div
        className={`w-80 bg-white shadow-2xl rounded-t-xl border border-slate-200 transition-all duration-300 ${isMinimized ? "h-12" : "h-[500px]"}`}
      >
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-3 flex items-center justify-between cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
              {user?.profilePicture ? (
                <img src={resolveAvatarUrl(user.profilePicture)} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] && <span className="flex items-center justify-center h-full text-sm font-bold text-indigo-600">{user.name[0]}</span>
              )}
              {/* Current user is always considered online on this client */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <span className="text-sm font-black text-slate-800 tracking-tight">Messaging</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <FiMoreHorizontal size={18} className="hover:text-indigo-600" />
            <FiEdit
              size={16}
              className="hover:text-indigo-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewChat((v) => !v);
              }}
            />
            {isMinimized ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          </div>
        </div>

        {!isMinimized && (
          <div className="flex flex-col h-[452px]">
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search messages" className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-8 text-xs focus:ring-2 focus:ring-indigo-500" />
                <FiSliders className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {loading && !activeChat ? (
                <p className="p-3 text-xs text-slate-500">Loading...</p>
              ) : (
                conversations.map((conv) => {
                  if (!conv || !conv.user) return null;
                  const convUser = conv.user;
                  const convId = convUser._id || convUser.id;
                  const isOnline = isUserOnline(convUser);
                  return (
                    <div
                      key={convId}
                      onClick={() => handleSelectChat(conv)}
                      className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 ${
                        activeChat?.user?._id && convId && String(activeChat.user._id) === String(convId)
                          ? "bg-indigo-50"
                          : ""
                      }`}
                    >
                      <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        {convUser.profilePicture ? (
                          <img src={resolveAvatarUrl(convUser.profilePicture)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          convUser.name?.[0] || "?"
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-[13px] font-black text-slate-800 truncate">
                            {convUser.name || convUser.email}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {formatTime(conv.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <div className="mt-0.5">
                          <span
                            className={
                              "inline-block w-2.5 h-2.5 rounded-full " +
                              (isOnline ? "bg-emerald-500" : "bg-rose-500")
                            }
                          />
                        </div>
                        <p className="text-xs text-slate-500 truncate font-medium">
                          {conv.lastMessage?.content ||
                            (conv.lastMessage?.attachment ? "📎 Pièce jointe" : "No messages")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {showNewChat && !isMinimized && (
        <div className="absolute bottom-12 right-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-[101]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.18em]">
              New message
            </span>
            <button
              type="button"
              onClick={() => setShowNewChat(false)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <FiX size={14} />
            </button>
          </div>
          {friendsLoading ? (
            <p className="text-xs text-slate-400">Chargement des amis...</p>
          ) : friends.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun ami pour le moment.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
              {friends.map((f) => {
                if (!f) return null;
                const friendId = f._id || f.id;
                const isOnline = isUserOnline(f);
                return (
                  <button
                    key={friendId}
                    type="button"
                    onClick={() => handleStartChatWithFriend(f)}
                    className="w-full flex items-center gap-3 py-2 text-left hover:bg-slate-50 px-1"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0 relative">
                      {f.profilePicture ? (
                        <img src={resolveAvatarUrl(f.profilePicture)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        f.name?.[0] || "?"
                      )}
                      <span
                        className={
                          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white " +
                          (isOnline ? "bg-emerald-500" : "bg-rose-500")
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-semibold text-slate-800">
                        {f.name || f.email}
                      </span>
                      <span
                        className={
                          "mt-0.5 inline-block w-2.5 h-2.5 rounded-full " +
                          (isOnline ? "bg-emerald-500" : "bg-rose-500")
                        }
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeChat?.user && (
        <div className="w-80 h-[450px] bg-white shadow-2xl rounded-t-xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-2.5 flex items-center justify-between border-b border-slate-100 bg-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0 relative">
                {activeChat.user.profilePicture ? (
                  <img src={resolveAvatarUrl(activeChat.user.profilePicture)} alt="" className="w-full h-full object-cover" />
                ) : (
                  activeChat.user.name?.[0] || "?"
                )}
                <span
                  className={
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white " +
                    (isUserOnline(activeChat.user) ? "bg-emerald-500" : "bg-rose-500")
                  }
                />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 leading-none flex items-center gap-1">
                  {activeChat.user.name || activeChat.user.email}
                </h4>
                <p
                  className={
                    "text-[9px] font-bold mt-1 " +
                    (isUserOnline(activeChat.user) ? "text-emerald-500" : "text-slate-400")
                  }
                >
                  {isUserOnline(activeChat.user) ? "En ligne" : "Hors ligne"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-indigo-600">
              <FiPhone
                size={14}
                className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6"
                onClick={() => startCall("voice")}
                title="Appel vocal"
              />
              <FiVideo
                size={14}
                className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6"
                onClick={() => startCall("video")}
                title="Appel video"
              />
              <FiTrash2
                size={14}
                className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6"
                onClick={() => setShowClearConversationModal(true)}
                title="Supprimer la conversation (pour vous)"
              />
              <FiMinus onClick={() => setActiveChat(null)} size={14} className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6" />
              <FiX onClick={() => setActiveChat(null)} size={14} className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6" />
            </div>
          </div>

          {callError && (
            <div className="mx-3 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              {callError}
            </div>
          )}

          <div className="flex-grow p-4 bg-slate-50/50 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {timelineItems.map((item) => {
              if (item.kind === "call") {
                const row = item.payload;
                const callerId = row?.caller?._id || row?.caller;
                const iCalled = String(callerId) === String(user?.id);
                return (
                  <div
                    key={item.id}
                    className="self-center max-w-[90%] px-3 py-2 rounded-2xl bg-slate-200/80 text-slate-700 text-[11px] font-semibold"
                  >
                    <span>{iCalled ? "Vous appelez" : "Vous etes appele"} - {callStatusLabelMap[row.status] || row.status}</span>
                    <span className="ml-2 text-slate-500 font-medium">{formatTime(row.endedAt || row.createdAt)}</span>
                  </div>
                );
              }

              const msg = item.payload;
              const senderId = msg.sender?._id || msg.sender;
              const isMe = user?.id && String(senderId) === String(user.id);
              const att = msg.attachment;
              const attachmentUrl = att?.url ? (att.url.startsWith("http") ? att.url : `${API_BASE}${att.url}`) : null;
              const messageKey = item.id;
              return (
                <div
                  key={messageKey}
                  className={`group relative p-3 rounded-2xl max-w-[85%] shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-none self-end" : "bg-white border border-slate-100 rounded-tl-none"}`}
                >
                  {att && attachmentUrl && (
                    <div className="mb-2">
                      {att.type === "image" && (
                        <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden max-w-[220px]">
                          <img src={attachmentUrl} alt={att.originalName || "Image"} className="w-full h-auto object-cover" />
                        </a>
                      )}
                      {att.type === "video" && (
                        <video src={attachmentUrl} controls className="rounded-lg max-h-40 w-full" />
                      )}
                      {att.type === "audio" && (
                        <div className={`rounded-2xl px-3 py-2 w-[220px] ${isMe ? "bg-white/20" : "bg-slate-100"}`}>
                          <audio
                            ref={(el) => {
                              if (el) audioPlayersRef.current[messageKey] = el;
                            }}
                            src={attachmentUrl}
                            preload="metadata"
                            className="hidden"
                            onLoadedMetadata={(e) => {
                              const d = Number(e.currentTarget.duration || 0);
                              setAudioDurationMap((prev) => ({ ...prev, [messageKey]: d }));
                            }}
                            onTimeUpdate={(e) => {
                              const el = e.currentTarget;
                              const d = Number(el.duration || 0);
                              const p = d > 0 ? (el.currentTime / d) * 100 : 0;
                              setAudioProgressMap((prev) => ({ ...prev, [messageKey]: p }));
                            }}
                            onEnded={() => setPlayingAudioId((prev) => (prev === messageKey ? null : prev))}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleAudioMessagePlayback(messageKey)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center ${isMe ? "bg-white text-indigo-600" : "bg-slate-800 text-white"}`}
                            >
                              {playingAudioId === messageKey ? <FiPause size={14} /> : <FiPlay size={14} />}
                            </button>
                            <div className="flex items-end gap-[2px] flex-1 h-8">
                              {Array.from({ length: 26 }).map((_, i) => {
                                const base = 20 + ((i * 13) % 70);
                                const active = (audioProgressMap[messageKey] || 0) >= ((i + 1) / 26) * 100;
                                return (
                                  <span
                                    key={`${messageKey}-bar-${i}`}
                                    className={`w-[3px] rounded-full ${active ? (isMe ? "bg-white" : "bg-slate-900") : (isMe ? "bg-indigo-200/70" : "bg-slate-400")}`}
                                    style={{ height: `${8 + Math.round((base / 100) * 18)}px` }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                          <div className={`mt-1 text-[10px] ${isMe ? "text-indigo-100" : "text-slate-500"}`}>
                            {formatAudioTime(audioDurationMap[messageKey] || 0)}
                          </div>
                        </div>
                      )}
                      {att.type === "file" && (
                        <a href={attachmentUrl} download={att.originalName} className={`text-xs underline ${isMe ? "text-indigo-200" : "text-indigo-600"}`}>
                          📎 {att.originalName || "Fichier"}
                        </a>
                      )}
                    </div>
                  )}
                  {msg.content ? <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p> : null}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg)}
                      className="p-1 rounded hover:bg-white/20 opacity-90"
                      title="Supprimer"
                    >
                      <FiTrash2 size={12} />
                    </button>
                    <p className={`text-[9px] ${isMe ? "text-indigo-200" : "text-slate-400"}`}>{formatTime(msg.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-100 relative">
            <input
              ref={fileInputRef}
              type="file"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              className="hidden"
              onChange={handleFileSelect}
            />
            {recording && (
              <div className="mb-2 flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 text-red-600 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Recording... {formatAudioTime(recordingElapsedSec)}
                </div>
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className="text-[11px] text-red-700 hover:text-red-800 font-bold"
                >
                  Stop & Send
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-2">
              <input
                type="text"
                placeholder="Message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-grow bg-transparent border-none focus:ring-0 text-xs py-1"
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg" title="Fichier, image ou vidéo">
                <FiPaperclip size={18} />
              </button>
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-1.5 rounded-lg ${recording ? "bg-red-100 text-red-600" : "text-slate-600 hover:bg-slate-200"}`}
                title={recording ? "Stop enregistrement vocal" : "Message vocal"}
              >
                <FiMic size={18} />
              </button>
              <button onClick={() => handleSend()} disabled={sending || !inputText.trim()} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg disabled:opacity-50">
                <FiSend size={18} />
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className={`p-1.5 rounded-lg ${showEmojiPicker ? "bg-slate-200 text-indigo-600" : "text-slate-400 hover:bg-slate-200"}`}
                title="Emoji"
              >
                <FiSmile size={18} />
              </button>
            </div>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-3 right-3 mb-1 p-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {EMOJI_LIST.map((emoji, index) => (
                    <button key={`emoji-${index}`} type="button" onClick={() => insertEmoji(emoji)} className="p-1 text-lg hover:bg-slate-100 rounded leading-none">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {incomingCall && !inCall && (
        <div className="fixed top-6 right-6 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-[220] w-80">
          <p className="text-sm font-semibold text-slate-800 mb-1">
            {incomingCall.type === "video" ? "Appel video entrant" : "Appel vocal entrant"}
          </p>
          <p className="text-xs text-slate-500 mb-3">
            {incomingCall.fromUser?.name || "Utilisateur"} vous appelle
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={acceptIncomingCall}
              className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-sm hover:bg-emerald-600"
            >
              Accepter
            </button>
            <button
              type="button"
              onClick={declineIncomingCall}
              className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
            >
              Refuser
            </button>
          </div>
        </div>
      )}

      {(callType || outgoingCall || inCall) && (
        <div className="fixed inset-0 bg-black/60 z-[210] flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white rounded-2xl shadow-2xl w-full max-w-4xl p-4">
            <audio ref={localAudioRef} autoPlay muted />
            <audio ref={remoteAudioRef} autoPlay />
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold">
                  {callType === "video" ? "Appel video" : "Appel vocal"}
                </p>
                <p className="text-xs text-slate-300">
                  {callPeerUser?.name || activeChat?.user?.name || "Utilisateur"} - {callStatus || "En attente..."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {callType === "video" && inCall && (
                  <button
                    type="button"
                    onClick={toggleScreenShare}
                    className={`p-2 rounded-lg ${screenSharing ? "bg-amber-500 text-slate-900" : "bg-slate-800 hover:bg-slate-700"}`}
                    title="Partager l'ecran"
                  >
                    <FiMonitor size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={endCurrentCall}
                  className="p-2 rounded-lg bg-red-600 hover:bg-red-700"
                  title="Terminer l'appel"
                >
                  <FiPhone size={18} />
                </button>
              </div>
            </div>

            <div className={`grid gap-3 ${callType === "video" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              <div className="bg-slate-900 rounded-xl min-h-48 p-2 flex items-center justify-center">
                {callType === "video" ? (
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-h-80 rounded-lg object-cover [transform:scaleX(-1)]" />
                ) : (
                  <p className="text-slate-300 text-sm">Micro local actif</p>
                )}
              </div>
              {callType === "video" && (
                <div className="bg-slate-900 rounded-xl min-h-48 p-2 flex items-center justify-center">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full max-h-80 rounded-lg object-cover [transform:scaleX(-1)]" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer conversation (pour vous uniquement) */}
      {showClearConversationModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setShowClearConversationModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-slate-800 mb-3">
              Supprimer toute la conversation pour vous ?
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleClearConversationConfirm}
                className="w-full py-2.5 px-3 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Supprimer la conversation
              </button>
              <button
                type="button"
                onClick={() => setShowClearConversationModal(false)}
                className="w-full py-2 px-3 rounded-lg text-slate-600 text-sm hover:bg-slate-100"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer message de l'autre (pour vous uniquement) */}
      {deleteForMeMessageId && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setDeleteForMeMessageId(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-slate-800 mb-3">Supprimer ce message pour vous ?</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => performDelete(deleteForMeMessageId, "forMe")}
                className="w-full py-2.5 px-3 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setDeleteForMeMessageId(null)}
                className="w-full py-2 px-3 rounded-lg text-slate-600 text-sm hover:bg-slate-100"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer message (pour moi / pour tout le monde) */}
      {deleteModalMessageId && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setDeleteModalMessageId(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-slate-800 mb-3">Supprimer ce message ?</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => performDelete(deleteModalMessageId, "forEveryone")}
                className="w-full py-2.5 px-3 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Supprimer pour tout le monde
              </button>
              <button
                type="button"
                onClick={() => performDelete(deleteModalMessageId, "forMe")}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300"
              >
                Supprimer pour moi
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalMessageId(null)}
                className="w-full py-2 px-3 rounded-lg text-slate-600 text-sm hover:bg-slate-100"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Messaging;
