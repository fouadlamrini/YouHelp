import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiLogOut, FiCheckCircle, FiHeart } from 'react-icons/fi';

const WaitingPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logic dyal logout hna (e.g., clear localStorage)
    console.log("Deconnexion...");
    navigate('/login');
  };

  const handleCompleteInfo = () => {
    navigate('/complete-profile'); // Katdih l-page fin y-kemel les infos
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden text-left">
      
      {/* --- العناصر الزخرفية في الخلفية --- */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-500/5 rounded-full blur-3xl"></div>

      {/* --- البطاقة الرئيسية --- */}
      <div className="max-w-2xl w-full bg-white rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-50 p-10 md:p-16 relative z-10">
        
        {/* Logo / Icon */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200 rotate-3">
              <FiHeart size={40} fill="currentColor" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white border-4 border-white">
              <FiCheckCircle size={20} />
            </div>
          </div>
        </div>

        {/* Message de Bienvenue */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
            Bienvenue sur <span className="text-indigo-600">YouHelp</span> !
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
            Nous sommes ravis de vous avoir parmi nous. Pour rejoindre pleinement notre communauté d'entraide, nous avons besoin d'en savoir un peu plus sur vous.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 space-y-4">
          <button 
            onClick={handleCompleteInfo}
            className="w-full flex items-center justify-center gap-4 bg-indigo-600 text-white py-5 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-100"
          >
            <FiUserPlus size={20} />
            Compléter mes informations
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-4 bg-slate-50 text-slate-400 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
          >
            <FiLogOut size={18} />
            Se déconnecter
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-12 flex justify-center items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Communauté YouCode en ligne
          </p>
        </div>
      </div>

      {/* Footer link */}
      <p className="mt-8 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
        Besoin d'aide ? <a href="#" className="text-indigo-600 border-b border-indigo-200 pb-0.5">Contactez le support</a>
      </p>
    </div>
  );
};

export default WaitingPage;