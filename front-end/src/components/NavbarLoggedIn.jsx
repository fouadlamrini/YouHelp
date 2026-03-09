import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiUser, FiSettings, FiBell, FiMail, FiUserPlus, FiBookOpen, FiLogOut,
  FiEdit, FiCalendar, FiCheck, FiX
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api, { friendRequestsApi, messagesApi, notificationsApi } from "../services/api";
import { getSocket } from "../services/socket";

const API_BASE = (api.defaults.baseURL || "").replace(/\/api$/, "") || "http://localhost:3000";

function resolveAvatarUrl(src) {
  if (!src) return `${API_BASE}/avatars/default-avatar.jpg`;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_BASE}${src}`;
  if (src === "default-avatar.png" || src === "default-avatar.jpg") return `${API_BASE}/avatars/default-avatar.jpg`;
  return `${API_BASE}/avatars/${src}`;
}

function NavbarLoggedIn() {
  const { user, logout } = useAuth();
  const roleName = user?.role?.name ?? user?.role;
  const isFormateur = roleName === "formateur";
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const isActive = user?.status === "active";

  const loadInvitations = () => {
    if (!isActive) return;
    setInvitationsLoading(true);
    friendRequestsApi.getReceived()
      .then((res) => setInvitations(res.data?.data ?? []))
      .catch(() => setInvitations([]))
      .finally(() => setInvitationsLoading(false));
  };

  useEffect(() => {
    if (isActive) loadInvitations();
  }, [isActive]);

  useEffect(() => {
    if (isActive && activeDropdown === "invitations") loadInvitations();
  }, [isActive, activeDropdown]);

  const loadConversations = () => {
    setConversationsLoading(true);
    messagesApi
      .getConversations()
      .then((res) => setConversations(res.data?.data ?? []))
      .catch(() => setConversations([]))
      .finally(() => setConversationsLoading(false));
  };

  useEffect(() => {
    if (activeDropdown === "messages") loadConversations();
  }, [activeDropdown]);

  const loadNotifications = () => {
    setNotificationsLoading(true);
    notificationsApi
      .getMine()
      .then((res) => setNotifications(res.data?.data ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  useEffect(() => {
    if (activeDropdown === "notifications") loadNotifications();
  }, [activeDropdown]);

  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onMessage = () => loadConversations();
    socket.on("message", onMessage);
    return () => socket.off("message", onMessage);
  }, [user?.id]);

  useEffect(() => {
    const onMessagesRead = () => loadConversations();
    window.addEventListener("messages-read", onMessagesRead);
    return () => window.removeEventListener("messages-read", onMessagesRead);
  }, []);

  const handleAcceptInvitation = (id) => {
    friendRequestsApi.accept(id).then(() => loadInvitations()).catch(() => {});
  };

  const handleRejectInvitation = (id) => {
    friendRequestsApi.reject(id).then(() => loadInvitations()).catch(() => {});
  };

  const handleLogout = async () => {
    setActiveDropdown(null);
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      navigate("/login");
    }
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  useEffect(() => {
    const closeAll = (e) => {
      if (!e.target.closest(".nav-dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, []);

  const dropdownStyles = "absolute top-14 right-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 px-3 z-[200] animate-in fade-in slide-in-from-top-2 duration-200";

  return (
    <nav className="w-full bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-[100]">
      
      {/* 1. Logo & Navigation Links */}
      <div className="flex items-center gap-10">
        <div className="hidden lg:flex items-center gap-6">
          
          {/* All Posts - Icon: FiEdit (Notebook with Pen) */}
          <Link to="/posts" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            <FiEdit size={18} /> All Posts
          </Link>

          {/* Knowledge - Icon: FiBookOpen */}
          <Link to="/knowledge" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            <FiBookOpen size={18} /> Knowledge
          </Link>
          {/* Workchop: Schedule (formateur) / Mes workchops (etudiant) */}
          {isFormateur && (
            <Link to="/Shedule" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
              <FiCalendar size={18} /> Workchop Schedule
            </Link>
          )}
          {/* Vertical Divider */}
          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

          
        </div>
      </div>

      {/* 2. Action Icons (Invitations, Messages, Notifications, Profile) */}
      <div className="flex items-center gap-4">
        
        <div className="flex items-center gap-1 mr-2 relative nav-dropdown-container">
          {/* INVITATIONS — réservé aux comptes activés */}
          {isActive && (
            <div className="relative">
              <button onClick={() => toggleDropdown('invitations')} className={`p-2.5 rounded-xl transition-all relative ${activeDropdown === 'invitations' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <FiUserPlus size={20} />
                {invitations.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-md border-2 border-white">
                    {invitations.length > 99 ? "99+" : invitations.length}
                  </span>
                )}
              </button>
              {activeDropdown === 'invitations' && (
                <div className={dropdownStyles}>
                  <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 mb-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Invitations</p>
                    <Link to="/profile/friends" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 rounded-2xl px-3 py-1.5 hover:bg-indigo-50 transition-all" onClick={() => setActiveDropdown(null)}>
                      Inviter
                    </Link>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {invitationsLoading ? (
                      <div className="py-6 text-center text-sm font-bold text-slate-400">Chargement...</div>
                    ) : invitations.length === 0 ? (
                      <div className="italic text-center py-6 text-sm font-bold text-slate-400">Aucune demande</div>
                    ) : (
                      <div className="space-y-1">
                        {invitations.map((req) => (
                          <div key={req._id} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                              <img
                                src={req.fromUser?.profilePicture ? resolveAvatarUrl(req.fromUser.profilePicture) : resolveAvatarUrl("default-avatar.jpg")}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="flex-1 text-sm font-bold tracking-tight truncate">{req.fromUser?.name || "?"}</span>
                            <button type="button" onClick={() => handleAcceptInvitation(req._id)} className="p-2 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-all" title="Accepter"><FiCheck size={16} /></button>
                            <button type="button" onClick={() => handleRejectInvitation(req._id)} className="p-2 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all" title="Refuser"><FiX size={16} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MESSAGES */}
          <div className="relative">
            <button onClick={() => toggleDropdown("messages")} className={`p-2.5 rounded-xl transition-all relative ${activeDropdown === "messages" ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}>
              <FiMail size={20} />
              {(conversations.filter((c) => c.unread).length > 0) && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-md border-2 border-white">
                  {conversations.filter((c) => c.unread).length > 99 ? "99+" : conversations.filter((c) => c.unread).length}
                </span>
              )}
            </button>
            {activeDropdown === "messages" && (
              <div className={dropdownStyles}>
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 mb-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Messages</p>
                  <Link to="/posts" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 rounded-2xl px-3 py-1.5 hover:bg-indigo-50 transition-all" onClick={() => setActiveDropdown(null)}>
                    Voir tout
                  </Link>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {conversationsLoading ? (
                    <div className="py-6 text-center text-sm font-bold text-slate-400">Chargement...</div>
                  ) : conversations.length === 0 ? (
                    <div className="italic text-center py-6 text-sm font-bold text-slate-400">Boîte vide</div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map((conv) => (
                        <button
                          key={conv.user._id}
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("open-chat", { detail: { userId: conv.user._id } })
                            );
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0 overflow-hidden">
                            {conv.user.profilePicture ? (
                              <img src={resolveAvatarUrl(conv.user.profilePicture)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (conv.user.name || "?")[0]
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-baseline gap-2">
                              <span className="text-sm font-bold tracking-tight text-slate-800 truncate">{conv.user.name || conv.user.email}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">{formatMessageTime(conv.lastMessage?.createdAt)}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{conv.lastMessage?.content || "Aucun message"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative nav-dropdown-container">
            <button onClick={() => toggleDropdown('notifications')} className={`p-2.5 rounded-xl transition-all relative ${activeDropdown === 'notifications' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
              <FiBell size={20} />
              {notifications.some((n) => !n.read) && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-md border-2 border-white">
                  {notifications.filter((n) => !n.read).length > 99 ? "99+" : notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
            {activeDropdown === 'notifications' && (
              <div className={dropdownStyles}>
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 mb-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Notifications</p>
                  {(user?.role === "super_admin" || user?.role === "admin" || user?.role === "formateur") && (
                    <Link to="/users" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 rounded-2xl px-3 py-1.5 hover:bg-indigo-50 transition-all" onClick={() => setActiveDropdown(null)}>
                      Liste des utilisateurs
                    </Link>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="py-6 text-center text-sm font-bold text-slate-400">Chargement...</div>
                  ) : notifications.length === 0 ? (
                    <div className="italic text-center py-6 text-sm font-bold text-slate-400">Pas de notifications</div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((n) => (
                        <Link
                          key={n._id}
                          to={n.link || "/users"}
                          onClick={() => {
                            setActiveDropdown(null);
                            if (!n.read) notificationsApi.markAsRead(n._id).then(() => loadNotifications()).catch(() => {});
                          }}
                          className={`block px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 ${!n.read ? "bg-indigo-50/50" : ""}`}
                        >
                          <p className="text-sm font-bold tracking-tight text-slate-800 leading-snug">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>

        {/* PROFILE DROPDOWN - name and image from database (user context) */}
        <div className="relative nav-dropdown-container">
          <button onClick={() => toggleDropdown('settings')} className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-white hover:bg-slate-50 rounded-full border border-slate-200 transition-all group shadow-sm">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 flex-shrink-0">
              <img
                src={user?.profilePicture ? resolveAvatarUrl(user.profilePicture) : resolveAvatarUrl("default-avatar.jpg")}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block text-left mr-1">
              <p className="text-[12px] font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">
                {user?.name || "Utilisateur"}
              </p>
            </div>
          </button>

          {activeDropdown === 'settings' && (
            <div className={`${dropdownStyles} w-56`}>
              <div className="space-y-1">
                <Link to="/my-posts" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 font-bold text-sm tracking-tight">
                  <FiUser size={20} /> Mon Profil
                </Link>
                <Link to="/settings" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 font-bold text-sm tracking-tight">
                  <FiSettings size={20} /> Paramètres
                </Link>
                <div className="my-2 border-t border-slate-100"></div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-sm tracking-tight transition-all duration-300"
                >
                  <FiLogOut size={20} /> Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default NavbarLoggedIn;