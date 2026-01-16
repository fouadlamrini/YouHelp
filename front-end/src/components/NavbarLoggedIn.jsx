import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiUser, FiSettings, FiBell, FiMail, FiUserPlus,  FiBookOpen, FiLogOut,
  FiEdit ,FiCalendar
} from "react-icons/fi";

function NavbarLoggedIn() {
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  const dropdownStyles = "absolute top-14 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-[200] animate-in fade-in slide-in-from-top-2 duration-200";

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
          {/* Knowledge - Icon: FiBookOpen */}
          <Link to="/Shedule" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            <FiCalendar size={18} /> Workchop Shedule
          </Link>

          {/* Vertical Divider */}
          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

          
        </div>
      </div>

      {/* 2. Action Icons (Invitations, Messages, Notifications, Profile) */}
      <div className="flex items-center gap-4">
        
        <div className="flex items-center gap-1 mr-2 relative nav-dropdown-container">
          {/* INVITATIONS */}
          <div className="relative">
            <button onClick={() => toggleDropdown('invitations')} className={`p-2.5 rounded-xl transition-all relative ${activeDropdown === 'invitations' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
              <FiUserPlus size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
            </button>
            {activeDropdown === 'invitations' && (
              <div className={dropdownStyles}>
                <p className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">Invitations</p>
                <div className="max-h-64 overflow-y-auto italic text-center py-6 text-[10px] text-slate-400">Aucune demande</div>
              </div>
            )}
          </div>

          {/* MESSAGES */}
          <div className="relative">
            <button onClick={() => toggleDropdown('messages')} className={`p-2.5 rounded-xl transition-all ${activeDropdown === 'messages' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
              <FiMail size={20} />
            </button>
            {activeDropdown === 'messages' && (
              <div className={dropdownStyles}>
                <p className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">Messages</p>
                <div className="max-h-64 overflow-y-auto italic text-center py-6 text-[10px] text-slate-400">Boîte vide</div>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button onClick={() => toggleDropdown('notifications')} className={`p-2.5 rounded-xl transition-all ${activeDropdown === 'notifications' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
              <FiBell size={20} />
            </button>
            {activeDropdown === 'notifications' && (
              <div className={dropdownStyles}>
                <p className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">Notifications</p>
                <div className="max-h-64 overflow-y-auto italic text-center py-6 text-[10px] text-slate-400">Pas de notifications</div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>

        {/* PROFILE DROPDOWN */}
        <div className="relative nav-dropdown-container">
          <button onClick={() => toggleDropdown('settings')} className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-white hover:bg-slate-50 rounded-full border border-slate-200 transition-all group shadow-sm">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 flex-shrink-0">
              <img src="https://i.pravatar.cc/150?u=youcoder" alt="profile" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block text-left mr-1">
              <p className="text-[12px] font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">Fouad Lamrini</p>
            </div>
          </button>

          {activeDropdown === 'settings' && (
            <div className={`${dropdownStyles} w-56`}>
              <div className="px-2 space-y-1">
                <Link to="/my-posts" className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                  <FiUser size={16} /> Mon Profil
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                  <FiSettings size={16} /> Paramètres
                </Link>
                <div className="h-[1px] bg-slate-50 my-1 mx-2"></div>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <FiLogOut size={16} /> Déconnexion
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