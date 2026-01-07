import React, { useState } from "react";

const Navbar = ({ user }) => {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">YouHelp</div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center">
          {/* Public links */}
          <li className="hover:text-yellow-400 cursor-pointer">Home</li>
          <li className="hover:text-yellow-400 cursor-pointer">About</li>

          {/* Logged-in links */}
          {user && (
            <>
              <li className="hover:text-yellow-400 cursor-pointer">Posts</li>
              <li className="hover:text-yellow-400 cursor-pointer">Knowledge</li>
              <li className="hover:text-yellow-400 cursor-pointer">SolutionPost</li>
              <li className="hover:text-yellow-400 cursor-pointer">Favorites</li>
              <li className="hover:text-yellow-400 cursor-pointer">Dashboard</li>
            </>
          )}

          {/* Admin dropdown */}
          {user && user.role === "admin" && (
            <div className="relative group">
              <button className="hover:text-yellow-400">Admin</button>
              <div className="absolute hidden group-hover:block bg-white text-gray-700 shadow-lg rounded-md mt-2 w-48">
                <a href="/category-management" className="block px-4 py-2 hover:bg-gray-100">Category Management</a>
                <a href="/sub-category-management" className="block px-4 py-2 hover:bg-gray-100">SubCategory Management</a>
                <a href="/post-management" className="block px-4 py-2 hover:bg-gray-100">Post Management</a>
                <a href="/knowledge-management" className="block px-4 py-2 hover:bg-gray-100">Knowledge Management</a>
                <a href="/request-role-management" className="block px-4 py-2 hover:bg-gray-100">Request Role Management</a>
                <a href="/user-management" className="block px-4 py-2 hover:bg-gray-100">User Management</a>
                <a href="/reclamation-management" className="block px-4 py-2 hover:bg-gray-100">Reclamation Management</a>
              </div>
            </div>
          )}

          {/* Formateur dropdown */}
          {user && user.role === "formateur" && (
            <div className="relative group">
              <button className="hover:text-yellow-400">Workshops</button>
              <div className="absolute hidden group-hover:block bg-white text-gray-700 shadow-lg rounded-md mt-2 w-48">
                <a href="/workshop-requests" className="block px-4 py-2 hover:bg-gray-100">Workshop Requests</a>
                <a href="/workshop-schedule" className="block px-4 py-2 hover:bg-gray-100">Workshop Schedule</a>
              </div>
            </div>
          )}

          {/* Auth links */}
          {!user && <li className="hover:text-yellow-400 cursor-pointer">Login</li>}
          {!user && <li className="hover:text-yellow-400 cursor-pointer">Register</li>}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <ul className="md:hidden mt-2 space-y-2">
          <li className="hover:text-yellow-400 cursor-pointer">Home</li>
          <li className="hover:text-yellow-400 cursor-pointer">About</li>
          {user && (
            <>
              <li className="hover:text-yellow-400 cursor-pointer">Posts</li>
              <li className="hover:text-yellow-400 cursor-pointer">Knowledge</li>
              <li className="hover:text-yellow-400 cursor-pointer">SolutionPost</li>
              <li className="hover:text-yellow-400 cursor-pointer">Favorites</li>
              <li className="hover:text-yellow-400 cursor-pointer">Dashboard</li>
            </>
          )}
          {user && user.role === "admin" && (
            <>
              <li className="hover:text-yellow-400 cursor-pointer">Category Management</li>
              <li className="hover:text-yellow-400 cursor-pointer">SubCategory Management</li>
              <li className="hover:text-yellow-400 cursor-pointer">Post Management</li>
              <li className="hover:text-yellow-400 cursor-pointer">Knowledge Management</li>
              <li className="hover:text-yellow-400 cursor-pointer">Request Role Management</li>
              <li className="hover:text-yellow-400 cursor-pointer">User Management</li>
              <li className="hover:text-yellow-400 cursor-pointer">Reclamation Management</li>
            </>
          )}
          {user && user.role === "formateur" && (
            <>
              <li className="hover:text-yellow-400 cursor-pointer">Workshop Requests</li>
              <li className="hover:text-yellow-400 cursor-pointer">Workshop Schedule</li>
            </>
          )}
          {!user && <li className="hover:text-yellow-400 cursor-pointer">Login</li>}
          {!user && <li className="hover:text-yellow-400 cursor-pointer">Register</li>}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
