import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp, FiEdit, FiMinus, FiMoreHorizontal, FiPaperclip, FiSearch, FiSend, FiSliders, FiSmile, FiTrash2, FiX } from "react-icons/fi";
import { API_BASE, friendsApi, messagesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

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

const POLL_INTERVAL_MS = 10000;

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

  const EMOJI_LIST = "😀 😃 😄 😁 🥹 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 😎 🤓 😏 😒 🙄 😬 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😶 😐 😑 😯 😦 😧 😮 😲 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤠 🥳 🥸 😈 👿 👹 👺 💀 ☠️ 💩 🤡 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾 👍 👎 👊 ✊ 🤛 🤜 🤞 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 💪 🦾 🙏 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝".split(/\s+/).filter(Boolean);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

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
    scrollToBottom();
  }, [messages]);

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

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString();
  };

  const isUserOnline = (u) => u?.status === "online" || u?.online === true;

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
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              className="hidden"
              onChange={handleFileSelect}
            />
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

    </div>
  );
};

export default Messaging;
