import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import NavbarLoggedIn from '../components/NavbarLoggedIn';
import HeaderProfile from '../components/HeaderProfile'; // <--- Zdna l-import hna
import { FiUserX, FiSearch, FiMessageCircle, FiUserCheck } from 'react-icons/fi';

const FriendsList = () => {
  // Liste dyal s7ab fictive
  const [friends, setFriends] = useState([
    { id: 1, name: "Yassine Mansouri", campus: "Safi", class: "Ada Lovelace", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "Sofia Bennani", campus: "Youssoufia", class: "Javascript", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: 3, name: "Mehdi Alami", campus: "Safi", class: "Alan Turing", avatar: "https://i.pravatar.cc/150?u=3" },
    { id: 4, name: "Laila Rouani", campus: "Agadir", class: "Python", avatar: "https://i.pravatar.cc/150?u=4" },
    { id: 5, name: "Anas Jabri", campus: "Safi", class: "Ada Lovelace", avatar: "https://i.pravatar.cc/150?u=5" },
    { id: 6, name: "Meryem Toumi", campus: "Casablanca", class: "Java", avatar: "https://i.pravatar.cc/150?u=12" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleUnfriend = (id, name) => {
    if (window.confirm(`Bghiti t-annuler l'amitié m3a ${name}?`)) {
      setFriends(friends.filter(f => f.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden text-left">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {/* --- HEADER PROFILE --- */}
          <HeaderProfile />

          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-10">
            
            {/* --- SEARCH & TITLE --- */}
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

              {/* Barre de recherche */}
              <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-transparent focus-within:border-indigo-200 focus-within:bg-white transition-all flex items-center gap-3 w-full md:w-80">
                <FiSearch className="text-slate-400" size={18}/>
                <input 
                  type="text" 
                  placeholder="Rechercher par nom..." 
                  className="bg-transparent border-none outline-none text-[11px] font-bold w-full"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* --- GRID DES AMIS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friends.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((friend) => (
                <div 
                  key={friend.id} 
                  className="bg-white p-6 rounded-[2.8rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Image Profil */}
                    <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={friend.avatar} 
                        alt={friend.name} 
                        className="w-24 h-24 rounded-[2.2rem] object-cover border-4 border-slate-50 shadow-inner"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                    </div>

                    {/* Information */}
                    <div className="mb-6 h-16">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">{friend.name}</h3>
                      <div className="flex flex-col gap-0.5 mt-2">
                         <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full inline-block mx-auto">
                            {friend.campus}
                         </span>
                         <span className="text-[10px] text-slate-400 font-bold mt-1 italic">{friend.class}</span>
                      </div>
                    </div>

                    {/* Actions Fixes */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button 
                        className="bg-slate-900 text-white py-3.5 rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-slate-200"
                      >
                        <FiMessageCircle size={14} className="group-hover/btn:animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-tighter text-white">Chat</span>
                      </button>
                      
                      <button 
                        onClick={() => handleUnfriend(friend.id, friend.name)}
                        className="bg-rose-50 text-rose-500 py-3.5 rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <FiUserX size={14} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Annuler</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* If no results */}
            {friends.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <FiSearch className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Désolé, aucun ami ne correspond à ce nom.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FriendsList;