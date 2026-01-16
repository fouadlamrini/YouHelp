import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiCamera, FiEdit2, FiPlus, FiEdit3, 
  FiHeart, FiBookOpen, FiInfo, FiUsers 
} from "react-icons/fi";

const HeaderProfile = () => {
  const location = useLocation();

  const tabs = [
    { label: "Mes Posts", to: "/my-posts", icon: <FiEdit3 size={18} /> },
    { label: "Mes Knowledge", to: "/my-knowledge", icon: <FiBookOpen size={18} /> },
    { label: "Mes Favourites", to: "/my-favourites", icon: <FiHeart size={18} /> },
    { label: "Mes Amis", to: "/profile/friends", icon: <FiUsers size={18} /> },
    { label: "Infos", to: "/profile/info", icon: <FiInfo size={18} /> },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-slate-100">
      {/* 1. Cover Image */}
      <div className="relative h-48 md:h-80 bg-slate-200 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200" 
          className="w-full h-full object-cover" 
          alt="cover" 
        />
        <button className="absolute bottom-4 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-white transition-all shadow-md">
          <FiCamera size={16} /> Modifier la photo de couverture
        </button>
      </div>

      {/* 2. Profile Info Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-5 -mt-12 md:-mt-16 mb-6">
          {/* Profile Picture */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white overflow-hidden shadow-xl bg-white">
              <img src="https://i.pravatar.cc/150?u=youcoder" className="w-full h-full object-cover" alt="profile" />
            </div>
            <button className="absolute bottom-2 right-2 p-2.5 bg-slate-100 rounded-full border-2 border-white hover:bg-white transition-all shadow-md">
              <FiCamera size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Name & Actions */}
          <div className="flex-grow flex flex-col md:flex-row justify-between items-center md:items-end pb-2 w-full gap-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Fouad Lamrini</h1>
              <p className="text-slate-500 font-bold text-sm">311 amis</p>
            </div>

            <div className="flex gap-2">
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                <FiPlus size={16} /> Ajouter à la story
              </button>
              <button className="bg-slate-100 text-slate-800 px-5 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-slate-200 transition-all">
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