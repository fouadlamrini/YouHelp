import React from "react";
import { 
  FiBookOpen, FiCode, FiLink, FiFolder, 
  FiLayers, FiChevronRight, FiPlayCircle 
} from "react-icons/fi";

const KnowledgeCard = ({ data }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
      
      {/* Header: Category & SubCategory */}
      <div className="p-6 pb-0 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase flex items-center gap-1.5">
            <FiFolder size={12} /> {data.category}
          </span>
          <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg uppercase flex items-center gap-1.5 border border-slate-100">
            <FiLayers size={12} /> {data.subCategory}
          </span>
        </div>
        <button className="text-slate-300 hover:text-indigo-600 transition-colors">
          <FiLink size={18} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Content Text */}
        <h2 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
          {data.title}
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
          {data.content}
        </p>

        {/* Media Section (Image/Video Placeholder) */}
        {data.mediaType === "image" && (
          <div className="rounded-2xl overflow-hidden border border-slate-100 aspect-video relative">
            <img src={data.mediaUrl} className="w-full h-full object-cover" alt="Knowledge" />
          </div>
        )}
        
        {data.mediaType === "video" && (
          <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video relative flex items-center justify-center group/vid cursor-pointer">
            <img src={data.videoThumbnail} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Video" />
            <FiPlayCircle size={50} className="text-white relative z-10 group-hover/vid:scale-110 transition-transform" />
          </div>
        )}

        {/* Snippet Code Area */}
        {data.snippet && (
          <div className="relative">
            <div className="absolute top-3 right-4 flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
              <FiCode size={12} /> {data.language || "code"}
            </div>
            <pre className="bg-slate-900 rounded-2xl p-5 pt-8 text-xs text-indigo-300 font-mono overflow-x-auto custom-scrollbar shadow-inner">
              <code>{data.snippet}</code>
            </pre>
          </div>
        )}

        {/* Resource Link */}
        {data.resource && (
          <a href={data.resource.link} target="_blank" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group/link border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
              <FiBookOpen size={18} />
            </div>
            <div className="flex-grow">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">External Resource</p>
              <p className="text-xs font-bold text-slate-700 truncate">{data.resource.name}</p>
            </div>
            <FiChevronRight className="text-slate-300 group-hover/link:translate-x-1 transition-transform" />
          </a>
        )}
      </div>
    </div>
  );
};

export default KnowledgeCard;