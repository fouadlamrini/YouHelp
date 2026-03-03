import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiUserCheck,
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

const isSuperAdmin = (user) => {
  const roleName = user?.role?.name ?? user?.role;
  return roleName === "super_admin";
};

/* ------------------ Sidebar Component ------------------ */
const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const { user } = useAuth();
  const showSuperAdmin = isSuperAdmin(user);

  return (
    <div
      className={`relative h-screen bg-white border-r border-slate-100 transition-all duration-300 flex flex-col
        ${isOpen ? "w-72" : "w-24"}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 w-7 h-7 bg-white border border-slate-100 rounded-full
        flex items-center justify-center text-indigo-600 shadow-sm hover:shadow-md z-50"
      >
        {isOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
      </button>

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

      <div className="flex-grow px-3 overflow-y-auto overflow-x-hidden">
        <NavItem icon={FiGrid} label="Categories" to="/categories" isOpen={isOpen} />
        <NavItem icon={FiBarChart2} label="Statistiques" to="/statistics" isOpen={isOpen} />

        {showSuperAdmin && (
          <>
            <div className="my-4 border-t border-slate-50" />
            <span className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Super Admin
            </span>
            <NavItem icon={FiMapPin} label="Campus" to="/admin/campus" isOpen={isOpen} />
            <NavItem icon={FiLayers} label="Level" to="/admin/level" isOpen={isOpen} />
            <NavItem icon={FiBook} label="Class" to="/admin/class" isOpen={isOpen} />
            <NavItem icon={FiUsers} label="Create User" to="/users" isOpen={isOpen} />
          </>
        )}

        <div className="my-4 border-t border-slate-50" />
        <NavItem icon={FiUserCheck} label="Request Role" to="/role-request" isOpen={isOpen} />
        {!showSuperAdmin && (
          <NavItem icon={FiUsers} label="Users List" to="/users" isOpen={isOpen} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;