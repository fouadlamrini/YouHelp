import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiUsers,
  FiBarChart2,
  FiMapPin,
  FiLayers,
  FiBook,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

/* ------------------ NavItem Component ------------------ */
const NavItem = ({ icon: Icon, label, to, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <div className="mb-2">
      <Link
        to={to}
        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300
          ${
            isActive
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
              : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
          }`}
      >
        <div className="min-w-[20px]">
          <Icon size={20} />
        </div>

        {isOpen && (
          <span className="font-bold text-sm tracking-tight whitespace-nowrap">
            {label}
          </span>
        )}
      </Link>
    </div>
  );
};

/* ------------------ Sidebar Component ------------------ */
const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const { user } = useAuth();
  const roleName = user?.role?.name ?? user?.role;
  const isEtudiant = roleName === "etudiant";
  const isSuperAdmin = roleName === "super_admin";

  if (isEtudiant) return null;

  return (
    <div
      className={`relative h-screen bg-white border-r border-slate-100 transition-all duration-300 flex flex-col
        ${isOpen ? "w-72" : "w-24"}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 w-7 h-7 bg-white border border-slate-100 rounded-full
        flex items-center justify-center text-indigo-600 shadow-sm hover:shadow-md z-50"
      >
        {isOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
      </button>

      {/* Header - Logo redirection to /posts */}
      <div className="p-6 mb-4">
        <Link to="/posts" className="flex items-center gap-3 overflow-hidden group">
          <div className="min-w-[32px] h-8 bg-indigo-600 rounded-xl flex items-center justify-center
          text-white font-black text-xs shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            YH
          </div>
          {isOpen && (
            <span className="text-xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">
              YouHelp.
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-grow px-3 overflow-y-auto overflow-x-hidden">
        {/* Categories */}
        <NavItem icon={FiGrid} label="Categories" to="/categories" isOpen={isOpen} />

        {/* Statistiques */}
        <NavItem icon={FiBarChart2} label="Statistiques" to="/statistics" isOpen={isOpen} />

        {/* Super Admin: Campus / Level / Class */}
        {isSuperAdmin && (
          <>
            <div className="my-4 border-t border-slate-50"></div>
            <NavItem icon={FiMapPin} label="Campus" to="/admin/campus" isOpen={isOpen} />
            <NavItem icon={FiLayers} label="Level" to="/admin/level" isOpen={isOpen} />
            <NavItem icon={FiBook} label="Class" to="/admin/class" isOpen={isOpen} />
          </>
        )}

        <div className="my-4 border-t border-slate-50"></div>

        {/* Users */}
        <NavItem icon={FiUsers} label="Users List" to="/users" isOpen={isOpen} />
      </div>

    </div>
  );
};

export default Sidebar;