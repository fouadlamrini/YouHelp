import React, { useState } from "react";
import { 
  FiHeart, FiMessageCircle, FiHelpCircle, FiShare2, 
  FiMoreHorizontal, FiSmile, FiImage, FiCheckCircle, 
  FiSend, FiTool, FiEdit3, FiTrash2, FiExternalLink 
} from "react-icons/fi";
import CommentItem from "./CommentItem";

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState("");

  if (!post || !post.user) return null;

  const handleSendComment = () => {
    if (commentText.trim()) {
      console.log("Comment sent:", commentText);
      setCommentText("");
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
      
      {/* 1. HEADER */}
      <div className="p-6 flex items-start justify-between relative">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
            <img src={post.user.avatar} alt="avatar" className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-slate-900 leading-none">{post.user.name}</p>
              
              {/* Status Badge + Voir Detail */}
              {post.isSolved ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full shadow-sm">
                    <FiCheckCircle size={10} className="fill-emerald-100" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Solved</span>
                  </div>
                  
                  {/* Button ghadi i-ban ghir ila kan solved */}
                  <button 
                    onClick={() => console.log("Voir détails de la solution")}
                    className="flex items-center gap-1 text-[9px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/50"
                  >
                    Voir Detail <FiExternalLink size={8} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full shadow-sm">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-wider">Not Solved</span>
                </div>
              )}
            </div>

            {/* Category & Subcategory */}
            <div className="flex gap-1.5 mt-2">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100 uppercase">
                {post.category}
              </span>
              <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg border border-slate-100 uppercase">
                {post.subCategory}
              </span>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase italic">
              {post.time} • Public 🌍
            </p>
          </div>
        </div>

        {/* TOP ACTIONS: Workshop + Menu */}
        <div className="flex items-center gap-2 relative">
          {/* Button Workshop - User ki-klik 3lih bach i-qdem mosa3ada */}
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95 group"
            onClick={() => console.log("Demande workshop sent")}
          >
            <FiTool size={14} className="group-hover:rotate-45 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tight hidden sm:inline">Demande Workshop</span>
            <span className="text-[10px] font-black uppercase tracking-tight sm:hidden">Workshop</span>
          </button>

          {/* 3 DOTS MENU (Update/Delete) */}
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <FiMoreHorizontal size={22}/>
            </button>

            {showOptions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)}></div>
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-bold">
                    <FiEdit3 className="text-indigo-500" /> Update Post
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold border-t border-slate-50">
                    <FiTrash2 /> Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. CONTENT TEXT */}
      <div className="px-6 pb-4 text-right">
        <p className="text-slate-700 leading-relaxed font-medium">
          {post.content}
        </p>
      </div>

      {/* 3. MEDIA (IMAGE) */}
      {post.image && (
        <div className="w-full aspect-video bg-slate-900 relative group overflow-hidden cursor-pointer border-y border-slate-50">
          <img 
            src={post.image} 
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
            alt="post" 
          />
        </div>
      )}

      {/* 4. INTERACTION BAR */}
      <div className="p-2 grid grid-cols-4 gap-1 border-t border-slate-50 bg-white">
        <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 group">
          <FiHeart className="group-hover:fill-red-500 transition-colors" size={18} />
          <span className="text-[10px] sm:text-xs font-black">Favorite</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
            showComments ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          <FiMessageCircle size={18} />
          <span className="text-[10px] sm:text-xs font-black">Commenter</span>
        </button>

        <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 transition-all hover:bg-amber-50 hover:text-amber-600 group">
          <FiHelpCircle size={18} />
          <span className="text-[10px] sm:text-xs font-black">Même prob</span>
        </button>

        <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 transition-all hover:bg-emerald-50 hover:text-emerald-600">
          <FiShare2 size={18} />
          <span className="text-[10px] sm:text-xs font-black">Partager</span>
        </button>
      </div>

      {/* 5. COMMENT SECTION */}
      {showComments && (
        <div className="bg-slate-50/40 border-t border-slate-100 py-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex gap-3 items-center px-6 mb-6">
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
              <img src="https://i.pravatar.cc/100?u=me" alt="me" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-grow relative flex items-center group">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder="Add a comment..." 
                className="w-full bg-white border border-slate-200 rounded-full py-2.5 px-5 pr-28 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all shadow-sm"
              />
              
              <div className="absolute right-2 flex items-center gap-1.5">
                <FiSmile size={18} className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors" />
                <FiImage size={18} className="text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" />
                <button 
                  onClick={handleSendComment}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    commentText.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <FiSend size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="text-center py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                No comments yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;