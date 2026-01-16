import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { FiCheck, FiX, FiUser, FiSearch, FiLayers, FiMapPin, FiAward } from "react-icons/fi";

const RoleRequestsPage = () => {
  // Data dyal les utilisateurs
  const [requests, setRequests] = useState([
    { id: 1, name: "Fouad Lamrini", email: "fouad@example.com", role: "Etudiant", niveau: "2ème Année", classe: "DEV101", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "Kamal Ouhadi", email: "kamal@example.com", role: "Formateur", niveau: "Expert", classe: "Staff", avatar: "https://i.pravatar.cc/150?u=8" },
    { id: 3, name: "Sara Tazi", email: "sara@example.com", role: "Etudiant", niveau: "1ère Année", classe: "WEB201", avatar: "https://i.pravatar.cc/150?u=5" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Les options dyal les selects
  const rolesOptions = ["Etudiant", "Formateur"];
  const niveauxOptions = ["1ère Année", "2ème Année", "Licence", "Expert"];
  const classesOptions = ["DEV101", "DEV102", "WEB201", "WEB202", "INFO301", "Staff"];

  const handleUpdate = (id, field, value) => {
    setRequests(requests.map(req => req.id === id ? { ...req, [field]: value } : req));
  };

  const handleAction = (id, action) => {
    if (action === "accept") {
      const user = requests.find(r => r.id === id);
      console.log("Validé avec succès:", user);
    }
    setRequests(requests.filter(req => req.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans overflow-hidden">
      <Sidebar />
      
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Validation des Comptes</h1>
                <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-[0.2em]">Configuration des accès utilisateurs</p>
              </div>
              
              <div className="relative group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Rechercher par nom..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none w-72 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rôle</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Niveau</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Classe</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Décision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                    <tr key={user.id} className="hover:bg-indigo-50/20 transition-all group">
                      
                      {/* 1. User Info */}
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 overflow-hidden flex-shrink-0 shadow-sm group-hover:border-indigo-200 transition-colors">
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase italic tracking-tighter">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Select Rôle */}
                      <td className="p-6">
                        <div className="relative min-w-[130px]">
                          <select 
                            value={user.role}
                            onChange={(e) => handleUpdate(user.id, "role", e.target.value)}
                            className="w-full appearance-none bg-indigo-50/50 border border-indigo-100 text-[10px] font-black uppercase text-indigo-700 px-4 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none cursor-pointer"
                          >
                            {rolesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <FiLayers className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={12} />
                        </div>
                      </td>

                      {/* 3. Select Niveau */}
                      <td className="p-6">
                        <div className="relative min-w-[130px]">
                          <select 
                            value={user.niveau}
                            onChange={(e) => handleUpdate(user.id, "niveau", e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-600 px-4 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 outline-none cursor-pointer"
                          >
                            {niveauxOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <FiAward className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={12} />
                        </div>
                      </td>

                      {/* 4. Select Classe */}
                      <td className="p-6">
                        <div className="relative min-w-[120px]">
                          <select 
                            value={user.classe}
                            onChange={(e) => handleUpdate(user.id, "classe", e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-600 px-4 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 outline-none cursor-pointer"
                          >
                            {classesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <FiMapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={12} />
                        </div>
                      </td>

                      {/* 5. Actions */}
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleAction(user.id, "accept")}
                            className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-90"
                            title="Accepter"
                          >
                            <FiCheck size={18} />
                          </button>
                          
                          <button 
                            onClick={() => handleAction(user.id, "refuse")}
                            className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 border border-slate-100 rounded-xl hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                            title="Refuser"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {requests.length === 0 && (
                <div className="py-32 text-center bg-white">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <FiUser size={32} className="text-slate-200" />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Liste d'attente vide</h3>
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