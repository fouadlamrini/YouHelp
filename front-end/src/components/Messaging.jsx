import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit, FiMoreHorizontal, FiChevronUp, FiChevronDown, FiSearch, FiSliders, FiX, FiVideo, FiPhone, FiMinus, FiSmile, FiImage, FiPaperclip, FiSend,
} from "react-icons/fi";
import { messagesApi, friendsApi } from "../services/api";
import { getSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import VideoCall from "./VideoCall.jsx";

const Messaging = ({ openChatUserId = null }) => {
  const navigate = useNavigate();
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
    const conv = conversations.find((c) => (c.user._id || c.user).toString() === openChatUserId.toString());
    if (conv) {
      setActiveChat(conv);
      setIsMinimized(false);
      navigate("/posts", { replace: true });
    }
  }, [openChatUserId, conversations, navigate]);

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
      if (activeChat?.user?._id === msg.sender?._id) {
        setMessages((prev) => [...prev, msg]);
      }
      setConversations((prev) => {
        const list = prev.map((c) => {
          if (c.user._id === msg.sender?._id || c.user._id === msg.receiver?._id) {
            return { ...c, lastMessage: { content: msg.content, createdAt: msg.createdAt } };
          }
          return c;
        });
        return list;
      });
    };

    const onVideoCallRequest = (data) => {
      console.log('📹 Video call request received:', data);
      
      if (data.to === user?.id && !videoCall && !incomingCall) {
        setIncomingCall({
          currentUserId: user.id,
          otherUserId: data.from,
          isInitiator: false,
          otherUserName: data.fromUser?.name || data.fromUser?.email
        });
      }
    };

    socket.on("message", onMessage);
    socket.on("video-call-request", onVideoCallRequest);
    
    return () => {
      socket.off("message", onMessage);
      socket.off("video-call-request", onVideoCallRequest);
    };
  }, [activeChat?.user?._id, user?.id, videoCall, incomingCall]);

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

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !activeChat?.user?._id || sending) return;
    setSending(true);
    try {
      const res = await messagesApi.send({ receiverId: activeChat.user._id, content: text });
      setMessages((prev) => [...prev, res.data.data]);
      setInputText("");
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleVideoCall = () => {
    if (!activeChat?.user?._id || !user?.id || videoCall) return;
    
    // Send notification to other user
    const socket = getSocket();
    if (socket) {
      socket.emit("video-call-request", {
        from: user.id,
        to: activeChat.user._id,
        fromUser: user
      });
    }
    
    // Start call as initiator
    setVideoCall({
      currentUserId: user.id,
      otherUserId: activeChat.user._id,
      isInitiator: true,
      otherUserName: activeChat.user.name || activeChat.user.email
    });
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      setVideoCall(incomingCall);
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
  };

  const handleEndVideoCall = () => {
    setVideoCall(null);
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
      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="fixed top-20 right-8 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 z-[102] w-80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FiVideo className="text-green-600" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Incoming Video Call</h4>
              <p className="text-xs text-slate-500">{incomingCall.otherUserName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptCall}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <FiPhone size={14} />
              Accept
            </button>
            <button
              onClick={handleRejectCall}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <FiX size={14} />
              Reject
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
              {user?.name?.[0] && <span className="flex items-center justify-center h-full text-sm font-bold text-indigo-600">{user.name[0]}</span>}
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
                conversations.map((conv) => (
                  <div
                    key={conv.user._id}
                    onClick={() => handleSelectChat(conv)}
                    className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 ${activeChat?.user?._id === conv.user._id ? "bg-indigo-50" : ""}`}
                  >
                    <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                      {conv.user.name?.[0] || "?"}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-[13px] font-black text-slate-800 truncate">{conv.user.name || conv.user.email}</h4>
                        <span className="text-[10px] text-slate-400 font-bold">{formatTime(conv.lastMessage?.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">{conv.lastMessage?.content || "No messages"}</p>
                    </div>
                  </div>
                ))
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
              {friends.map((f) => (
                <button
                  key={f._id}
                  type="button"
                  onClick={() => handleStartChatWithFriend(f)}
                  className="w-full flex items-center gap-3 py-2 text-left hover:bg-slate-50 px-1"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                    {f.name?.[0] || "?"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-slate-800">
                      {f.name || f.email}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Friend
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeChat && (
        <div className="w-80 h-[450px] bg-white shadow-2xl rounded-t-xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-2.5 flex items-center justify-between border-b border-slate-100 bg-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                {activeChat.user.name?.[0] || "?"}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 leading-none">{activeChat.user.name || activeChat.user.email}</h4>
                <p className="text-[9px] text-emerald-500 font-bold mt-1">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-indigo-600">
              <FiPhone size={14} className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6" />
              <FiVideo
                size={14}
                className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6"
                onClick={handleVideoCall}
              />
              <FiMinus onClick={() => setActiveChat(null)} size={14} className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6" />
              <FiX onClick={() => setActiveChat(null)} size={14} className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6" />
            </div>
          </div>

          <div className="flex-grow p-4 bg-slate-50/50 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {messages.map((msg) => {
              const senderId = msg.sender?._id || msg.sender;
              const isMe = user?.id && String(senderId) === String(user.id);
              return (
                <div
                  key={msg._id}
                  className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-none self-end" : "bg-white border border-slate-100 rounded-tl-none"}`}
                >
                  <p className="text-xs font-medium leading-relaxed">{msg.content}</p>
                  <p className={`text-[9px] mt-1 ${isMe ? "text-indigo-200" : "text-slate-400"}`}>{formatTime(msg.createdAt)}</p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-2">
              <input
                type="text"
                placeholder="Message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-grow bg-transparent border-none focus:ring-0 text-xs py-1"
              />
              <button onClick={handleSend} disabled={sending || !inputText.trim()} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg disabled:opacity-50">
                <FiSend size={18} />
              </button>
              <FiSmile size={18} className="cursor-pointer text-slate-400" />
              <FiImage size={18} className="cursor-pointer text-slate-400" />
              <FiPaperclip size={18} className="cursor-pointer text-slate-400" />
            </div>
          </div>
        </div>
      )}
      
      {/* Video Call Modal */}
      {videoCall && (
        <VideoCall 
          callData={videoCall} 
          onEnd={handleEndVideoCall}
        />
      )}
    </div>
  );
};

export default Messaging;
