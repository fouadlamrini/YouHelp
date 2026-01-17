import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import NavbarLoggedIn from '../components/NavbarLoggedIn';
import HeaderProfile from '../components/HeaderProfile';
import { FiUser, FiMail, FiLock, FiShield, FiMapPin, FiLayers, FiSave, FiEdit3 } from 'react-icons/fi';

const Info = () => {
  const [userData, setUserData] = useState({
    name: "Hamza Erradi",
    email: "hamza.erradi@youcode.ma",
    role: "Student",
    campus: "Safi",
    level: "P2",
    class: "Ada Lovelace",
    password: "••••••••"
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Profil mis à jour !");
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden text-left">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <HeaderProfile />

          <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20">
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              
              {/* --- Header --- */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Paramètres du Profil</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Consultez et modifiez vos accès</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                  <FiEdit3 size={20} />
                </div>
              </div>

              <form onSubmit={handleSave} className="p-8 md:p-12 space-y-10">
                
                {/* --- Section 1: Champs Modifiables --- */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] px-2 border-l-4 border-indigo-600">Champs Modifiables</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2 flex items-center gap-2">
                        <FiUser size={14}/> Nom Complet
                      </label>
                      <input 
                        type="text" 
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all cursor-text"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2 flex items-center gap-2">
                        <FiLock size={14}/> Mot de passe
                      </label>
                      <input 
                        type="password" 
                        name="password"
                        value={userData.password}
                        onChange={handleChange}
                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all cursor-text"
                      />
                    </div>
                  </div>
                </div>

                {/* --- Section 2: Informations Fixes (Cursor Interdit) --- */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 border-l-4 border-slate-300">Informations Fixes (Verrouillées)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Email */}
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">
                        <FiMail size={14}/> Adresse Email
                      </label>
                      <div className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-600 flex items-center gap-2 cursor-not-allowed select-none">
                        {userData.email}
                      </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">
                        <FiShield size={14}/> Rôle Système
                      </label>
                      <div className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[12px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 cursor-not-allowed select-none">
                        {userData.role}
                      </div>
                    </div>
                  </div>

                  {/* Campus / Class / Level */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><FiMapPin size={12}/> Campus</label>
                      <div className="p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[11px] font-black text-slate-700 uppercase cursor-not-allowed select-none">
                        {userData.campus}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><FiLayers size={12}/> Classe</label>
                      <div className="p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[11px] font-black text-slate-700 uppercase cursor-not-allowed select-none">
                        {userData.class}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><FiLayers size={12}/> Level</label>
                      <div className="p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[11px] font-black text-slate-700 uppercase cursor-not-allowed select-none">
                        {userData.level}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Button --- */}
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit" 
                    className="flex items-center gap-3 bg-slate-900 text-white px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <FiSave size={16} />
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Info;