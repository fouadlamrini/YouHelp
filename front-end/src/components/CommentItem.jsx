import React, { useState } from "react";
import { FiMoreHorizontal, FiSmile, FiImage, FiSend } from "react-icons/fi";

const CommentItem = ({ comment }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = () => {
    if (replyText.trim()) {
      console.log("Reply sent:", replyText);
      setReplyText("");
      setIsReplying(false); // Sedd l-input melli i-tsift
    }
  };

  return (
    <div className="mb-4 px-6 animate-in fade-in duration-500">
      <div className="flex gap-3">
        {/* Avatar */}
        <img 
          src={comment.avatar} 
          alt="user" 
          className="w-9 h-9 rounded-full border border-slate-200 object-cover flex-shrink-0" 
        />
        
        <div className="flex-grow">
          {/* Comment Bubble */}
          <div className="bg-white p-4 rounded-[1.3rem] rounded-tl-none border border-slate-100 shadow-sm relative group">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                  {comment.userName}
                </span>
                <p className="text-[10px] font-bold text-slate-400">{comment.userRole}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">{comment.time}</span>
                <button className="text-slate-300 hover:text-slate-600">
                  <FiMoreHorizontal size={14} />
                </button>
              </div>
            </div>
            
            {/* Text l-comment (text-right 7it l-content fih l-arabe/darija) */}
            <p className="text-sm text-slate-700 font-medium leading-relaxed mt-1 text-right">
              {comment.text}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-1.5 ml-2">
            <button className="text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors">
              Like
            </button>
            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
            <button 
              onClick={() => setIsReplying(!isReplying)} 
              className={`text-[11px] font-black transition-colors ${
                isReplying ? 'text-indigo-600 underline underline-offset-4' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              Reply
            </button>
          </div>

          {/* --- REPLY INPUT SECTION --- */}
          {isReplying && (
            <div className="mt-3 ml-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex gap-3 items-center bg-white p-2 rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-50/50">
                <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src="https://i.pravatar.cc/100?u=me" alt="me" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow relative flex items-center pr-2">
                  <input 
                    autoFocus
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Write a reply..." 
                    className="w-full bg-transparent py-1.5 px-1 text-xs outline-none text-slate-700 placeholder:text-slate-400"
                  />
                  
                  <div className="flex items-center gap-2 text-slate-400">
                    <FiSmile size={14} className="hover:text-amber-500 cursor-pointer transition-colors" />
                    <button 
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className={`transition-all ${
                        replyText.trim() ? 'text-indigo-600 scale-110' : 'text-slate-200'
                      }`}
                    >
                      <FiSend size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Cancel button sghir */}
              <button 
                onClick={() => setIsReplying(false)}
                className="text-[9px] font-bold text-slate-400 mt-1 ml-1 hover:text-red-400 uppercase tracking-tighter"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;