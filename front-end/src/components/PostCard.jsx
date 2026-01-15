import React, { useState } from "react";
import { 
  FiHeart, FiMessageCircle, FiHelpCircle, FiShare2, 
  FiMoreHorizontal, FiSmile, FiImage, FiCheckCircle, 
  FiSend, FiTool, FiEdit3, FiTrash2, FiExternalLink, FiX, FiPlus 
} from "react-icons/fi";
import CommentItem from "./CommentItem";

const PostCard = ({ post }) => {
  // States dyal Visibility
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSolutionSection, setShowSolutionSection] = useState(false);
  const [showSolActions, setShowSolActions] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // States dyal Data
  const [commentText, setCommentText] = useState("");
  const [solutionText, setSolutionText] = useState("");

  if (!post || !post.user) return null;

  const handleSendComment = () => {
    if (commentText.trim()) {
      console.log("Comment sent:", commentText);
      setCommentText("");
    }
  };

  const handleAddSolution = () => {
    console.log("New solution:", solutionText);
    setIsAdding(false);
    setSolutionText("");
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md relative">
      
      {/* ==========================================
          SECTION SOLUTION (OVERLAY)
          ========================================== */}
      {showSolutionSection && (
        <div className="absolute inset-0 z-30 bg-white/98 backdrop-blur-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-y-auto">
          {/* Header dyal Solution Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
                <FiCheckCircle size={20} />
              </div>
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">Espace Solution</h3>
            </div>
            <button 
              onClick={() => {
                setShowSolutionSection(false);
                setIsAdding(false);
              }}
              className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Box dyal Solution lli kayna deja */}
            <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 relative group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic bg-indigo-50 px-2 py-0.5 rounded-md">
                  Solution Validée
                </span>
                
                {/* 3 Points dyal Solution */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSolActions(!showSolActions)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-all"
                  >
                    <FiMoreHorizontal size={20} />
                  </button>
                  
                  {showSolActions && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSolActions(false)}></div>
                      <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in zoom-in-95 duration-200">
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                          <FiEdit3 className="text-indigo-500" /> Update Solution
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50">
                          <FiTrash2 /> Delete Solution
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                {post.solution || "Aucune description détaillée n'a encore été ajoutée pour ce problème."}
              </p>
            </div>

            {/* Input dyal Ajouter Solution */}
            {isAdding ? (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <textarea 
                  autoFocus
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="Expliquez comment vous avez résolu le problème..."
                  className="w-full bg-slate-50 border-2 border-indigo-100 rounded-[1.5rem] p-5 text-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none min-h-[120px] transition-all"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAddSolution}
                    className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                  >
                    Enregistrer la solution
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-wider group"
              >
                <div className="p-1 bg-slate-100 rounded-full group-hover:bg-indigo-100 transition-colors">
                  <FiPlus size={16} />
                </div>
                Ajouter la solution
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          HEADER ORIGINAL (User Info & Actions)
          ========================================== */}
      <div className="p-6 flex items-start justify-between relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
            <img src={post.user.avatar} alt="avatar" className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-slate-900 leading-none">{post.user.name}</p>
              
              {post.isSolved ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                    <FiCheckCircle size={10} className="fill-emerald-100" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Solved</span>
                  </div>
                  <button 
                    onClick={() => setShowSolutionSection(true)}
                    className="flex items-center gap-1 text-[9px] font-black text-indigo-600 hover:text-indigo-800 transition-all uppercase bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/50"
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

            <div className="flex gap-1.5 mt-2 text-[9px] font-black uppercase">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">{post.category}</span>
              <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">{post.subCategory}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95 group">
            <FiTool size={14} className="group-hover:rotate-45 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tight hidden sm:inline">Workshop</span>
          </button>

          <div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <FiMoreHorizontal size={22}/>
            </button>
            {showOptions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)}></div>
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-bold">
                    <FiEdit3 className="text-indigo-500" /> Update Post
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold border-t border-slate-50">
                    <FiTrash2 /> Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="px-6 pb-4 text-right">
        <p className="text-slate-700 leading-relaxed font-medium">{post.content}</p>
      </div>

      {/* --- MEDIA --- */}
      {post.image && (
        <div className="w-full aspect-video bg-slate-900 border-y border-slate-50 overflow-hidden">
          <img src={post.image} className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700" alt="post" />
        </div>
      )}

      {/* --- INTERACTION BAR --- */}
      <div className="p-2 grid grid-cols-4 gap-1 border-t border-slate-50 bg-white">
        <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all font-black text-[10px] sm:text-xs">
          <FiHeart size={18} /> Favorite
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-black text-[10px] sm:text-xs">
          <FiMessageCircle size={18} /> Commenter
        </button>
        <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all font-black text-[10px] sm:text-xs">
          <FiHelpCircle size={18} /> Même prob
        </button>
        <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-black text-[10px] sm:text-xs">
          <FiShare2 size={18} /> Partager
        </button>
      </div>

      {/* --- COMMENTS --- */}
      {showComments && (
        <div className="bg-slate-50/40 border-t border-slate-100 py-4 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-4 px-6">
            {post.comments?.length > 0 ? (
              post.comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
            ) : (
              <div className="text-center py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">No comments yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;