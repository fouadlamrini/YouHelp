import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { FiCheck, FiX, FiUser, FiSearch, FiMapPin, FiLayers, FiBookOpen, FiActivity } from "react-icons/fi";

const RoleRequestsPage = () => {
  // Data dyal les utilisateurs (Sample m3a Campus)
  const [requests, setRequests] = useState([
    { 
      id: 1, 
      name: "Fouad Lamrini", 
      email: "fouad@example.com", 
      role: "Etudiant", 
      niveau: "2ème Année", 
      classe: "Mernerds", 
      campus: "Safi",
      avatar: "https://i.pravatar.cc/150?u=1" 
    },
    { 
      id: 2, 
      name: "Kamal Ouhadi", 
      email: "kamal@example.com", 
      role: "Formateur", 
      niveau: "Expert", 
      classe: "Staff", 
      campus: "Youssoufia",
      avatar: "https://i.pravatar.cc/150?u=8" 
    },
    { 
      id: 3, 
      name: "Sara Tazi", 
      email: "sara@example.com", 
      role: "Etudiant", 
      niveau: "1ère Année", 
      classe: "Javador", 
      campus: "Nador",
      avatar: "https://i.pravatar.cc/150?u=5" 
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleAction = (id, action) => {
    if (action === "accept") {
      const user = requests.find(r => r.id === id);
      console.log("Compte validé:", user);
    } else {
      console.log("Demande refusée pour ID:", id);
    }
    // Delete from list after action
    setRequests(requests.filter(req => req.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
                      <FiActivity size={20} />
                   </div>
                   <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Demandes d'adhésion</h1>
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] ml-11">Gestion des nouveaux Youcoders</p>
              </div>
              
              <div className="relative group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Chercher un nom..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 bg-white border-none rounded-[1.5rem] text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none w-80 shadow-sm transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campus</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rôle / Niveau</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Classe</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Décision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requests
                      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        
                        {/* User Info */}
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden shadow-inner border border-white">
                              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-[13px] font-black text-slate-800 tracking-tight">{user.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold tracking-tight">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Campus (Fixe) */}
                        <td className="p-6">
                          <div className="flex items-center gap-2 text-slate-600">
                            <FiMapPin className="text-rose-500" size={14} />
                            <span className="text-[11px] font-black uppercase tracking-wider">{user.campus}</span>
                          </div>
                        </td>

                        {/* Role & Niveau (Fixe) */}
                        <td className="p-6 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase mb-1">
                              {user.role}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <FiBookOpen size={10} /> {user.niveau}
                            </span>
                          </div>
                        </td>

                        {/* Classe (Fixe) */}
                        <td className="p-6 text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100/50 rounded-xl text-slate-600 border border-slate-100">
                            <FiLayers size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase">{user.classe}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => handleAction(user.id, "accept")}
                              className="group/btn w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-90"
                              title="Valider le compte"
                            >
                              <FiCheck size={20} className="group-hover/btn:scale-110 transition-transform" />
                            </button>
                            
                            <button 
                              onClick={() => handleAction(user.id, "refuse")}
                              className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 border border-slate-200 rounded-xl hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-90"
                              title="Refuser"
                            >
                              <FiX size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {requests.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <div className="py-24 text-center bg-white">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <FiUser size={28} className="text-slate-200" />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Aucune demande en attente</h3>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoleRequestsPage;