import React from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { 
  FiUsers, FiUserCheck, FiAlertCircle, 
  FiCheckCircle, FiHelpCircle, FiTrendingUp 
} from "react-icons/fi";

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Stats = () => {
  // Data fictive (Données à lier avec ton Backend plus tard)
  const statsData = {
    pendingRequests: 14,
    totalStudents: 520,
    reclamations: 6,
    notSolvedPosts: 32,
    solvedPosts: 184,
  };

  // 1. Chart Solved vs Not Solved (Pie)
  const pieData = {
    labels: ["Résolus", "Non Résolus"],
    datasets: [
      {
        data: [statsData.solvedPosts, statsData.notSolvedPosts],
        backgroundColor: ["#10b981", "#f43f5e"],
        hoverOffset: 20,
        borderWidth: 0,
      },
    ],
  };

  // 2. Chart Demandes vs Réclamations (Bar)
  const barData = {
    labels: ["Demandes Adhésion", "Réclamations"],
    datasets: [
      {
        label: "Total",
        data: [statsData.pendingRequests, statsData.reclamations],
        backgroundColor: ["#6366f1", "#f59e0b"],
        borderRadius: 15,
        barThickness: 40,
      },
    ],
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
          <Icon size={22} />
        </div>
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
          <FiTrendingUp /> {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* 1. Sidebar Admin */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Navbar */}
        <NavbarLoggedIn />

        {/* 3. Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Header dyal l-page */}
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Tableau de Bord Admin</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Statistiques globales de YouHelp</p>
            </div>

            {/* --- TOP CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <StatCard title="Demandes" value={statsData.pendingRequests} icon={FiUsers} color="bg-indigo-600" trend="+12%" />
              <StatCard title="Étudiants" value={statsData.totalStudents} icon={FiUserCheck} color="bg-blue-500" trend="+5%" />
              <StatCard title="Réclamations" value={statsData.reclamations} icon={FiAlertCircle} color="bg-amber-500" trend="-2%" />
              <StatCard title="Non Résolus" value={statsData.notSolvedPosts} icon={FiHelpCircle} color="bg-rose-500" trend="+8%" />
              <StatCard title="Résolus" value={statsData.solvedPosts} icon={FiCheckCircle} color="bg-emerald-500" trend="+24%" />
            </div>

            {/* --- CHARTS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-10">
              
              {/* Box Chart 1 */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="mb-8">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Efficacité de la Communauté</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Répartition des problèmes résolus vs non résolus</p>
                </div>
                <div className="h-[300px] flex justify-center">
                   <Pie data={pieData} options={{ 
                     maintainAspectRatio: false, 
                     plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: 'bold', size: 10 } } } } 
                   }} />
                </div>
              </div>

              {/* Box Chart 2 */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="mb-8">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Flux Administratif</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Comparaison entre nouvelles demandes et incidents</p>
                </div>
                <div className="h-[300px]">
                  <Bar data={barData} options={{ 
                    maintainAspectRatio: false, 
                    scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } },
                    plugins: { legend: { display: false } } 
                  }} />
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Stats;