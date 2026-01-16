import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import NavbarLoggedIn from '../components/NavbarLoggedIn';
import { FiUserPlus, FiTrash2, FiEdit, FiSearch, FiX, FiSave } from 'react-icons/fi';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Hamza Erradi", email: "hamza@youcode.ma", campus: "Safi", class: "Ada Lovelace", level: "P1", role: "Student" },
    { id: 2, name: "Sara Bakrim", email: "sara@youcode.ma", campus: "Youssoufia", class: "Javascript", level: "P2", role: "Coach" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', campus: '', class: '', level: '', role: 'Student'
  });

  const campusOptions = ["Safi", "Youssoufia", "Agadir", "Nador", "Casablanca"];
  const classOptions = ["Ada Lovelace", "Alan Turing", "Margaret Hamilton", "Javascript", "Java", "Python"];
  const levelOptions = ["P1", "P2", "P3"];
  const roleOptions = ["Student", "Coach", "Admin"];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const newUser = { id: Date.now(), ...formData };
    setUsers([...users, newUser]);
    setFormData({ name: '', email: '', password: '', campus: '', class: '', level: '', role: 'Student' });
    alert("Utilisateur créé !");
  };

  const handleDelete = (id) => {
    if (window.confirm("Bghiti t-msa7 had l-user?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    setUsers(users.map(u => (u.id === editingUser.id ? editingUser : u)));
    setIsEditModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight text-left">Gestion des Utilisateurs</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1 text-left">Gérer les profils et les accès</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* --- 1. FORMULAIRE DE CRÉATION --- */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
                    <FiUserPlus size={20}/>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Ajouter un profil</h3>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nom Complet</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nom et Prénom" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 text-left block">Email & Password</label>
                    <div className="space-y-2">
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="email@youcode.ma" required />
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Campus</label>
                      <select name="campus" value={formData.campus} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer" required>
                        <option value="">Sélectionner</option>
                        {campusOptions.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Rôle</label>
                      <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                        {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Classe</label>
                      <select name="class" value={formData.class} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer" required>
                        <option value="">Sélectionner</option>
                        {classOptions.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Level</label>
                      <select name="level" value={formData.level} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer" required>
                        <option value="">Sélectionner</option>
                        {levelOptions.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all mt-4 shadow-xl">
                    Créer le profil
                  </button>
                </form>
              </div>

              {/* --- 2. TABLEAU DES UTILISATEURS --- */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                  <FiSearch className="text-slate-400 ml-2" size={20}/>
                  <input 
                    type="text" 
                    placeholder="Filtrer par nom..." 
                    className="flex-1 bg-transparent border-none outline-none text-[11px] font-bold text-slate-600"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-10">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800">{user.name}</p>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                  user.role === 'Admin' ? 'bg-rose-100 text-rose-600' : 
                                  user.role === 'Coach' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>{user.role}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                             <div className="flex flex-col">
                               <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">{user.campus}</p>
                               <p className="text-[10px] font-bold text-slate-400">{user.class} • {user.level}</p>
                             </div>
                          </td>
                          <td className="p-6">
                            <div className="flex justify-end gap-2 pr-4">
                              <button 
                                onClick={() => openEditModal(user)} 
                                className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                title="Modifier"
                              >
                                <FiEdit size={14}/>
                              </button>
                              <button 
                                onClick={() => handleDelete(user.id)} 
                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                title="Supprimer"
                              >
                                <FiTrash2 size={14}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* --- MODAL UPDATE (FIXE) --- */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8 border-b pb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase">Modifier Profil</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-slate-50 rounded-xl hover:text-rose-500 transition-colors">
                <FiX size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4 text-left">
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nom Complet</label>
                  <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Campus</label>
                  <select value={editingUser.campus} onChange={(e) => setEditingUser({...editingUser, campus: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                    {campusOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Rôle</label>
                  <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Classe</label>
                  <select value={editingUser.class} onChange={(e) => setEditingUser({...editingUser, class: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                    {classOptions.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Level</label>
                  <select value={editingUser.level} onChange={(e) => setEditingUser({...editingUser, level: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                    {levelOptions.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl">
                <FiSave size={16}/> Mettre à jour
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;