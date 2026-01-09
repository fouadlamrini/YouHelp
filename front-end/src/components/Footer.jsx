import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white px-6 py-6 mt-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <p>© 2026 YouHelp. All rights reserved.</p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-yellow-400">GitHub</a>
          <a href="#" className="hover:text-yellow-400">Contact</a>
          <Link to="/about" className="hover:text-yellow-400">About</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
