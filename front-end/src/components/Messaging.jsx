import React, { useState } from "react";
import { FiEdit, FiMoreHorizontal, FiChevronUp, FiChevronDown, FiSearch, FiSliders, FiX, FiVideo, FiPhone, FiMinus, FiSmile, FiImage, FiPaperclip } from "react-icons/fi";

const Messaging = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeChat, setActiveChat] = useState(null); // User li k-nhdro m3ah

  const contacts = [
    { id: 1, name: "Issam Mahtaj", lastMsg: "Allh irdi 3lik", time: "10:26 AM", avatar: "https://i.pravatar.cc/150?u=1", online: true },
    { id: 2, name: "Ibrahim CHEMLAL", lastMsg: "16 dhs li 9t3olk dak nhar", time: "Jul 30", avatar: "https://i.pravatar.cc/150?u=2", online: false },
    { id: 3, name: "Chaymae Bouyaoumad", lastMsg: "Thanks, fouad", time: "Jul 25", avatar: "https://i.pravatar.cc/150?u=3", online: true },
    { id: 4, name: "Fatima ezzahra", lastMsg: "Happy birthday", time: "Jul 22", avatar: "https://i.pravatar.cc/150?u=4", online: false },
  ];

  return (
    <div className="fixed bottom-0 right-8 flex items-end gap-4 z-[100] font-sans">
      
      {/* 1. MESSAGING LIST (Image 1 & 2) */}
      <div className={`w-80 bg-white shadow-2xl rounded-t-xl border border-slate-200 transition-all duration-300 ${isMinimized ? 'h-12' : 'h-[500px]'}`}>
        {/* Header (Image 2) */}
        <div 
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-3 flex items-center justify-between cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200">
              <img src="https://i.pravatar.cc/150?u=fouad" alt="me" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-sm font-black text-slate-800 tracking-tight">Messaging</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <FiMoreHorizontal size={18} className="hover:text-indigo-600" />
            <FiEdit size={16} className="hover:text-indigo-600" />
            {isMinimized ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          </div>
        </div>

        {/* List Content (Image 1) */}
        {!isMinimized && (
          <div className="flex flex-col h-[452px]">
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search messages" className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-8 text-xs focus:ring-2 focus:ring-indigo-500" />
                <FiSliders className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              </div>
              <div className="flex gap-4 mt-3 px-2 border-b border-slate-50">
                <button className="text-xs font-black text-emerald-700 border-b-2 border-emerald-700 pb-2">Focused</button>
                <button className="text-xs font-black text-slate-400 pb-2">Other</button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {contacts.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => setActiveChat(user)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50"
                >
                  <div className="relative flex-shrink-0">
                    <img src={user.avatar} className="w-12 h-12 rounded-full border border-slate-100" alt={user.name} />
                    {user.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-[13px] font-black text-slate-800 truncate">{user.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{user.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate font-medium">
                      {user.lastMsg}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. CHAT WINDOW (Image 3) */}
      {activeChat && (
        <div className="w-80 h-[450px] bg-white shadow-2xl rounded-t-xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Chat Header */}
          <div className="p-2.5 flex items-center justify-between border-b border-slate-100 bg-white rounded-t-xl">
            <div className="flex items-center gap-2">
               <img src={activeChat.avatar} className="w-8 h-8 rounded-full" alt="user" />
               <div>
                  <h4 className="text-xs font-black text-slate-800 leading-none">{activeChat.name}</h4>
                  <p className="text-[9px] text-emerald-500 font-bold mt-1">Active now</p>
               </div>
            </div>
            <div className="flex items-center gap-2 text-indigo-600">
              <FiPhone size={14} className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6" />
              <FiVideo size={14} className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6" />
              <FiMinus onClick={() => setActiveChat(null)} size={14} className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6" />
              <FiX onClick={() => setActiveChat(null)} size={14} className="cursor-pointer hover:bg-slate-100 p-1 rounded-md w-6 h-6" />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 bg-slate-50/50 overflow-y-auto custom-scrollbar flex flex-col gap-3">
             <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 max-w-[85%] shadow-sm">
                <p className="text-xs font-medium text-slate-700 leading-relaxed">Salam Fouad! Ki dayr m3a l-code?</p>
             </div>
             <div className="bg-indigo-600 p-3 rounded-2xl rounded-tr-none text-white max-w-[85%] self-end shadow-md">
                <p className="text-xs font-medium leading-relaxed italic">Hamdulilah, kolchi ghadi mzyan 🚀</p>
             </div>
          </div>

          {/* Input Area (Image 3 Bottom) */}
          <div className="p-3 bg-white border-t border-slate-100">
             <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-2">
                <input type="text" placeholder="Aa" className="flex-grow bg-transparent border-none focus:ring-0 text-xs py-1" />
                <div className="flex gap-2 text-indigo-500">
                   <FiSmile size={18} className="cursor-pointer" />
                   <FiImage size={18} className="cursor-pointer" />
                   <FiPaperclip size={18} className="cursor-pointer" />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messaging;