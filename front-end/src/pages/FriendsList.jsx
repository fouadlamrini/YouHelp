import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import HeaderProfile from "../components/HeaderProfile";
import { FiUserX, FiSearch, FiMessageCircle, FiUserCheck, FiUserPlus, FiX } from "react-icons/fi";
import api, { friendsApi, friendRequestsApi } from "../services/api";

const API_ORIGIN = (api.defaults.baseURL || "").replace(/\/api$/, "") || "http://localhost:3000";

function resolveAvatarUrl(src) {
  if (!src) return `${API_ORIGIN}/avatars/default-avatar.jpg`;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_ORIGIN}${src}`;
  return `${API_ORIGIN}/avatars/${src}`;
}

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const fetchFriends = () => {
    setLoading(true);
    friendsApi
      .list()
      .then((res) => setFriends(res.data?.data ?? []))
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleUnfriend = (userId, name) => {
    if (!window.confirm(`Bghiti t-annuler l'amitié m3a ${name}?`)) return;
    friendsApi
      .remove(userId)
      .then(() => fetchFriends())
      .catch((err) => alert(err.response?.data?.message || "Erreur"));
  };

  const openInviteModal = () => {
    setShowInviteModal(true);
    setAvailableLoading(true);
    friendRequestsApi
      .getAvailableUsers()
      .then((res) => setAvailableUsers(res.data?.data ?? []))
      .catch(() => setAvailableUsers([]))
      .finally(() => setAvailableLoading(false));
  };

  const handleSendInvitation = (userId) => {
    setSendingId(userId);
    friendRequestsApi
      .send(userId)
      .then(() => {
        setAvailableUsers((prev) => prev.filter((u) => u._id !== userId));
      })
      .catch((err) => alert(err.response?.data?.message || "Erreur"))
      .finally(() => setSendingId(null));
  };

  const filteredFriends = friends.filter((f) =>
    (f.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden text-left">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <HeaderProfile />

          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <FiUserCheck className="text-indigo-600" />
                  </div>
                  Mes Amis
                </h1>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 ml-12">
                  Réseau YouCode • {friends.length} Personnes
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openInviteModal}
                  className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-[11px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  <FiUserPlus size={18} /> Inviter
                </button>
                <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-transparent focus-within:border-indigo-200 focus-within:bg-white transition-all flex items-center gap-3 w-full md:w-80">
                  <FiSearch className="text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    className="bg-transparent border-none outline-none text-[11px] font-bold w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm font-bold">Chargement...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend._id}
                    className="bg-white p-6 rounded-[2.8rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={resolveAvatarUrl(friend.profilePicture)}
                          alt={friend.name}
                          className="w-24 h-24 rounded-[2.2rem] object-cover border-4 border-slate-50 shadow-inner"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
                      </div>
                      <div className="mb-6 min-h-[4rem]">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">
                          {friend.name || friend.email}
                        </h3>
                        <div className="flex flex-col gap-0.5 mt-2">
                          {friend.campus?.name && (
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full inline-block mx-auto">
                              {friend.campus.name}
                            </span>
                          )}
                          {friend.class?.name && (
                            <span className="text-[10px] text-slate-400 font-bold mt-1 italic">
                              {friend.class.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <button
                          type="button"
                          className="bg-slate-900 text-white py-3.5 rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-slate-200"
                        >
                          <FiMessageCircle size={14} className="group-hover/btn:animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-tighter text-white">
                            Chat
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnfriend(friend._id, friend.name || friend.email)}
                          className="bg-rose-50 text-rose-500 py-3.5 rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <FiUserX size={14} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">
                            Annuler
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredFriends.length === 0 && (
              <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">
                  {friends.length === 0
                    ? "Aucun ami pour le moment. Cliquez sur Inviter pour envoyer des demandes."
                    : "Aucun ami ne correspond à ce nom."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Inviter */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 uppercase">Inviter un utilisateur</h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              {availableLoading ? (
                <p className="text-center text-slate-400 py-8">Chargement...</p>
              ) : availableUsers.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">
                  Aucun utilisateur actif à inviter pour le moment.
                </p>
              ) : (
                <ul className="space-y-2">
                  {availableUsers.map((u) => (
                    <li
                      key={u._id}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50"
                    >
                      <img
                        src={resolveAvatarUrl(u.profilePicture)}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{u.name || u.email}</p>
                        {u.campus?.name && (
                          <p className="text-[10px] text-slate-400">{u.campus.name}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={sendingId === u._id}
                        onClick={() => handleSendInvitation(u._id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {sendingId === u._id ? "..." : "Inviter"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
