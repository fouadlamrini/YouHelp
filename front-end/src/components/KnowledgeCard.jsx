import React, { useState } from "react";
import { FiCode, FiGlobe, FiX, FiZoomIn, FiHeart, FiMessageCircle, FiShare2, FiSmile, FiImage, FiMoreHorizontal, FiSend } from "react-icons/fi";
import CommentItem from "./CommentItem";

const KnowledgeCard = ({ data }) => {
  const [showComments, setShowComments] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleSendComment = () => {
    if (commentText.trim()) {
      console.log("Sending:", commentText);
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
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-black text-slate-900 leading-none">{data.userName}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${data.isSolved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {data.isSolved ? "Solved" : "Not Solved"}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{data.time} • PUBLIC <FiGlobe className="inline" size={10}/></p>
            </div>
          </div>
          <button className="text-slate-300 hover:text-slate-600 transition-colors"><FiMoreHorizontal size={20}/></button>
        </div>

        {/* CONTENT */}
        <div className="px-6 pb-4 flex flex-col md:flex-row gap-4">
          <div onClick={() => setIsImageOpen(true)} className="w-full md:w-48 h-44 rounded-[1.5rem] overflow-hidden bg-slate-100 relative cursor-pointer group/img">
            <img src={data.mediaUrl} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="post" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><FiZoomIn className="text-white" size={24} /></div>
          </div>
          <div className="flex-grow min-w-0">
            <div className="relative h-44">
              <div className="absolute top-3 right-5 text-[10px] font-black text-slate-500 z-10 bg-black/40 px-2 py-1 rounded backdrop-blur-md uppercase tracking-tighter italic">
                <FiCode className="inline mr-1 text-indigo-400" /> {data.subCategory}
              </div>
              <pre className="bg-[#0B1222] rounded-[1.8rem] p-6 pt-10 text-[12px] text-indigo-200 font-mono h-full overflow-x-auto custom-scrollbar border border-slate-800/50">
                <code>{data.snippet}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="px-8 pb-6 italic text-slate-600 font-medium">"{data.content}"</div>

        {/* ACTIONS */}
        <div className="p-2 grid grid-cols-3 gap-1 border-t border-slate-50">
          <button onClick={() => setLiked(!liked)} className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${liked ? 'text-rose-600' : 'text-slate-500 hover:bg-rose-50'}`}>
            <FiHeart className={liked ? "fill-rose-600" : ""} size={18} />
            <span className="text-[12px] font-black uppercase">Favorite</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${showComments ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-indigo-50'}`}>
            <FiMessageCircle size={18} />
            <span className="text-[12px] font-black uppercase">Commenter</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-2xl text-slate-500 hover:bg-emerald-50"><FiShare2 size={18} /><span className="text-[12px] font-black uppercase">Partager</span></button>
        </div>

        {/* COMMENT SECTION */}
        {showComments && (
          <div className="bg-slate-50/40 border-t border-slate-100 py-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex gap-3 px-6 mb-6">
              <img src="https://i.pravatar.cc/100?u=me" className="w-9 h-9 rounded-full border border-slate-200" alt="me" />
              <div className="flex-grow relative flex items-center">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder="Add a comment..." 
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 px-5 pr-28 text-sm outline-none focus:ring-4 focus:ring-indigo-50"
                />
                <div className="absolute right-2 flex items-center gap-2">
                  <FiSmile className="text-slate-400 hover:text-amber-500 cursor-pointer" />
                  <button onClick={handleSendComment} className={`w-8 h-8 rounded-full flex items-center justify-center ${commentText.trim() ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <FiSend size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              {data.comments && data.comments.length > 0 ? (
                data.comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
              ) : (
                <div className="text-center py-4 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No comments yet.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL IMAGE */}
      {isImageOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsImageOpen(false)}>
          <button className="absolute top-8 right-8 text-white"><FiX size={32} /></button>
          <img src={data.mediaUrl} className="max-w-6xl max-h-[90vh] rounded-3xl" alt="full" />
        </div>
      )}
    </>
  );
};

export default KnowledgeCard;