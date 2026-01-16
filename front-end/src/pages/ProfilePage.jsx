import React from "react";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import HeaderProfile from "../components/HeaderProfile";
// Ila 3ndk Sidebar n-qdro n-zidouha hna

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">
      {/* 1. Navbar L-foq */}
      <NavbarLoggedIn />

      <main className="w-full">
        {/* 2. Header Profile (Cover + Name + Tabs) */}
        <HeaderProfile />

        {/* 3. Page Content Area */}
        <div className="max-w-5xl mx-auto p-4 md:py-6 grid grid-cols-1 gap-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 min-h-[400px]">
             {/* Hna ghadi ikoun l-content dyal kol section (Posts, Friends, etc.) */}
             <h2 className="text-xl font-black text-slate-800 tracking-tight mb-4">Aperçu</h2>
             <div className="h-[1px] bg-slate-50 w-full mb-6"></div>
             
             <div className="flex flex-col items-center justify-center py-20 text-slate-300 italic font-bold">
                Sélectionnez une section ci-dessus pour voir les détails.
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;