import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { 
  FiCheck, FiX, FiExternalLink, FiClock, 
  FiCalendar, FiEye, FiEdit3
} from "react-icons/fi";

const WorkshopSchedule = () => {
  // States
  const [selectedRequest, setSelectedRequest] = useState(null); // Bach n-charjiw l-data dyal l-user
  const [showDetailModal, setShowDetailModal] = useState(false); // Bach n-7ello l-modal dyal l-3in
  const [showProgramPanel, setShowProgramPanel] = useState(false); // Bach n-7ello l-panel dyal l-k7el

  const [events, setEvents] = useState([
    { 
      id: '1', 
      title: 'Formation React Redux', 
      start: '2026-01-20T14:30:00',
      backgroundColor: '#4f46e5',
      borderColor: '#4338ca'
    },
  ]);

  const [requests, setRequests] = useState([
    { 
      id: 1, 
      student: "Amine Rhazali", 
      postContent: "Salam, 3ndi mochkil f l-store dyal Redux, bghit chi workshop i-fhemna hadchi mzyan...",
      postLink: "/post/1", 
      avatar: "https://i.pravatar.cc/150?u=11" 
    }
  ]);

  const [scheduleData, setScheduleData] = useState({ 
    date: "", 
    time: "", 
    customSubject: "" 
  });

  // Handlers
  const handleViewDetail = (req) => {
    setSelectedRequest(req);
    setShowDetailModal(true);
  };

  const handleOpenProgrammer = (req) => {
    setSelectedRequest(req);
    setShowProgramPanel(true);
    
  };

  const handleDateClick = (arg) => {
    setScheduleData(prev => ({ ...prev, date: arg.dateStr }));
  };

  const handleAccept = () => {
    if (!scheduleData.date || !scheduleData.time || !scheduleData.customSubject) {
      alert("Kamal l-m3lomat: Sujet, Date (cliquer 3la calendrier) o Heure!");
      return;
    }

    const combinedStart = `${scheduleData.date}T${scheduleData.time}:00`;

    const newEvent = {
      id: String(Date.now()),
      title: scheduleData.customSubject,
      start: combinedStart,
      backgroundColor: '#4f46e5',
      borderColor: '#4338ca',
      textColor: '#ffffff'
    };

    setEvents([...events, newEvent]);
    setRequests(requests.filter(r => r.id !== selectedRequest.id));
    setShowProgramPanel(false);
    setSelectedRequest(null);
    setScheduleData({ date: "", time: "", customSubject: "" });
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
                <div className="space-y-3">
                  {requests.map(req => (
                    <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-transparent flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <img src={req.avatar} className="w-10 h-10 rounded-xl" alt="" />
                        <p className="text-[11px] font-black text-slate-800">{req.student}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetail(req)} 
                          className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          <FiEye size={14}/>
                        </button>
                        <button 
                          onClick={() => handleOpenProgrammer(req)} 
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                        >
                          Programmer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-2 flex items-center gap-2"><FiEdit3 className="text-indigo-400"/> Sujet du Workshop</label>
                        <input 
                          type="text" 
                          value={scheduleData.customSubject}
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-indigo-500 transition-all"
                          onChange={(e) => setScheduleData({...scheduleData, customSubject: e.target.value})}
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
                        <button onClick={handleAccept} className="flex-1 bg-emerald-500 hover:bg-emerald-600 p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95">
                          <FiCheck size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Valider</span>
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
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-start mb-8 border-b pb-6">
              <div className="flex items-center gap-4">
                <img src={selectedRequest.avatar} className="w-14 h-14 rounded-2xl shadow-lg object-cover" alt="" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedRequest.student}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Auteur du post</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 bg-slate-50 rounded-xl hover:text-rose-500 transition-colors">
                <FiX size={24}/>
              </button>
            </div>
            
            <div className="space-y-6">
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{selectedRequest.postContent}</p>
               </div>
               <a href={selectedRequest.postLink} className="flex items-center justify-center gap-3 w-full py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                 <FiExternalLink size={16} /> Allez au post complet
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopSchedule;