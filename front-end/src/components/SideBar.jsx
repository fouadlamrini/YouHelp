import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiGrid, 
  FiBook, 
  FiEdit, 
  FiUserCheck, 
  FiCheckSquare, 
  FiUsers,
  FiChevronDown,
  FiHash
} from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [showCats, setShowCats] = useState(false);

  // Categories & Subcategories Data
  const categories = [
    { name: "Frontend", subs: ["React", "Tailwind", "Next.js"] },
    { name: "Backend", subs: ["Node.js", "Laravel", "Python"] },
  ];

  const NavItem = ({ icon: Icon, label, to, hasSub = false, onClick }) => (
    <div className="mb-2">
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
          ${window.location.pathname === to ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
      >
        <div className="min-w-[20px]"><Icon size={20} /></div>
        {isOpen && (
          <div className="flex-grow flex items-center justify-between overflow-hidden whitespace-nowrap">
            <span className="font-bold text-sm tracking-tight">{label}</span>
            {hasSub && <FiChevronDown size={14} className={`transition-transform ${showCats ? 'rotate-180' : ''}`} />}
          </div>
        )}
      </Link>
    </div>
  );

  return (
    <div className={`relative h-screen bg-white border-r border-slate-100 transition-all duration-300 ease-in-out flex flex-col
      ${isOpen ? "w-72" : "w-20"}`}
    >
      {/* --- Toggle Button --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 w-7 h-7 bg-white border border-slate-100 rounded-full flex items-center justify-center text-indigo-600 shadow-sm hover:shadow-md z-50 transition-all"
      >
        {isOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
      </button>

      {/* --- Sidebar Header --- */}
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[32px] h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-200">
            YH
          </div>
          {isOpen && <span className="text-xl font-black text-slate-900 tracking-tighter">YouHelp.</span>}
        </div>
      </div>

      {/* --- Navigation Links --- */}
      <div className="flex-grow px-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* Categories Section */}
        <NavItem 
          icon={FiGrid} 
          label="Categories" 
          to="#" 
          hasSub={true} 
          onClick={() => setShowCats(!showCats)} 
        />
        
        {/* Subcategories (Visible when Categories open & Sidebar open) */}
        {isOpen && showCats && (
          <div className="ml-6 mb-4 space-y-1 animate-in slide-in-from-top-2 duration-300">
            {categories.map((cat) => (
              <div key={cat.name} className="py-2">
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{cat.name}</p>
                {cat.subs.map(sub => (
                  <Link key={sub} to={`/category/${sub.toLowerCase()}`} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                    <FiHash size={14} /> {sub}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        <NavItem icon={FiBook} label="Knowledge" to="/knowledge" />
        <NavItem icon={FiEdit} label="All Posts" to="/posts" />
        <NavItem icon={FiUserCheck} label="Request Role" to="/request-role" />
        <NavItem icon={FiCheckSquare} label="Solutions" to="/solutions" />
        <NavItem icon={FiUsers} label="Users List" to="/users" />

      </div>

      {/* --- Footer (Optionally for User Info) --- */}
      <div className="p-4 border-t border-slate-50">
         <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-white shadow-sm flex-shrink-0"></div>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-900 truncate">Saad Dev</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Mentor</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Sidebar;