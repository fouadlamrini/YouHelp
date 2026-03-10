import React, { useState, useEffect, useRef } from "react";
import {
  FiEdit, FiMoreHorizontal, FiChevronUp, FiChevronDown, FiSearch, FiSliders, FiX, FiVideo, FiPhone, FiMinus, FiSmile, FiImage, FiPaperclip, FiSend, FiTrash2, FiMic,
} from "react-icons/fi";
import { messagesApi, friendsApi, API_BASE } from "../services/api";
import { getSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import VideoCall from "./VideoCall.jsx";
import VoiceCall from "./VoiceCall.jsx";
import VoiceMessageBubble from "./VoiceMessageBubble.jsx";

const RINGTONE_OUTGOING = "/sounds/bruit tonalité du telephone.mp3";
const RINGTONE_INCOMING = "/sounds/Toque Galaxy Bells (Samsung).mp3";

function resolveAvatarUrl(src) {
  if (!src) return `${API_BASE}/avatars/default-avatar.jpg`;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_BASE}${src}`;
  if (src === "default-avatar.png" || src === "default-avatar.jpg") return `${API_BASE}/avatars/default-avatar.jpg`;
  return `${API_BASE}/avatars/${src}`;
}

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
  const [videoCall, setVideoCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [voiceCall, setVoiceCall] = useState(null);
  const [incomingVoiceCall, setIncomingVoiceCall] = useState(null);
  const outgoingRingtoneRef = useRef(null);
  const incomingRingtoneRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const [pendingUserId, setPendingUserId] = useState(null);
  const callConnectedAtRef = useRef(null);
  const [deleteModalMessageId, setDeleteModalMessageId] = useState(null);
  const [deleteForMeMessageId, setDeleteForMeMessageId] = useState(null);
  const [showClearConversationModal, setShowClearConversationModal] = useState(false);

  const EMOJI_LIST = "😀 😃 😄 😁 🥹 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 😎 🤓 😏 😒 🙄 😬 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😶 😐 😑 😯 😦 😧 😮 😲 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤠 🥳 🥸 😈 👿 👹 👺 💀 ☠️ 💩 🤡 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾 👍 👎 👊 ✊ 🤛 🤜 🤞 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 💪 🦾 🙏 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝".split(/\s+/).filter(Boolean);
  const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  const appendSystemMessageForUser = (otherUserId, text) => {
    if (!user?.id || !otherUserId || !text) return;
    const now = new Date().toISOString();
    if (activeChat?.user?._id && String(activeChat.user._id) === String(otherUserId)) {
      const systemMsg = {
        _id: `sys-${Date.now()}-${Math.random()}`,
        sender: { _id: user.id },
        content: text,
        createdAt: now,
        isSystem: true,
      };
      setMessages((prev) => [...prev, systemMsg]);
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.user?._id && String(c.user._id) === String(otherUserId)
          ? {
              ...c,
              lastMessage: {
                content: text,
                createdAt: now,
              },
            }
          : c
      )
    );
  };

  const appendCallMessage = (otherUserId, payload) => {
    if (!user?.id || !otherUserId || !payload?.callKind || !payload?.callStatus) return;
    const kindLabel = payload.callKind === "video" ? "Appel vidéo" : "Appel vocal";
    const statusLabel =
      payload.callStatus === "missed"
        ? "Sans réponse"
        : payload.durationSec != null
          ? `${payload.durationSec} s`
          : "Terminé";
    const shortText = `${kindLabel} • ${statusLabel}`;
    const now = new Date().toISOString();
    const tempId = `call-${Date.now()}-${Math.random()}`;
    if (activeChat?.user?._id && String(activeChat.user._id) === String(otherUserId)) {
      const systemMsg = {
        _id: tempId,
        sender: { _id: user.id },
        content: shortText,
        createdAt: now,
        isSystem: true,
        systemType: "call",
        callPayload: payload,
      };
      setMessages((prev) => [...prev, systemMsg]);
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.user?._id && String(c.user._id) === String(otherUserId)
          ? { ...c, lastMessage: { content: shortText, createdAt: now } }
          : c
      )
    );
    messagesApi
      .send({
        receiverId: String(otherUserId),
        content: shortText,
        type: "call",
        callPayload: payload,
      })
      .then((res) => {
        const created = res.data?.data;
        if (!created?._id) return;
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId
              ? { ...created, callPayload: created.callPayload || payload, sender: created.sender || { _id: user.id } }
              : m
          )
        );
      })
      .catch(() => {});
  };

  const stopOutgoingRingtone = () => {
    const audio = outgoingRingtoneRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      outgoingRingtoneRef.current = null;
    }
  };

  const stopIncomingRingtone = () => {
    const audio = incomingRingtoneRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      incomingRingtoneRef.current = null;
    }
  };

  const playOutgoingRingtone = () => {
    stopOutgoingRingtone();
    const audio = new Audio(RINGTONE_OUTGOING);
    audio.loop = true;
    audio.play().catch(() => {});
    outgoingRingtoneRef.current = audio;
  };

  const playIncomingRingtone = () => {
    stopIncomingRingtone();
    const audio = new Audio(RINGTONE_INCOMING);
    audio.loop = true;
    audio.play().catch(() => {});
    incomingRingtoneRef.current = audio;
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    messagesApi
      .getConversations()
      .then((res) => setConversations(res.data.data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
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

  useEffect(() => {
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
  }, [activeChat?.user?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    const onMessage = (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      const receiverId = msg.receiver?._id || msg.receiver;
      const myId = user?.id;

      // Si c'est moi qui ai envoyé le message sur CE client,
      // on ne l'ajoute pas une 2ème fois (handleSend l'a déjà ajouté).
      if (myId && String(senderId) === String(myId)) {
        return;
      }

      const otherUser =
        myId && String(senderId) === String(myId)
          ? msg.receiver
          : msg.sender;

      if (activeChat?.user?._id && otherUser?._id && String(activeChat.user._id) === String(otherUser._id)) {
        setMessages((prev) => [...prev, msg]);
      }

      setConversations((prev) => {
        let found = false;
        const updated = prev.map((c) => {
          const convUserId = c.user?._id || c.user;
          if (
            (convUserId && otherUser?._id && String(convUserId) === String(otherUser._id)) ||
            (convUserId && (String(convUserId) === String(senderId) || String(convUserId) === String(receiverId)))
          ) {
            found = true;
            return {
              ...c,
              user: c.user?._id ? c.user : otherUser || c.user,
              lastMessage: {
                content: msg.content || "",
                createdAt: msg.createdAt || new Date().toISOString(),
              },
            };
          }
          return c;
        });

        if (!found && otherUser && otherUser._id) {
          return [
            {
              user: otherUser,
              lastMessage: {
                content: msg.content || "",
                createdAt: msg.createdAt || new Date().toISOString(),
              },
            },
            ...updated,
          ];
        }

        return updated;
      });
    };

    const onVideoCallRequest = (data) => {
      if (data.to === user?.id && !videoCall && !incomingCall && !voiceCall && !incomingVoiceCall) {
        const otherName = data.fromUser?.name || data.fromUser?.email || "Un utilisateur";
        setIncomingCall({
          currentUserId: user.id,
          otherUserId: data.from,
          isInitiator: false,
          otherUserName: otherName,
        });
        playIncomingRingtone();
      }
    };

    const onVoiceCallRequest = (data) => {
      if (data.to === user?.id && !videoCall && !incomingCall && !voiceCall && !incomingVoiceCall) {
        const otherName = data.fromUser?.name || data.fromUser?.email || "Un utilisateur";
        setIncomingVoiceCall({
          currentUserId: user.id,
          otherUserId: data.from,
          isInitiator: false,
          otherUserName: otherName,
        });
        playIncomingRingtone();
      }
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => (m._id || m.id) !== messageId));
    };
    const onMessageReaction = ({ message: updatedMessage }) => {
      if (!updatedMessage) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id || m.id === updatedMessage._id ? { ...m, reactions: updatedMessage.reactions || [] } : m))
      );
    };

    const onVideoCallEnded = (data) => {
      stopOutgoingRingtone();
      stopIncomingRingtone();
      const wasInCall = !!videoCall;
      const direction =
        videoCall && typeof videoCall.isInitiator === "boolean"
          ? videoCall.isInitiator
            ? "outgoing"
            : "incoming"
          : incomingCall
            ? "incoming"
            : "incoming";
      if (callConnectedAtRef.current) callConnectedAtRef.current = null;
      setVideoCall(null);
      setIncomingCall(null);
      if (data?.from) {
        appendCallMessage(data.from, {
          callKind: "video",
          callStatus: wasInCall ? "ended" : "missed",
          direction,
        });
      }
    };
    const onVoiceCallEnded = (data) => {
      stopOutgoingRingtone();
      stopIncomingRingtone();
      const wasInCall = !!voiceCall;
      const direction =
        voiceCall && typeof voiceCall.isInitiator === "boolean"
          ? voiceCall.isInitiator
            ? "outgoing"
            : "incoming"
          : incomingVoiceCall
            ? "incoming"
            : "incoming";
      if (callConnectedAtRef.current) callConnectedAtRef.current = null;
      setVoiceCall(null);
      setIncomingVoiceCall(null);
      if (data?.from) {
        appendCallMessage(data.from, {
          callKind: "voice",
          callStatus: wasInCall ? "ended" : "missed",
          direction,
        });
      }
    };

    socket.on("message", onMessage);
    socket.on("video-call-request", onVideoCallRequest);
    socket.on("voice-call-request", onVoiceCallRequest);
    socket.on("message-deleted", onMessageDeleted);
    socket.on("message-reaction", onMessageReaction);
    socket.on("video-call-ended", onVideoCallEnded);
    socket.on("voice-call-ended", onVoiceCallEnded);

    return () => {
      socket.off("message", onMessage);
      socket.off("video-call-request", onVideoCallRequest);
      socket.off("voice-call-request", onVoiceCallRequest);
      socket.off("message-deleted", onMessageDeleted);
      socket.off("message-reaction", onMessageReaction);
      socket.off("video-call-ended", onVideoCallEnded);
      socket.off("voice-call-ended", onVoiceCallEnded);
    };
  }, [activeChat?.user?._id, user?.id, videoCall, incomingCall, voiceCall, incomingVoiceCall]);

  // Real-time presence updates for conversations and active chat
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user?.id) return;
    const handler = ({ userId, status, lastSeen }) => {
      const id = String(userId);
      setConversations((prev) =>
        prev.map((c) => {
          if (!c || !c.user) return c;
          const convUserId = c.user._id || c.user.id || c.user;
          if (!convUserId || String(convUserId) !== id) return c;
          return {
            ...c,
            user: {
              ...c.user,
              online: status === "online",
              lastSeen: lastSeen || c.user.lastSeen,
            },
          };
        })
      );
      setActiveChat((prev) => {
        if (!prev || !prev.user?._id) return prev;
        if (String(prev.user._id) !== id) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            online: status === "online",
            lastSeen: lastSeen || prev.user.lastSeen,
          },
        };
      });
    };
    socket.on("user:status", handler);
    return () => {
      socket.off("user:status", handler);
    };
  }, [user?.id]);

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
        setMessages((prev) => [...prev, createdMessage]);
      } else {
        const res = await messagesApi.send({ receiverId: activeChat.user._id, content: text });
        createdMessage = res.data.data;
        setMessages((prev) => [...prev, createdMessage]);
      }
      setInputText("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (createdMessage) {
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

  const handleToggleReaction = async (messageId, emoji) => {
    setReactionPickerMsgId(null);
    try {
      const res = await messagesApi.reaction(messageId, emoji);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId || m.id === messageId ? { ...m, reactions: res.data.data?.reactions || [] } : m))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getReactionsGrouped = (reactions) => {
    if (!reactions?.length) return [];
    const byEmoji = {};
    reactions.forEach((r) => {
      const e = r.emoji || "👍";
      if (!byEmoji[e]) byEmoji[e] = { emoji: e, count: 0, hasMe: false };
      byEmoji[e].count++;
      if (r.user && String(r.user._id || r.user) === String(user?.id)) byEmoji[e].hasMe = true;
    });
    return Object.values(byEmoji);
  };

  const startVoiceRecording = () => {
    if (!activeChat?.user?._id || sending) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      recordingStreamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      const chunks = [];
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mr.onstop = () => {
        recordingStreamRef.current?.getTracks().forEach((t) => t.stop());
        recordingStreamRef.current = null;
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "voice.webm", { type: "audio/webm" });
        handleSend(file);
      };
      mr.start();
      setIsRecording(true);
    }).catch((err) => console.error("Micro access:", err));
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVideoCall = () => {
    if (!activeChat?.user?._id || !user?.id || videoCall || voiceCall) return;
    const socket = getSocket();
    if (socket) {
      socket.emit("video-call-request", {
        from: user.id,
        to: activeChat.user._id,
        fromUser: user
      });
    }
    playOutgoingRingtone();
    setVideoCall({
      currentUserId: user.id,
      otherUserId: activeChat.user._id,
      isInitiator: true,
      otherUserName: activeChat.user.name || activeChat.user.email
    });
  };

  const handleVoiceCall = () => {
    if (!activeChat?.user?._id || !user?.id || videoCall || voiceCall) return;
    const socket = getSocket();
    if (socket) {
      socket.emit("voice-call-request", {
        from: user.id,
        to: activeChat.user._id,
        fromUser: user
      });
    }
    playOutgoingRingtone();
    setVoiceCall({
      currentUserId: user.id,
      otherUserId: activeChat.user._id,
      isInitiator: true,
      otherUserName: activeChat.user.name || activeChat.user.email
    });
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      stopIncomingRingtone();
      setVideoCall(incomingCall);
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    stopIncomingRingtone();
    const otherUserId = incomingCall?.otherUserId;
    if (otherUserId) getSocket()?.emit("video-call-ended", { to: otherUserId });
    if (otherUserId) appendCallMessage(otherUserId, { callKind: "video", callStatus: "missed", direction: "incoming" });
    setIncomingCall(null);
  };

  const handleAcceptVoiceCall = () => {
    if (incomingVoiceCall) {
      stopIncomingRingtone();
      setVoiceCall(incomingVoiceCall);
      setIncomingVoiceCall(null);
    }
  };

  const handleRejectVoiceCall = () => {
    stopIncomingRingtone();
    const otherUserId = incomingVoiceCall?.otherUserId;
    if (otherUserId) getSocket()?.emit("voice-call-ended", { to: otherUserId });
    if (otherUserId) appendCallMessage(otherUserId, { callKind: "voice", callStatus: "missed", direction: "incoming" });
    setIncomingVoiceCall(null);
  };

  const handleEndVideoCall = () => {
    stopOutgoingRingtone();
    const otherId = videoCall?.otherUserId;
    const wasConnected = !!callConnectedAtRef.current;
    const durationSec = callConnectedAtRef.current
      ? Math.round((Date.now() - callConnectedAtRef.current) / 1000)
      : undefined;
    callConnectedAtRef.current = null;
    const direction = videoCall?.isInitiator ? "outgoing" : "incoming";
    if (otherId) getSocket()?.emit("video-call-ended", { to: otherId });
    if (otherId) {
      appendCallMessage(otherId, {
        callKind: "video",
        callStatus: wasConnected ? "ended" : "missed",
        ...(wasConnected && durationSec != null && { durationSec }),
        direction,
      });
    }
    setVideoCall(null);
  };

  const handleEndVoiceCall = () => {
    stopOutgoingRingtone();
    const otherId = voiceCall?.otherUserId;
    const wasConnected = !!callConnectedAtRef.current;
    const durationSec = callConnectedAtRef.current
      ? Math.round((Date.now() - callConnectedAtRef.current) / 1000)
      : undefined;
    callConnectedAtRef.current = null;
    const direction = voiceCall?.isInitiator ? "outgoing" : "incoming";
    if (otherId) getSocket()?.emit("voice-call-ended", { to: otherId });
    if (otherId) {
      appendCallMessage(otherId, {
        callKind: "voice",
        callStatus: wasConnected ? "ended" : "missed",
        ...(wasConnected && durationSec != null && { durationSec }),
        direction,
      });
    }
    setVoiceCall(null);
  };

  const handleCallConnected = () => {
    stopOutgoingRingtone();
    callConnectedAtRef.current = Date.now();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString();
  };

  return (
    <div className="fixed bottom-0 right-8 flex items-end gap-4 z-[100] font-sans">
      {/* Incoming Video Call Notification */}
      {incomingCall && (
        <div className="fixed top-20 right-8 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 z-[102] w-80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FiVideo className="text-green-600" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Appel vidéo entrant</h4>
              <p className="text-xs text-slate-500">{incomingCall.otherUserName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptCall}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <FiPhone size={14} />
              Accepter
            </button>
            <button
              onClick={handleRejectCall}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <FiX size={14} />
              Refuser
            </button>
          </div>
        </div>
      )}
      {/* Incoming Voice Call Notification */}
      {incomingVoiceCall && (
        <div className="fixed top-20 right-8 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 z-[102] w-80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <FiPhone className="text-indigo-600" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Appel vocal entrant</h4>
              <p className="text-xs text-slate-500">{incomingVoiceCall.otherUserName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptVoiceCall}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <FiPhone size={14} />
              Accepter
            </button>
            <button
              onClick={handleRejectVoiceCall}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <FiX size={14} />
              Refuser
            </button>
          </div>
        </div>
      )}
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
                  const isOnline = !!convUser.online;
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
                const isOnline = !!f.online;
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
                    (activeChat.user.online ? "bg-emerald-500" : "bg-rose-500")
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
                    (activeChat.user.online ? "text-emerald-500" : "text-slate-400")
                  }
                >
                  {activeChat.user.online ? "En ligne" : "Hors ligne"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-indigo-600">
              <FiPhone
                size={14}
                className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6"
                onClick={handleVoiceCall}
                title="Appel vocal"
              />
              <FiVideo
                size={14}
                className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6"
                onClick={handleVideoCall}
                title="Appel vidéo"
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

          <div className="flex-grow p-4 bg-slate-50/50 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {messages.map((msg) => {
              const senderId = msg.sender?._id || msg.sender;
              const isMe = user?.id && String(senderId) === String(user.id);
              const att = msg.attachment;
              const attachmentUrl = att?.url ? (att.url.startsWith("http") ? att.url : `${API_BASE}${att.url}`) : null;
              if (att?.type === "audio" && attachmentUrl) {
                return (
                  <div key={msg._id} className={isMe ? "self-end" : ""}>
                    <VoiceMessageBubble
                      src={attachmentUrl}
                      isMe={isMe}
                      createdAt={formatTime(msg.createdAt)}
                      onDelete={() => handleDeleteMessage(msg)}
                    />
                  </div>
                );
              }
              const callPayload = msg.callPayload;
              if (callPayload) {
                const kindLabel = callPayload.callKind === "video" ? "Appel vidéo" : "Appel vocal";
                const statusLabel =
                  callPayload.callStatus === "missed"
                    ? "Sans réponse"
                    : callPayload.durationSec != null
                      ? `${callPayload.durationSec} s`
                      : "Terminé";
                const isOutgoingCall = callPayload.direction === "outgoing";
                return (
                  <div key={msg._id} className="flex justify-center my-1">
                    <div
                      className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-sm border ${
                        isOutgoingCall
                          ? "bg-indigo-100 border-indigo-200"
                          : "bg-emerald-100 border-emerald-200"
                      }`}
                    >
                      {callPayload.callKind === "video" ? (
                        <FiVideo
                          className={isOutgoingCall ? "text-indigo-700 shrink-0" : "text-emerald-700 shrink-0"}
                          size={20}
                        />
                      ) : (
                        <FiPhone
                          className={isOutgoingCall ? "text-indigo-700 shrink-0" : "text-emerald-700 shrink-0"}
                          size={20}
                        />
                      )}
                      <div className="flex flex-col">
                        <span className={`text-xs font-semibold ${isOutgoingCall ? "text-indigo-900" : "text-emerald-900"}`}>
                          {kindLabel}
                        </span>
                        <span className="text-[11px] text-slate-600">{statusLabel}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 ml-1">{formatTime(msg.createdAt)}</p>
                      {isMe && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg)}
                          className="ml-2 p-1 rounded-full hover:bg-black/5 text-slate-500"
                          title="Supprimer cet appel"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
              const reactionsGrouped = getReactionsGrouped(msg.reactions);
              return (
                <div
                  key={msg._id}
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
                      {att.type === "file" && (
                        <a href={attachmentUrl} download={att.originalName} className={`text-xs underline ${isMe ? "text-indigo-200" : "text-indigo-600"}`}>
                          📎 {att.originalName || "Fichier"}
                        </a>
                      )}
                    </div>
                  )}
                  {msg.content ? <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p> : null}
                  {reactionsGrouped.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {reactionsGrouped.map((r) => (
                        <button
                          key={r.emoji}
                          type="button"
                          onClick={() => handleToggleReaction(msg._id, r.emoji)}
                          className={`text-xs px-1.5 py-0.5 rounded ${r.hasMe ? "bg-white/30" : "bg-black/10 hover:bg-black/20"} ${isMe ? "" : "bg-slate-100 hover:bg-slate-200"}`}
                          title={r.hasMe ? "Retirer la réaction" : "Réagir"}
                        >
                          {r.emoji} {r.count > 1 ? r.count : ""}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => setReactionPickerMsgId(reactionPickerMsgId === msg._id ? null : msg._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/20 transition-opacity text-sm"
                      title="Réagir"
                    >
                      😊
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg)}
                      className="p-1 rounded hover:bg-white/20 opacity-90"
                      title="Supprimer"
                    >
                      <FiTrash2 size={12} />
                    </button>
                    {reactionPickerMsgId === msg._id && (
                      <div className="absolute bottom-full left-0 mb-1 flex gap-0.5 p-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10">
                        {QUICK_REACTIONS.map((emoji) => (
                          <button key={emoji} type="button" onClick={() => handleToggleReaction(msg._id, emoji)} className="p-1 text-lg hover:bg-slate-100 rounded">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
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
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,audio/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-2">
              <input
                type="text"
                placeholder="Message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && !isRecording && handleSend()}
                className="flex-grow bg-transparent border-none focus:ring-0 text-xs py-1"
              />
              {isRecording ? (
                <button type="button" onClick={stopVoiceRecording} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600" title="Arrêter l’enregistrement">
                  <FiMic size={18} />
                </button>
              ) : (
                <button type="button" onClick={startVoiceRecording} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg" title="Message vocal">
                  <FiMic size={18} />
                </button>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg" title="Fichier, image ou vidéo">
                <FiPaperclip size={18} />
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

      {/* Video Call Modal */}
      {videoCall && (
        <VideoCall
          callData={videoCall}
          onEnd={handleEndVideoCall}
          onConnected={handleCallConnected}
        />
      )}
      {/* Voice Call Modal */}
      {voiceCall && (
        <VoiceCall
          callData={voiceCall}
          onEnd={handleEndVoiceCall}
          onConnected={handleCallConnected}
        />
      )}
    </div>
  );
};

export default Messaging;
