import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import HeaderProfile from "../components/HeaderProfile";
import { workshopsApi } from "../services/api";
import { FiTool, FiCalendar, FiClock } from "react-icons/fi";

const API_BASE = "http://localhost:3000";
const resolveAvatar = (src) => {
  if (!src) return `${API_BASE}/avatars/default-avatar.jpg`;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return `${API_BASE}${src}`;
  return `${API_BASE}/avatars/${src}`;
};

const MyWorkshops = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workshopsApi
      .myWorkshops()
      .then((r) => setList(r.data?.data ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <HeaderProfile />
          <main className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
              <FiTool className="text-violet-600" size={28} />
              Mes workchops
            </h1>
            {loading ? (
              <p className="text-slate-500">Chargement...</p>
            ) : list.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <p className="text-slate-500 font-medium">Aucun workchop accepté pour le moment.</p>
                <p className="text-sm text-slate-400 mt-2">Quand un formateur acceptera votre demande, il apparaîtra ici.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {list.map((item) => {
                  const w = item.workshop;
                  if (!w) return null;
                  const dateStr = w.date ? new Date(w.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null;
                  const timeStr = w.date ? new Date(w.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null;
                  return (
                    <div key={item._id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-black text-slate-900 text-lg">{w.title}</h3>
                          {w.description && <p className="text-slate-600 text-sm mt-2">{w.description}</p>}
                          <div className="flex flex-wrap gap-4 mt-4 text-slate-500 text-xs font-bold">
                            {dateStr && (
                              <span className="flex items-center gap-1.5">
                                <FiCalendar size={14} /> {dateStr}
                              </span>
                            )}
                            {timeStr && (
                              <span className="flex items-center gap-1.5">
                                <FiClock size={14} /> {timeStr}
                              </span>
                            )}
                            {w.createdBy?.name && (
                              <span>Formateur : {w.createdBy.name}</span>
                            )}
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase">Accepté</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyWorkshops;
