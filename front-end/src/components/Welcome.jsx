import React from "react";
import { useNavigate } from "react-router-dom"; 
import { FiStar } from "react-icons/fi";

const Welcome = ({ userName }) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    // Redirection vers la page du formulaire
    navigate("/complete-profile"); 
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-white rounded-[2.5rem] p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {/* Icon Box */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 flex-shrink-0">
          <FiStar size={28} className="animate-pulse" />
        </div>
        
        {/* Text Area */}
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">
            Bienvenue {userName} sur <span className="text-indigo-600">YouHelp</span> !
          </h2>
          <p className="text-[11px] text-slate-500 font-bold leading-relaxed max-w-md">
            Vos accès sont actuellement limités. Pour profiter de toutes nos fonctionnalités, <span className="text-indigo-600">rejoignez-nous</span> et devenez un membre officiel de <span className="font-black underline">Youcoders</span> !
          </p>
        </div>
      </div>

      {/* Button Action */}
      <button 
        onClick={handleRedirect}
        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 whitespace-nowrap"
      >
        Compléter mon profil
      </button>
    </div>
  );
};

export default Welcome;