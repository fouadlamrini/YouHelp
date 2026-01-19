import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMapPin, FiLayers, FiBookOpen, FiSend, FiChevronDown, FiLogOut, FiArrowLeft, FiTag } from "react-icons/fi";

const InfoComplet = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    campus: "",
    className: "", 
    nickName: "",
    level: "",
    role: ""
  });

  // Data dyal les classes m9sma
  const classNames = ["Javascript", "Java", "PHP", "Python", "C#"];
  const nickNames = ["Mernerds", "Javador", "DarHamza", "Pythoneers", "C-Sharpers"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.role) {
      alert("Veuillez choisir votre rôle !");
      return;
    }
    console.log("Données envoyées:", formData);
    alert("Profil soumis avec succès !");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex items-center justify-center p-4 py-12 relative overflow-hidden text-left">
      
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/5 -skew-x-12 translate-x-32"></div>

      <main className="max-w-3xl w-full relative z-10">
        
        {/* TOP ACTIONS */}
        <div className="flex justify-between items-center mb-8 px-6">
          <button 
            onClick={() => navigate('/pending')}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all"
          >
            <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Retour
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 hover:text-rose-600 transition-all"
          >
            <FiLogOut size={16} className="group-hover:translate-x-1 transition-transform"/> Déconnexion
          </button>
        </div>

        <div className="bg-white rounded-[4rem] p-10 md:p-16 shadow-2xl shadow-indigo-200/20 border border-white/50">
          
          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">
              Finaliser l'inscription
            </h1>
            <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full mb-4"></div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
              Informations académiques requises
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* CAMPUS (Full Width) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                <FiMapPin className="text-indigo-500" /> Votre Campus
              </label>
              <div className="relative">
                <select 
                  required
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all"
                  onChange={(e) => setFormData({...formData, campus: e.target.value})}
                >
                  <option value="">Sélectionner le campus</option>
                  <option value="Safi">YouCode Safi</option>
                  <option value="Youssoufia">YouCode Youssoufia</option>
                  <option value="Nador">YouCode Nador</option>
                </select>
                <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* CLASS NAME & NICKNAME (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                  <FiLayers className="text-indigo-500" /> Nom de Classe
                </label>
                <div className="relative">
                  <select 
                    required
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all"
                    onChange={(e) => setFormData({...formData, className: e.target.value})}
                  >
                    <option value="">Ex: Javascript</option>
                    {classNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                  <FiTag className="text-indigo-500" /> Nickname de Classe
                </label>
                <div className="relative">
                  <select 
                    required
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all"
                    onChange={(e) => setFormData({...formData, nickName: e.target.value})}
                  >
                    <option value="">Ex: Mernerds</option>
                    {nickNames.map(nick => <option key={nick} value={nick}>{nick}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* LEVEL & ROLE (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                  <FiBookOpen className="text-indigo-500" /> Niveau
                </label>
                <div className="relative">
                  <select 
                    required
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all"
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                  >
                    <option value="">Promotion</option>
                    <option value="P1">Année 01 (P1)</option>
                    <option value="P2">Année 02 (P2)</option>
                  </select>
                  <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                  <FiUser className="text-indigo-500" /> Je suis
                </label>
                <div className="flex gap-3 h-[60px]">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: "etudiant"})}
                    className={`flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                      formData.role === 'etudiant' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                      : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                  >
                    Étudiant
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: "formateur"})}
                    className={`flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                      formData.role === 'formateur' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                      : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                  >
                    Formateur
                  </button>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-10">
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-4 group"
              >
                Confirmer mes informations
                <FiSend size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>

        <p className="mt-10 text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
          YouHelp &copy; 2026 • Accès Sécurisé
        </p>
      </main>
    </div>
  );
};

export default InfoComplet;