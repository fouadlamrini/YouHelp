import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
      {/* Logo */}
      <div className="text-xl font-bold">
        <Link to="/" className="hover:text-orange-300 transition">
          YouHelp
        </Link>
      </div>

      {/* Links */}
      <div className="flex gap-6 text-sm font-medium">
        <Link to="/" className="hover:text-orange-300 transition">
          Home
        </Link>
        <Link to="/about" className="hover:text-orange-300 transition">
          About
        </Link>
        <Link to="/login" className="hover:text-orange-300 transition">
          Login
        </Link>
        <Link
          to="/register"
          className="bg-orange-500 px-4 py-1 rounded hover:bg-orange-600 transition"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
