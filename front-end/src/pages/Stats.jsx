import React, { useState, useEffect } from "react";
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
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
  FiMapPin,
  FiBook,
  FiUsers,
  FiUserCheck,
  FiFileText,
  FiLayers,
  FiTrendingUp,
} from "react-icons/fi";
import { statsApi } from "../services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}
      >
        <Icon size={22} />
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const Stats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    statsApi
      .get()
      .then((r) => setData(r.data?.data ?? null))
      .catch((err) => {
        const msg = err.response?.data?.error || err.response?.data?.message || "Erreur";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarLoggedIn />
          <main className="flex-1 overflow-y-auto p-10 flex items-center justify-center">
            <p className="text-slate-500 font-bold">Chargement des statistiques...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarLoggedIn />
          <main className="flex-1 overflow-y-auto p-10 flex items-center justify-center">
            <div className="text-center max-w-lg">
              <p className="text-rose-600 font-bold">{error || "Aucune donnée"}</p>
              {error && (
                <p className="text-xs text-slate-500 mt-2">Vérifiez la console du serveur pour plus de détails.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const role = data.role || "";
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin";
  const isFormateur = role === "formateur";

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />
        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Tableau de bord
                {isSuperAdmin && " Super Admin"}
                {isAdmin && " Admin"}
                {isFormateur && " Formateur"}
              </h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">
                {isSuperAdmin && "Statistiques globales YouHelp"}
                {isAdmin && data.campusName && `Campus: ${data.campusName}`}
                {isFormateur && data.campusName && `Campus: ${data.campusName}`}
              </p>
            </div>

            {/* ——— SUPER ADMIN ——— */}
            {isSuperAdmin && (
              <>
                <section>
                  <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Vue d&apos;ensemble</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Campus" value={data.totalCampuses} icon={FiMapPin} color="bg-indigo-600" />
                    <StatCard title="Classes (total)" value={data.totalClasses} icon={FiBook} color="bg-blue-500" />
                    <StatCard title="Posts" value={data.totalPosts} icon={FiFileText} color="bg-emerald-500" />
                    <StatCard title="Knowledge" value={data.totalKnowledge} icon={FiLayers} color="bg-amber-500" />
                  </div>
                </section>
                <section>
                  <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Utilisateurs (total)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Admins" value={data.totalAdmins} icon={FiUsers} color="bg-rose-500" />
                    <StatCard title="Formateurs" value={data.totalFormateurs} icon={FiUsers} color="bg-violet-500" />
                    <StatCard title="Étudiants" value={data.totalEtudiants} icon={FiUserCheck} color="bg-teal-500" />
                  </div>
                </section>

                {/* Charts Super Admin */}
                <section>
                  <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Graphiques</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-black text-slate-600 uppercase mb-4">Posts vs Knowledge</h3>
                      <div className="h-[260px]">
                        <Pie
                          data={{
                            labels: ["Posts", "Knowledge"],
                            datasets: [
                              {
                                data: [data.totalPosts ?? 0, data.totalKnowledge ?? 0],
                                backgroundColor: ["#10b981", "#f59e0b"],
                                borderWidth: 0,
                              },
                            ],
                          }}
                          options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom" } },
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-black text-slate-600 uppercase mb-4">Répartition utilisateurs</h3>
                      <div className="h-[260px]">
                        <Pie
                          data={{
                            labels: ["Admins", "Formateurs", "Étudiants"],
                            datasets: [
                              {
                                data: [
                                  data.totalAdmins ?? 0,
                                  data.totalFormateurs ?? 0,
                                  data.totalEtudiants ?? 0,
                                ],
                                backgroundColor: ["#f43f5e", "#8b5cf6", "#14b8a6"],
                                borderWidth: 0,
                              },
                            ],
                          }}
                          options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom" } },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {data.classesByCampus && data.classesByCampus.length > 0 && (
                    <div className="mt-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-black text-slate-600 uppercase mb-4">Classes par campus</h3>
                      <div className="h-[280px]">
                        <Bar
                          data={{
                            labels: data.classesByCampus.map((r) => r.campusName),
                            datasets: [
                              {
                                label: "Classes",
                                data: data.classesByCampus.map((r) => r.count),
                                backgroundColor: "#6366f1",
                                borderRadius: 8,
                                barThickness: 36,
                              },
                            ],
                          }}
                          options={{
                            maintainAspectRatio: false,
                            scales: {
                              y: { beginAtZero: true, grid: { display: false } },
                              x: { grid: { display: false } },
                            },
                            plugins: { legend: { display: false } },
                          }}
                        />
                      </div>
                    </div>
                  )}
                </section>

                {data.classesByCampus && data.classesByCampus.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Classes par campus</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Campus</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Nombre de classes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.classesByCampus.map((row) => (
                            <tr key={row.campusId} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800">{row.campusName}</td>
                              <td className="px-4 py-3">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
                {data.adminsByCampus && data.adminsByCampus.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Admins par campus</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Campus</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.adminsByCampus.map((row) => (
                            <tr key={row.campusId} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800">{row.campusName}</td>
                              <td className="px-4 py-3">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
                {data.formateursByCampus && data.formateursByCampus.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Formateurs par campus</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Campus</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.formateursByCampus.map((row) => (
                            <tr key={row.campusId} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800">{row.campusName}</td>
                              <td className="px-4 py-3">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
                {data.etudiantsByCampus && data.etudiantsByCampus.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Étudiants par campus</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Campus</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.etudiantsByCampus.map((row) => (
                            <tr key={row.campusId} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800">{row.campusName}</td>
                              <td className="px-4 py-3">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
                {data.etudiantsByLevel && data.etudiantsByLevel.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Étudiants par level</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Level</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.etudiantsByLevel.map((row, i) => (
                            <tr key={i} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800">{row.levelName ?? "—"}</td>
                              <td className="px-4 py-3">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
                {data.etudiantsByYear && data.etudiantsByYear.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Étudiants par année (year)</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Année</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.etudiantsByYear.map((row, i) => (
                            <tr key={i} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800">{row._id ?? "—"}</td>
                              <td className="px-4 py-3">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ——— ADMIN ——— */}
            {(isAdmin || isFormateur) && (
              <>
                <section>
                  <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Mon campus</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isAdmin && (
                      <StatCard title="Admins (campus)" value={data.adminsInCampus ?? 0} icon={FiUsers} color="bg-rose-500" />
                    )}
                    <StatCard title="Classes" value={data.classesInCampus ?? 0} icon={FiBook} color="bg-blue-500" />
                    <StatCard title="Formateurs" value={data.formateursInCampus ?? 0} icon={FiUsers} color="bg-violet-500" />
                    <StatCard title="Étudiants" value={data.etudiantsInCampus ?? 0} icon={FiUserCheck} color="bg-teal-500" />
                    <StatCard title="Posts" value={data.postsInCampus ?? 0} icon={FiFileText} color="bg-emerald-500" />
                    <StatCard title="Knowledge" value={data.knowledgeInCampus ?? 0} icon={FiLayers} color="bg-amber-500" />
                  </div>
                </section>

                {/* Charts Admin / Formateur */}
                <section>
                  <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Graphiques</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-black text-slate-600 uppercase mb-4">Posts vs Knowledge (campus)</h3>
                      <div className="h-[220px]">
                        <Pie
                          data={{
                            labels: ["Posts", "Knowledge"],
                            datasets: [
                              {
                                data: [data.postsInCampus ?? 0, data.knowledgeInCampus ?? 0],
                                backgroundColor: ["#10b981", "#f59e0b"],
                                borderWidth: 0,
                              },
                            ],
                          }}
                          options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom" } },
                          }}
                        />
                      </div>
                    </div>
                    {data.etudiantsByLevel && data.etudiantsByLevel.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <h3 className="text-xs font-black text-slate-600 uppercase mb-4">Étudiants par level</h3>
                          <div className="h-[260px]">
                            <Bar
                              data={{
                                labels: data.etudiantsByLevel.map((r) => r.levelName ?? "—"),
                                datasets: [
                                  {
                                    label: "Étudiants",
                                    data: data.etudiantsByLevel.map((r) => r.count),
                                    backgroundColor: "#14b8a6",
                                    borderRadius: 8,
                                    barThickness: 36,
                                  },
                                ],
                              }}
                              options={{
                                maintainAspectRatio: false,
                                scales: {
                                  y: { beginAtZero: true, grid: { display: false } },
                                  x: { grid: { display: false } },
                                },
                                plugins: { legend: { display: false } },
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {data.etudiantsByYear && data.etudiantsByYear.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <h3 className="text-xs font-black text-slate-600 uppercase mb-4">Étudiants par année</h3>
                          <div className="h-[260px]">
                            <Bar
                              data={{
                                labels: data.etudiantsByYear.map((r) => String(r._id ?? "—")),
                                datasets: [
                                  {
                                    label: "Étudiants",
                                    data: data.etudiantsByYear.map((r) => r.count),
                                    backgroundColor: "#6366f1",
                                    borderRadius: 8,
                                    barThickness: 36,
                                  },
                                ],
                              }}
                              options={{
                                maintainAspectRatio: false,
                                scales: {
                                  y: { beginAtZero: true, grid: { display: false } },
                                  x: { grid: { display: false } },
                                },
                                plugins: { legend: { display: false } },
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                {data.etudiantsByLevel && data.etudiantsByLevel.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Étudiants par level (campus)</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Level</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.etudiantsByLevel.map((row, i) => (
                            <tr key={i} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800">{row.levelName ?? "—"}</td>
                              <td className="px-4 py-3">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
                {data.etudiantsByYear && data.etudiantsByYear.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black text-slate-700 uppercase mb-4">Étudiants par année (campus)</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Année</th>
                            <th className="px-4 py-3 font-black text-slate-500 uppercase">Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.etudiantsByYear.map((row, i) => (
                            <tr key={i} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800">{row._id ?? "—"}</td>
                              <td className="px-4 py-3">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Stats;
