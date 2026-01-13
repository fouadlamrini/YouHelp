import React, { useState } from "react";
import { 
  FiCode, FiLayers, FiChevronRight, FiFileText, FiGlobe, FiX, FiZoomIn 
} from "react-icons/fi";

const KnowledgeCard = ({ data }) => {
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
        
        {/* 1. HEADER */}
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-slate-100 border border-white">
              <img 
                src={data.userAvatar || "https://i.pravatar.cc/150?u=fouad"} 
                className="w-full h-full object-cover" 
                alt="profile" 
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[15px] font-black text-slate-900 leading-none tracking-tight capitalize">
                  {data.userName || "fouad lamrini"}
                </h4>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg uppercase">
                  {data.category || "DEVELOPMENT"}
                </span>
                <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg uppercase">
                  {data.subCategory || "REACT.JS"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <span>{data.time || "22H"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  PUBLIC <FiGlobe size={10} className="text-blue-400" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MAIN CONTENT: Media + Code */}
        <div className="px-6 pb-4 flex flex-col md:flex-row gap-4">
          
          {/* Media Thumbnail with Zoom Feature */}
          <div 
            onClick={() => setIsImageOpen(true)}
            className="w-full md:w-48 h-40 flex-shrink-0 rounded-[1.5rem] overflow-hidden bg-slate-100 border border-slate-50 relative cursor-pointer group/img"
          >
            {data.mediaType === "image" ? (
              <>
                <img src={data.mediaUrl} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="thumb" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <FiZoomIn className="text-white" size={24} />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50/50 text-indigo-400">
                <FiFileText size={32} />
              </div>
            )}
          </div>

          {/* Code Snippet Block */}
          <div className="flex-grow min-w-0 max-w-md"> 
            <div className="relative h-40">
              <div className="absolute top-3 right-5 flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest z-10">
                <FiCode size={12} className="text-indigo-400" /> {data.subCategory || "JSX"}
              </div>
              <pre className="bg-[#0B1222] rounded-[1.8rem] p-6 pt-10 text-[12px] text-indigo-200 font-mono overflow-x-auto h-full custom-scrollbar shadow-2xl border border-slate-800/50">
                <code className="leading-relaxed">
                  {data.snippet || `async function Page() {\n  const data = await db.fetch();\n  return <div>{data}</div>\n}`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* 3. FOOTER */}
        <div className="px-8 py-5 bg-slate-50/30">
          <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
             "{data.content || "j'ai probleme au niveau de hooks dans react"}"
          </p>
          <div className="mt-4 flex justify-end">
            <button className="flex items-center gap-1 text-[11px] font-black text-indigo-600 uppercase tracking-tighter hover:gap-2 transition-all">
              Full Details <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* --- IMAGE MODAL (The Zoom View) --- */}
      {isImageOpen && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setIsImageOpen(false)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setIsImageOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl hover:scale-110 transition-all z-[1000]"
          >
            <FiX size={24} />
          </button>

          {/* Large Image */}
          <div className="relative max-w-5xl max-h-[85vh] overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white/10">
            <img 
              src={data.mediaUrl} 
              className="w-full h-full object-contain animate-in zoom-in-95 duration-300"
              alt="full-view"
              onClick={(e) => e.stopPropagation()} // Bach may-tseddch ila clikiti west tswira
            />
          </div>
        </div>
      )}
    </>
  );
};

export default KnowledgeCard;