import { Link } from "react-router-dom";
import { 
  FiUser, 
  FiSettings, 
  FiBell, 
  FiMail, 
  FiUserPlus, 
  FiCheckCircle, 
  FiHeart, 
  FiEdit3, 
  FiBookOpen,
  FiChevronDown
} from "react-icons/fi";

function NavbarLoggedIn() {
  return (
    <nav className="w-full bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-[100]">
      
      {/* 1. Logo & Main Links */}
      <div className="flex items-center gap-10">
        <Link to="/" className="text-2xl font-black text-indigo-600 tracking-tighter">
          YouHelp<span className="text-slate-900">.</span>
        </Link>

        {/* Links: My Posts, Knowledge, etc. */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/my-posts" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            <FiEdit3 size={18} /> My Posts
          </Link>
          <Link to="/my-solved" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            <FiCheckCircle size={18} /> My Solved
          </Link>
          <Link to="/my-favourites" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            <FiHeart size={18} /> My Favourites
          </Link>
          <Link to="/my-knowledge" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            <FiBookOpen size={18} /> My Knowledge
          </Link>
        </div>
      </div>

      {/* 2. Action Icons (Notifications, Messages, Profile) */}
      <div className="flex items-center gap-4">
        
        {/* Invitations / Notifications / Messages Group */}
        <div className="flex items-center gap-1 mr-2">
          {/* Invitations */}
          <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all relative group">
            <FiUserPlus size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
            <span className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Invitations</span>
          </button>

          {/* Messages */}
          <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all relative group">
            <FiMail size={20} />
            <span className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Messages</span>
          </button>

          {/* Notifications */}
          <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all relative group">
            <FiBell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            <span className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Notifications</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>

        {/* Settings */}
        <Link to="/settings" className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all group relative">
          <FiSettings size={20} />
          <span className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Settings</span>
        </Link>

        {/* Profile Dropdown Simulation */}
      <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-white hover:bg-slate-50 rounded-full border border-slate-200 transition-all group shadow-sm">
  {/* 1. Profile Icon (Avatar) */}
  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 flex-shrink-0">
    <img 
      src="https://i.pravatar.cc/150?u=youcoder" 
      alt="profile" 
      className="w-full h-full object-cover"
    />
  </div>

  {/* 2. Username Section */}
  <div className="hidden md:block text-left mr-1">
    <p className="text-[12px] font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">
      Fouad Lamrini
    </p>
   
  </div>

  {/* 3. Chevron Icon */}
  
</button>

      </div>
    </nav>
  );
}

export default NavbarLoggedIn;