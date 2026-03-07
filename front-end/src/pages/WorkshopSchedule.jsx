import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FiCheck, FiX, FiExternalLink, FiClock, FiCalendar, FiEye, FiEdit3 } from "react-icons/fi";
import { workshopsApi } from "../services/api";

const API_BASE = "http://localhost:3000";
const resolveAvatar = (src) => {
  if (!src) return `${API_BASE}/avatars/default-avatar.jpg`;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return `${API_BASE}${src}`;
  return `${API_BASE}/avatars/${src}`;
};

const WorkshopSchedule = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProgramPanel, setShowProgramPanel] = useState(false);
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState({ date: "", time: "", customSubject: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadPending = () => {
    workshopsApi
      .pendingForFormateur()
      .then((r) => setRequests(r.data?.data ?? []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleViewDetail = (req) => {
    setSelectedRequest(req);
    setShowDetailModal(true);
  };

  const handleOpenProgrammer = (req) => {
    setSelectedRequest(req);
    setScheduleData({ date: "", time: "", customSubject: "", description: "" });
    setShowProgramPanel(true);
  };

  const handleDateClick = (arg) => {
    setScheduleData((prev) => ({ ...prev, date: arg.dateStr }));
  };

  const handleAccept = async () => {
    if (!selectedRequest?._id || !scheduleData.customSubject?.trim()) {
      alert("Titre du workchop requis.");
      return;
    }
    setSubmitting(true);
    try {
      const dateTime = scheduleData.date && scheduleData.time
        ? `${scheduleData.date}T${scheduleData.time}:00`
        : undefined;
      await workshopsApi.acceptRequest(selectedRequest._id, {
        title: scheduleData.customSubject.trim(),
        description: scheduleData.description?.trim() || "",
        date: dateTime,
      });
      setEvents((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          title: scheduleData.customSubject.trim(),
          start: dateTime || new Date().toISOString(),
          backgroundColor: "#4f46e5",
          borderColor: "#4338ca",
          textColor: "#ffffff",
        },
      ]);
      setRequests((prev) => prev.filter((r) => r._id !== selectedRequest._id));
      setShowProgramPanel(false);
      setSelectedRequest(null);
      setScheduleData({ date: "", time: "", customSubject: "", description: "" });
    } catch (e) {
      alert(e.response?.data?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (req) => {
    if (!req?._id) return;
    if (!confirm("Refuser cette demande ?")) return;
    try {
      await workshopsApi.rejectRequest(req._id);
      setRequests((prev) => prev.filter((r) => r._id !== req._id));
      setShowDetailModal(false);
      setShowProgramPanel(false);
      setSelectedRequest(null);
    } catch (e) {
      alert(e.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            
            {/* --- 1. CALENDRIER --- */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Planning Workshops</h2>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
                events={events}
                dateClick={handleDateClick}
                height="600px"
                locale="fr"
                displayEventTime={true}
                eventContent={(info) => (
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm w-full border-l-4 border-indigo-900 overflow-hidden">
                    <div className="text-[9px] font-black opacity-80">{info.timeText}</div>
                    <div className="text-[10px] font-bold truncate">{info.event.title}</div>
                  </div>
                )}
              />
            </div>

            {/* --- 2. SIDEBAR ACTIONS --- */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Demandes d'étudiants</h3>
                {loading ? (
                  <p className="text-slate-500 text-sm">Chargement...</p>
                ) : (
                  <div className="space-y-3">
                    {requests.length === 0 ? (
                      <p className="text-slate-500 text-sm">Aucune demande en attente.</p>
                    ) : (
                      requests.map((req) => (
                        <div key={req._id} className="p-4 rounded-2xl bg-slate-50 border border-transparent flex items-center justify-between group">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={resolveAvatar(req.user?.profilePicture)} className="w-10 h-10 rounded-xl object-cover shrink-0" alt="" />
                            <p className="text-[11px] font-black text-slate-800 truncate">{req.user?.name || req.user?.email || "Étudiant"}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleViewDetail(req)} className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-all" title="Voir détail">
                              <FiEye size={14} />
                            </button>
                            <button onClick={() => handleOpenProgrammer(req)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                              Accepter
                            </button>
                            <button onClick={() => handleReject(req)} className="px-3 py-2 bg-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-200 transition-all">
                              Refuser
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* PROGRAMMING PANEL */}
              {showProgramPanel && selectedRequest && (
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-5 animate-in slide-in-from-right-5 duration-300">
                   <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase text-indigo-400 tracking-widest">Programmer</h3>
                      <button onClick={() => setShowProgramPanel(false)}><FiX size={20}/></button>
                   </div>

                      <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2 flex items-center gap-2"><FiEdit3 className="text-indigo-400"/> Titre du Workshop *</label>
                        <input
                          type="text"
                          value={scheduleData.customSubject}
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-indigo-500 transition-all"
                          onChange={(e) => setScheduleData((s) => ({ ...s, customSubject: e.target.value }))}
                          placeholder="Ex: Introduction à React"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Description</label>
                        <textarea
                          value={scheduleData.description}
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-indigo-500 transition-all resize-none"
                          onChange={(e) => setScheduleData((s) => ({ ...s, description: e.target.value }))}
                          placeholder="Description du workchop..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[8px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><FiCalendar/> Date</p>
                          <p className="text-[10px] font-black text-indigo-300 tracking-tight">{scheduleData.date || "Clicker calendrier"}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[8px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1"><FiClock/> Heure</p>
                          <input 
                            type="time" 
                            className="bg-transparent outline-none text-[10px] font-black w-full text-white" 
                            onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button onClick={handleAccept} disabled={submitting || !scheduleData.customSubject?.trim()} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95">
                          <FiCheck size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">{submitting ? "Envoi..." : "Valider"}</span>
                        </button>
                        <button onClick={() => setShowProgramPanel(false)} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-rose-500 hover:bg-rose-500/20 transition-all">
                          <FiX size={18} />
                        </button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* --- MODAL DETAILS --- */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl text-left">
            <div className="flex justify-between items-start mb-8 border-b pb-6">
              <div className="flex items-center gap-4">
                <img src={resolveAvatar(selectedRequest.user?.profilePicture)} className="w-14 h-14 rounded-2xl shadow-lg object-cover" alt="" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedRequest.user?.name || selectedRequest.user?.email || "Étudiant"}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Demande workchop</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 bg-slate-50 rounded-xl hover:text-rose-500 transition-colors">
                <FiX size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{selectedRequest.post?.content || "—"}</p>
              </div>
              <a href={`/posts?post=${selectedRequest.post?._id}`} className="flex items-center justify-center gap-3 w-full py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                <FiExternalLink size={16} /> Voir le post
              </a>
              <div className="flex gap-3">
                <button onClick={() => { setShowDetailModal(false); handleOpenProgrammer(selectedRequest); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase">
                  Accepter & programmer
                </button>
                <button onClick={() => handleReject(selectedRequest)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-2xl text-xs font-black uppercase hover:bg-rose-200">
                  Refuser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopSchedule;