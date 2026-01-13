import React from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { 
  FiPlus, FiEdit3, FiTrash, FiGrid, FiHash, 
  FiSettings, FiActivity, FiChevronRight 
} from "react-icons/fi";

const CategoryManager = () => {
  const categories = [
    { id: 1, name: "Frontend", color: "bg-blue-500", subs: ["React", "Vue", "Tailwind"] },
    { id: 2, name: "Backend", color: "bg-purple-500", subs: ["Node.js", "Express", "PostgreSQL"] },
    { id: 3, name: "Cybersecurity", color: "bg-rose-500", subs: ["Pentesting", "Network", "Linux"] },
    { id: 4, name: "Mobile", color: "bg-amber-500", subs: ["Flutter", "Swift", "Kotlin"] },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <NavbarLoggedIn />
        
        <main className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            
            {/* --- TOP BAR --- */}
            <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <FiGrid size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800 tracking-tight">System Categories</h1>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Workspace / Categories</p>
                </div>
              </div>
              <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all active:scale-95">
                <FiPlus size={18} /> New Entry
              </button>
            </div>

            {/* --- GRID OF CATEGORIES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {categories.map((cat) => (
                <div key={cat.id} className="group bg-white rounded-[2.5rem] border border-slate-100 p-6 hover:border-indigo-200 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50">
                  
                  {/* Decorative Background Pattern */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 ${cat.color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`}></div>

                  <div className="relative z-10">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-white shadow-inner`}>
                          <FiHash size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-800">{cat.name}</h2>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <FiActivity size={12} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Active Directory</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <FiEdit3 size={18} />
                        </button>
                        <button className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <FiTrash size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Sub-categories Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-Modules</span>
                        <span className="w-10 h-0.5 bg-slate-100 flex-grow mx-4"></span>
                        
                        {/* --- NEW ADD ICON CIRCLE --- */}
                        <button 
                          title="Add Sub-category"
                          className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm border border-indigo-100 active:scale-90"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {cat.subs.map((sub, idx) => (
                          <div key={idx} className="flex items-center group/item">
                            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 group-hover/item:border-indigo-200 group-hover/item:bg-white transition-all flex items-center gap-2">
                              {sub}
                              <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button className="text-slate-300 hover:text-indigo-600"><FiEdit3 size={10}/></button>
                                <button className="text-slate-300 hover:text-rose-500"><FiTrash size={10}/></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                 
                  </div>
                </div>
              ))}
              
              {/* Ghost Card for Adding */}
              <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-10 group hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:scale-110 shadow-sm transition-all mb-4">
                  <FiPlus size={32} />
                </div>
                <p className="font-black text-slate-400 group-hover:text-indigo-600 uppercase text-xs tracking-[0.2em]">Create New Module</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryManager;