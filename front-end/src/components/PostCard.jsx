import React, { useState } from "react";
import { 
  FiHeart, FiMessageCircle, FiHelpCircle, FiShare2, 
  FiMoreHorizontal, FiChevronDown, FiSmile, FiImage, FiCheckCircle 
} from "react-icons/fi";
import CommentItem from "./CommentItem";

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);

  // Check if post data exists
  if (!post || !post.user) return null;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
            <img src={post.user.avatar} alt="avatar" className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-slate-900 leading-none">{post.user.name}</p>
              
              {/* --- TICKET STATUS --- */}
              {post.isSolved ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full shadow-sm">
                  <FiCheckCircle size={10} className="fill-emerald-100" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Solved</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full shadow-sm">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-wider">Not Solved</span>
                </div>
              )}

              {/* Tags Section */}
              <div className="flex gap-1.5 ml-1">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100 uppercase tracking-tighter">
                  {post.category}
                </span>
                <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg border border-slate-100 uppercase tracking-tighter">
                  {post.subCategory}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
              {post.time} • Public 🌍
            </p>
          </div>
        </div>

        <button className="text-slate-300 hover:text-slate-600 transition-colors">
          <FiMoreHorizontal size={20}/>
        </button>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-4 text-right">
        <p className="text-slate-700 leading-relaxed font-medium">
          {post.content}
        </p>
      </div>

      {/* Media Content (Image/Video) */}
      {post.image && (
        <div className="w-full aspect-video bg-slate-900 relative group overflow-hidden cursor-pointer border-y border-slate-50">
          <img 
            src={post.image} 
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
            alt="post" 
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 text-white shadow-2xl">
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      )}

      {/* Interaction Buttons Grid */}
      <div className="p-2 grid grid-cols-4 gap-1 border-t border-slate-50 bg-white">
        <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 group">
          <FiHeart className="group-hover:fill-red-500 transition-colors" size={18} />
          <span className="text-[10px] sm:text-xs font-black">Favorite</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
            showComments 
              ? 'bg-indigo-50 text-indigo-600 font-bold' 
              : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          <FiMessageCircle size={18} />
          <span className="text-[10px] sm:text-xs font-black">Commenter</span>
        </button>

        <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 transition-all hover:bg-amber-50 hover:text-amber-600 group">
          <FiHelpCircle size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] sm:text-xs font-black whitespace-nowrap text-center">
            Même problème?
          </span>
        </button>

        <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 transition-all hover:bg-emerald-50 hover:text-emerald-600">
          <FiShare2 size={18} />
          <span className="text-[10px] sm:text-xs font-black">Partager</span>
        </button>
      </div>

      {/* Comment Section (Slide Down Animation) */}
      {showComments && (
        <div className="bg-slate-50/40 border-t border-slate-100 py-4 animate-in slide-in-from-top-4 duration-500 ease-out">
          {/* New Comment Input */}
          <div className="flex gap-3 items-center px-6 mb-6">
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shadow-sm">
              <img src="https://i.pravatar.cc/100?u=me" alt="me" />
            </div>
            <div className="flex-grow relative flex items-center">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="w-full bg-white border border-slate-200 rounded-full py-2.5 px-5 pr-20 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
              />
              <div className="absolute right-4 flex gap-2.5 text-slate-400">
                <FiSmile size={20} className="hover:text-amber-500 cursor-pointer transition-colors" />
                <FiImage size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="text-center py-6 px-4">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-white/50 inline-block px-4 py-1 rounded-full border border-slate-100">
                  No comments yet. Be the first!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;