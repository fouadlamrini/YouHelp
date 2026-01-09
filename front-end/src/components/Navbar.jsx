import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-[100]">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-black text-indigo-600 tracking-tighter group">
          YouHelp
        </Link>
      </div>

      {/* Links */}
      <div className="flex items-center gap-8">
        <Link 
          to="/" 
          className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          Home
        </Link>
        <Link 
          to="/about" 
          className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          About
        </Link>
        
        <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>

        <Link 
          to="/login" 
          className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          Login
        </Link>
        
        <Link
          to="/register"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-extrabold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all transform active:scale-95"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;