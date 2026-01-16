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
  
  // States dyal Data o Interaction
  const [commentText, setCommentText] = useState("");
  const [solutionText, setSolutionText] = useState("");
  const [liked, setLiked] = useState(false); // <--- State dyal Favorite

  if (!post || !post.user) return null;

  const handleSendComment = () => {
    if (commentText.trim()) {
      setCommentText("");
    }
  };

  const handleAddSolution = () => {
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
            <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 relative group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic bg-indigo-50 px-2 py-0.5 rounded-md">
                  Solution Validée
                </span>
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
                {post.solution || "Aucune description détaillée n'a encore été ajoutée."}
              </p>
            </div>

            {isAdding ? (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <textarea 
                  autoFocus
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="Expliquez votre solution..."
                  className="w-full bg-slate-50 border-2 border-indigo-100 rounded-[1.5rem] p-5 text-sm outline-none min-h-[120px]"
                />
                <div className="flex gap-2">
                  <button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-slate-100 rounded-2xl font-black text-[10px] uppercase">Annuler</button>
                  <button onClick={handleAddSolution} className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-200">Enregistrer</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsAdding(true)} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 flex items-center justify-center gap-3 font-black text-[10px] uppercase">
                <FiPlus size={16} /> Ajouter la solution
              </button>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
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
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase">
                    <FiCheckCircle size={10} className="fill-emerald-100" /> Solved
                  </div>
                  <button onClick={() => setShowSolutionSection(true)} className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/50">Voir Detail</button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[9px] font-black uppercase">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> Not Solved
                </div>
              )}
            </div>
            <div className="flex gap-1.5 mt-2 text-[9px] font-black uppercase text-slate-500">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg">{post.category}</span>
              <span className="px-2 py-0.5 bg-slate-50 rounded-lg">{post.subCategory}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase group">
            <FiTool size={14} className="group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">Workshop</span>
          </button>
          <div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><FiMoreHorizontal size={22}/></button>
            {showOptions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)}></div>
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-bold"><FiEdit3 className="text-indigo-500" /> Update Post</button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold border-t border-slate-50"><FiTrash2 /> Delete Post</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-4 text-right">
        <p className="text-slate-700 leading-relaxed font-medium">{post.content}</p>
      </div>

      {post.image && (
        <div className="w-full aspect-video bg-slate-900 border-y border-slate-50 overflow-hidden">
          <img src={post.image} className="w-full h-full object-cover opacity-90" alt="post" />
        </div>
      )}

      {/* --- INTERACTION BAR --- */}
      <div className="p-2 grid grid-cols-4 gap-1 border-t border-slate-50 bg-white">
        {/* FAVORITE BUTTON M-UPDATE */}
        <button 
          onClick={() => setLiked(!liked)} 
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl transition-all font-black text-[10px] sm:text-xs
            ${liked ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'}`}
        >
          <FiHeart 
            size={18} 
            className={`transition-all duration-300 ${liked ? 'fill-rose-600 scale-110 text-rose-600' : ''}`} 
          /> 
          Favorite
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

      {showComments && (
        <div className="bg-slate-50/40 border-t border-slate-100 py-4 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-4 px-6">
            {post.comments?.length > 0 ? (
              post.comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
            ) : (
              <div className="text-center py-4 text-[10px] text-slate-400 font-bold uppercase">No comments yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;