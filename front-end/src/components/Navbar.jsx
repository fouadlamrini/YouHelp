import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-2xl font-bold">YouHelp</div>
      <ul className="flex space-x-6">
        <li className="hover:text-yellow-400 cursor-pointer">Home</li>
        <li className="hover:text-yellow-400 cursor-pointer">About</li>
        <li className="hover:text-yellow-400 cursor-pointer">Posts</li>
        <li className="hover:text-yellow-400 cursor-pointer">Knowledge</li>
        <li className="hover:text-yellow-400 cursor-pointer">Login</li>
        <li className="hover:text-yellow-400 cursor-pointer">Register</li>
      </ul>
    </nav>
  );
};

export default Navbar;
