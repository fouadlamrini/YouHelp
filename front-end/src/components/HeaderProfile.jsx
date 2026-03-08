import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiCamera,
  FiEdit2,
  FiEdit3,
  FiHeart,
  FiBookOpen,
  FiUsers,
  FiShare2,
  FiTool,
  FiMaximize2,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { usersApi, friendsApi, API_BASE } from "../services/api";

function resolveAvatarUrl(src, defaultPath = "default-avatar.jpg") {
  if (!src) return `${API_BASE}/avatars/${defaultPath}`;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_BASE}${src}`;
  return `${API_BASE}/avatars/${src}`;
}

const HeaderProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [coverFullscreen, setCoverFullscreen] = useState(false);

  useEffect(() => {
    usersApi
      .getMe()
      .then((res) => {
        const data = res.data?.data;
        if (data) setProfile(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isActive) {
      setFriendsCount(0);
      return;
    }
    friendsApi
      .list()
      .then((res) => {
        const list = res.data?.data ?? [];
        setFriendsCount(list.length);
      })
      .catch(() => setFriendsCount(0));
  }, [isActive]);

  const displayName = profile?.name ?? authUser?.name ?? "";
  const profilePicture = profile?.profilePicture ?? authUser?.profilePicture;
  const coverPicture = profile?.coverPicture;
  const isActive = (profile?.status ?? authUser?.status) === "active";

  const tabs = [
    { label: "Mes Posts", to: "/my-posts", icon: <FiEdit3 size={18} /> },
    { label: "Mes Knowledge", to: "/my-knowledge", icon: <FiBookOpen size={18} /> },
    { label: "Mes Shares", to: "/my-shares", icon: <FiShare2 size={18} /> },
    { label: "Mes Favourites", to: "/my-favourites", icon: <FiHeart size={18} /> },
    { label: "Mes Workchop", to: "/my-workshops", icon: <FiTool size={18} /> },
    ...(isActive ? [{ label: "Mes Amis", to: "/profile/friends", icon: <FiUsers size={18} /> }] : []),
  ];

  return (
    <div className="bg-white shadow-sm border-b border-slate-100">
      {/* 1. Cover Image — clic pour afficher l'image en entier */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setCoverFullscreen(true)}
        onKeyDown={(e) => e.key === "Enter" && setCoverFullscreen(true)}
        className="relative h-48 md:h-80 bg-slate-200 overflow-hidden cursor-pointer group"
      >
        <img
          src={resolveAvatarUrl(coverPicture, "couverture-default.jpg")}
          className="w-full h-full object-cover"
          alt="couverture"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2">
            <FiMaximize2 size={16} /> Voir l'image en entier
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            navigate("/settings");
          }}
          className="absolute bottom-4 right-6 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-white transition-all shadow-md cursor-pointer"
        >
          <FiCamera size={16} /> Modifier la photo de couverture
        </button>
      </div>

      {/* Lightbox : image de couverture en entier */}
      {coverFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setCoverFullscreen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setCoverFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setCoverFullscreen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Fermer"
          >
            <FiX size={24} />
          </button>
          <img
            src={resolveAvatarUrl(coverPicture, "couverture-default.jpg")}
            alt="Couverture en entier"
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 2. Profile Info Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-5 -mt-12 md:-mt-16 mb-6">
          {/* Profile Picture */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white overflow-hidden shadow-xl bg-white">
              <img
                src={resolveAvatarUrl(profilePicture)}
                className="w-full h-full object-cover"
                alt="profile"
              />
            </div>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="absolute bottom-2 right-2 p-2.5 bg-slate-100 rounded-full border-2 border-white hover:bg-white transition-all shadow-md"
            >
              <FiCamera size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Name & Actions */}
          <div className="grow flex flex-col md:flex-row justify-between items-center md:items-end pb-2 w-full gap-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{displayName || "Profil"}</h1>
              <p className="text-slate-500 font-bold text-sm">
                {friendsCount} {friendsCount === 1 ? "ami" : "amis"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="bg-slate-100 text-slate-800 px-5 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-slate-200 transition-all"
              >
                <FiEdit2 size={16} /> Modifier le profil
              </button>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs (Facebook Style) */}
        <div className="flex items-center gap-1 border-t border-slate-50 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.to;
            return (
              <Link 
                key={tab.to} 
                to={tab.to}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-black transition-all border-b-4 whitespace-nowrap
                  ${isActive 
                    ? "text-indigo-600 border-indigo-600" 
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeaderProfile;