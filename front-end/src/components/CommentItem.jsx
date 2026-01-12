import React, { useState } from "react";
import { FiMoreHorizontal, FiSmile, FiImage } from "react-icons/fi";

const CommentItem = ({ comment }) => {
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="flex gap-3 px-6">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-100">
          <img src={comment.avatar} alt="user" className="w-full h-full object-cover" />
        </div>

        {/* Comment Bubble */}
        <div className="flex-grow max-w-[90%]">
          <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100 relative">
            <div className="flex justify-between items-start">
              <div className="mb-1">
                <p className="text-xs font-black text-slate-900 leading-none">
                  {comment.userName} • <span className="text-indigo-600 font-bold uppercase text-[9px]">1st</span>
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{comment.userRole}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{comment.time}</span>
            </div>
            <p className="text-sm text-slate-700 font-medium mt-1 leading-relaxed text-right">
              {comment.text}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-1.5 ml-2">
            <button className="text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors">Like</button>
            <span className="text-slate-200 text-[11px]">|</span>
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className={`text-[11px] font-black transition-colors ${isReplying ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Reply Input Section */}
      {isReplying && (
        <div className="ml-14 pr-6 animate-in slide-in-from-left-2 duration-300">
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
               <img src="https://i.pravatar.cc/100?u=me" alt="me" />
            </div>
            <div className="flex-grow relative">
              <input 
                autoFocus
                type="text" 
                placeholder="Add a reply..." 
                className="w-full bg-white border border-slate-200 rounded-full py-2 px-4 pr-16 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 text-slate-400">
                <FiSmile size={14} className="hover:text-amber-500 cursor-pointer" />
                <FiImage size={14} className="hover:text-indigo-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;