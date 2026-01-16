import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiEdit3, FiHeart, FiBookOpen, FiUser, FiUsers, FiInfo 
} from "react-icons/fi";

const ProfileNavItem = ({ icon: Icon, label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-1
        ${isActive 
          ? "bg-indigo-50 text-indigo-600 font-black shadow-sm" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
    >
      <Icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400"} />
      <span className="text-sm tracking-tight">{label}</span>
    </Link>
  );
};

const SidebarProfile = () => {
  return (
    <div className="w-full bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm sticky top-24">
      {/* User Header Mini */}
      <div className="px-4 py-6 text-center border-b border-slate-50 mb-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-3 flex items-center justify-center text-indigo-600 font-black text-xl border-4 border-white shadow-sm">
          FL
        </div>
        <h3 className="font-black text-slate-800 text-sm tracking-tight uppercase">Fouad Lamrini</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fullstack Developer</p>
      </div>

      {/* Profile Navigation Links */}
      <nav className="space-y-1">
        <ProfileNavItem icon={FiEdit3} label="My Posts" to="/my-posts" />
        <ProfileNavItem icon={FiHeart} label="My Favourites" to="/my-favourites" />
        <ProfileNavItem icon={FiBookOpen} label="My Knowledge" to="/my-knowledge" />
        <ProfileNavItem icon={FiInfo} label="Mes Informations" to="/profile/info" />
        <ProfileNavItem icon={FiUsers} label="Mes Amis" to="/profile/friends" />
      </nav>
    </div>
  );
};

export default SidebarProfile;