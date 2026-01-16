import React from "react";
import { FiShield } from "react-icons/fi";

const Welcome = ({ userName }) => {
  const handleAdminRequest = () => {
    // Logic dyal s-sifit l-demande l-admin
    alert("Votre demande d'accès avancé a été envoyée à l'administrateur.");
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-white rounded-[2.5rem] p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {/* Icon Box */}
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50 flex-shrink-0">
          <FiShield size={24} />
        </div>
        
        {/* Text Area */}
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
            Bienvenue, {userName} !
          </h2>
          <p className="text-[11px] text-slate-500 font-medium max-w-sm">
            Vos fonctionnalités sont actuellement limitées. Demandez l'accès complet pour débloquer tous les outils avancés.
          </p>
        </div>
      </div>

      {/* Button Action */}
      <button 
        onClick={handleAdminRequest}
        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 whitespace-nowrap"
      >
        Envoyer demande à l'admin
      </button>
    </div>
  );
};

export default Welcome;