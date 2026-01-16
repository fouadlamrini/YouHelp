import React from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import SidebarProfile from "../components/SidebarProfile";

const ProfilePage = () => {
  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans">
      {/* 1. Sidebar L-kbira (Global) */}
      <Sidebar />

      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* 2. Navbar L-foq */}
        <NavbarLoggedIn />

        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            
            {/* Grid Layout: Sidebar Profile (Yissar) + Content (Ymin) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Sidebar Profile - takes 4 columns */}
              <div className="lg:col-span-4">
                <SidebarProfile />
              </div>

              {/* Main Content Area - takes 8 columns */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[500px]">
                  <h1 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">
                    Dashboard Overview
                  </h1>
                  
                  {/* Hna i-ji l-content dyal kol section */}
                  <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400">
                    <p className="font-bold">Sélectionnez une option dans le menu du profil</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;