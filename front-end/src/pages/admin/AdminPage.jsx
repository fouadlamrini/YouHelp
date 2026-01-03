import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function AdminPage() {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="mb-6">Welcome, {user?.name}</p>
        {/* Ici on affiche les pages selon route */}
        <Outlet />
      </div>
    </div>
  );
}
