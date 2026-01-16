import React, { useState } from "react";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { FiUser, FiMapPin, FiLayers, FiBookOpen, FiSend, FiChevronDown } from "react-icons/fi";

const InfoComplet = () => {
  const [formData, setFormData] = useState({
    campus: "",
    className: "", // Beddelt smya l className bach mat-konch conflict m3a reserved word "class"
    level: "",
    role: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.role) {
      alert("Veuillez choisir votre rôle (Étudiant ou Formateur)");
      return;
    }
    console.log("Données envoyées:", formData);
    alert("Votre demande d'accès a été envoyée avec succès !");
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">
      {/* NAVBAR */}
      <NavbarLoggedIn />

      <main className="max-w-2xl mx-auto pt-12 pb-20 px-4">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* HEADER */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
              Compléter mon profil
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Finalisez votre inscription pour accéder à toutes les fonctionnalités.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* CAMPUS SELECT */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
                <FiMapPin className="text-indigo-500" /> Campus
              </label>
              <div className="relative">
                <select 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                  onChange={(e) => setFormData({...formData, campus: e.target.value})}
                >
                  <option value="">Où étudiez-vous ?</option>
                  <option value="Safi">YouCode Safi</option>
                  <option value="Youssoufia">YouCode Youssoufia</option>
                  <option value="Nador">YouCode Nador</option>
                </select>
                <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CLASSE SELECT */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
                  <FiLayers className="text-indigo-500" /> Classe
                </label>
                <div className="relative">
                  <select 
                    required
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                    onChange={(e) => setFormData({...formData, className: e.target.value})}
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Mernerds">Mernerds</option>
                    <option value="DarHamza">DarHamza</option>
                    <option value="Javador">Javador</option>
                  </select>
                  <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* NIVEAU SELECT */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
                  <FiBookOpen className="text-indigo-500" /> Niveau
                </label>
                <div className="relative">
                  <select 
                    required
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                  >
                    <option value="">Année</option>
                    <option value="1">1ère année</option>
                    <option value="2">2ème année</option>
                  </select>
                  <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* ROLE SELECTION */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
                <FiUser className="text-indigo-500" /> Votre Rôle
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: "etudiant"})}
                  className={`py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${formData.role === 'etudiant' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                >
                  Étudiant
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: "formateur"})}
                  className={`py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${formData.role === 'formateur' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                >
                  Formateur
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6">
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.25em] hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95 group"
              >
                Envoyer la demande 
                <FiSend size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default InfoComplet;