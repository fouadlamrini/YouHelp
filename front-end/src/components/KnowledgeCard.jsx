import React, { useState } from "react";
import {
  FiGlobe,
  FiX,
  FiZoomIn,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreHorizontal,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiPlay,
} from "react-icons/fi";
import CommentItem from "./CommentItem";

const KnowledgeCard = ({ data, isFavorite: isFavoriteProp = false, onFavoriteClick }) => {
  const [showComments, setShowComments] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isFavorite = onFavoriteClick ? isFavoriteProp : liked;
  const media = Array.isArray(data.media)
    ? data.media
    : data.mediaUrl
    ? [{ url: data.mediaUrl, type: "image" }]
    : [];
  const hasMedia = media.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  
  // State dyal l-Menu (Update/Delete)
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSendComment = () => {
    if (commentText.trim()) {
      setCommentText("");
    }
  };

  return (
    <>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md group flex flex-col font-sans">
        
        {/* HEADER */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-white">
              <img src={data.userAvatar} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[15px] font-black text-slate-900 leading-none">{data.userName}</h4>
                <div className="flex gap-1.5 items-center ml-1">
                  <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm shadow-indigo-100">
                    {data.category}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter border border-slate-200">
                    {data.subCategory}
                  </span>
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-bold mt-1.5 uppercase tracking-wider">
                {data.time} • PUBLIC <FiGlobe className="inline ml-1" size={10}/>
              </p>
            </div>
          </div>

          {/* DROPDOWN MENU (Update / Delete) */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className={`p-2 rounded-xl transition-all ${showDropdown ? 'bg-slate-100 text-indigo-600' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <FiMoreHorizontal size={20}/>
            </button>

            {showDropdown && (
              <>
                {/* Backdrop bach t-ssed menu ila cliquiti outdoor */}
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border-b border-slate-50 uppercase tracking-tight"
                    onClick={() => { console.log("Update"); setShowDropdown(false); }}
                  >
                    <FiEdit2 size={14} className="text-indigo-500" /> Update Knowlegde
                  </button>
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-tight"
                    onClick={() => { console.log("Delete"); setShowDropdown(false); }}
                  >
                    <FiTrash2 size={14} className="text-rose-500" /> Delete Knowlegde
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MEDIA + CONTENT */}
        <div className="px-6 pb-4 space-y-4">
          {hasMedia && (() => {
            const current = media[activeIndex] || media[0];
            if (!current) return null;

            const filename = current.url?.split("/").pop();

            return (
              <div className="space-y-3">
                <div
                  onClick={() => current.type === "image" && setIsImageOpen(true)}
                  className="w-full aspect-video rounded-[1.5rem] overflow-hidden bg-slate-100 relative cursor-pointer border border-slate-50 flex items-center justify-center"
                >
                  {current.type === "image" && (
                    <>
                      <img
                        src={current.url}
                        className="w-full h-full object-cover"
                        alt="knowledge-media"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiZoomIn className="text-white" size={24} />
                      </div>
                    </>
                  )}
                  {current.type === "video" && (
                    <video
                      src={current.url}
                      controls
                      className="w-full h-full object-contain bg-black"
                    />
                  )}
                  {current.type !== "image" && current.type !== "video" && (
                    <a
                      href={current.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center text-slate-700 hover:text-indigo-600"
                    >
                      <FiFileText size={32} className="mb-2" />
                      <span className="text-xs font-bold truncate max-w-[220px]">
                        {filename}
                      </span>
                    </a>
                  )}
                </div>

                {media.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {media.map((m, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={`w-16 h-12 rounded-xl overflow-hidden border ${
                          idx === activeIndex ? "border-indigo-500" : "border-slate-200"
                        } flex-shrink-0 bg-slate-100 flex items-center justify-center`}
                      >
                        {m.type === "image" ? (
                          <img
                            src={m.url}
                            className="w-full h-full object-cover"
                            alt={`thumb-${idx}`}
                          />
                        ) : m.type === "video" ? (
                          <FiPlay size={18} className="text-slate-700" />
                        ) : (
                          <FiFileText size={16} className="text-slate-700" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          <div className="text-slate-700 font-medium leading-relaxed">
            {data.content}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mx-6 mb-4 p-1 grid grid-cols-3 gap-1 bg-slate-50 rounded-2xl border border-slate-100">
          <button
            onClick={() => (onFavoriteClick ? onFavoriteClick() : setLiked(!liked))}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${isFavorite ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-rose-500"}`}
          >
            <FiHeart className={isFavorite ? "fill-rose-600" : ""} size={16} />
            <span className="text-[11px] font-black uppercase">Favorite</span>
          </button>
          
          <button onClick={() => setShowComments(!showComments)} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${showComments ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>
            <FiMessageCircle size={16} />
            <span className="text-[11px] font-black uppercase tracking-tight">Comment</span>
          </button>

          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-500 hover:text-emerald-500 transition-all">
            <FiShare2 size={16} />
            <span className="text-[11px] font-black uppercase tracking-tight">Share</span>
          </button>
        </div>

        {showComments && (
          <div className="bg-slate-50/40 border-t border-slate-100 py-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex gap-3 px-6 mb-6">
              <img src="https://i.pravatar.cc/100?u=me" className="w-9 h-9 rounded-full border border-slate-200" alt="me" />
              <div className="flex-grow relative flex items-center">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..." 
                  className="w-full bg-white border border-slate-200 rounded-full py-2 px-5 pr-20 text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                />
                <button onClick={handleSendComment} className="absolute right-2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                  <FiSend size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {data.comments?.map(comment => <CommentItem key={comment.id} comment={comment} />)}
            </div>
          </div>
        )}
      </div>

      {/* MODAL IMAGE (images only) */}
      {isImageOpen && hasMedia && media[activeIndex]?.type === "image" && (
        <div 
          className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4" 
          onClick={() => setIsImageOpen(false)}
        >
          <button className="absolute top-8 right-8 text-white hover:rotate-90 transition-transform">
            <FiX size={32} />
          </button>
          <img 
            src={media[activeIndex]?.url} 
            className="max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300" 
            alt="full" 
          />
        </div>
      )}
    </>
  );
};

export default KnowledgeCard;