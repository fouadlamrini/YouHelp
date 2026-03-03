import React, { useState, useEffect } from "react";
import {
  FiHeart, FiMessageCircle, FiHelpCircle, FiShare2,
  FiMoreHorizontal, FiCheckCircle, FiSend, FiTool, FiEdit3, FiTrash2, FiX, FiPlus,
} from "react-icons/fi";
import CommentItem from "./CommentItem";
import { postApi, commentApi, solutionApi } from "../services/api";

const API_BASE = "http://localhost:3000";

const normalizePost = (post) => {
  if (!post) return null;
  const author = post.author || post.user;
  const cat = post.category?.name || post.category;
  const sub = post.subCategory?.name || post.subCategory;
  const media = (post.media || []).map((m) => {
    const url = m.url?.startsWith("http") ? m.url : `${API_BASE}${m.url}`;
    return { ...m, url };
  });
  const firstImage =
    media.find((m) => m.type === "image")?.url ||
    media[0]?.url ||
    post.image;
  return {
    ...post,
    user: author
      ? {
          name: author.name || author.email,
          avatar: author.profilePicture
            ? (author.profilePicture.startsWith("http")
                ? author.profilePicture
                : `${API_BASE}${author.profilePicture}`)
            : null,
          email: author.email,
        }
      : { name: "?", avatar: null },
    category: cat,
    subCategory: sub,
    image: firstImage,
    media,
    id: post._id || post.id,
  };
};

const PostCard = ({ post: rawPost, readOnly = false, onRefresh }) => {
  const post = normalizePost(rawPost);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSolutionSection, setShowSolutionSection] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [solution, setSolution] = useState(null);
  const [reactionCount, setReactionCount] = useState(rawPost?.reactionCount ?? 0);
  const [sameContextCount, setSameContextCount] = useState(rawPost?.sameContextReactionCount ?? 0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setReactionCount(rawPost?.reactionCount ?? 0);
    setSameContextCount(rawPost?.sameContextReactionCount ?? 0);
  }, [rawPost?.reactionCount, rawPost?.sameContextReactionCount]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [reacting, setReacting] = useState(false);

  if (!post || !post.user) return null;

  useEffect(() => {
    if (post.isSolved && post.id) {
      solutionApi.getByPost(post.id).then((r) => setSolution(r.data?.data ?? r.data)).catch(() => setSolution(null));
    } else {
      setSolution(null);
    }
  }, [post.id, post.isSolved]);

  const flattenComments = (roots) => {
    const out = [];
    (roots || []).forEach((c) => {
      out.push(c);
      if (c.replies?.length) out.push(...flattenComments(c.replies));
    });
    return out;
  };

  useEffect(() => {
    if (showComments && post.id) {
      setLoadingComments(true);
      commentApi.getByPost(post.id).then((r) => setComments(flattenComments(r.data?.data ?? r.data ?? []))).catch(() => setComments([])).finally(() => setLoadingComments(false));
    }
  }, [showComments, post.id]);

  const handleReaction = () => {
    if (readOnly || reacting || !post.id) return;
    setReacting(true);
    postApi.reaction(post.id).then((r) => {
      setReactionCount(r.data.totalReactions ?? reactionCount + (r.data.message?.includes("Reacted") ? 1 : -1));
      onRefresh?.();
    }).catch(() => {}).finally(() => setReacting(false));
  };

  const handleShare = () => {
    if (readOnly || !post.id) return;
    postApi.share(post.id).then(() => onRefresh?.()).catch(() => {});
  };

  const handleDelete = () => {
    if (readOnly || deleting || !post.id) return;
    if (!window.confirm("Supprimer ce post ?")) return;
    setDeleting(true);
    postApi
      .delete(post.id)
      .then(() => {
        onRefresh?.();
      })
      .catch(() => {})
      .finally(() => setDeleting(false));
  };

  const handleSendComment = () => {
    if (!commentText.trim() || readOnly || sendingComment || !post.id) return;
    setSendingComment(true);
    commentApi.createOnPost(post.id, { content: commentText.trim() }).then(() => {
      setCommentText("");
      commentApi.getByPost(post.id).then((r) => setComments(r.data.data || []));
      onRefresh?.();
    }).catch(() => {}).finally(() => setSendingComment(false));
  };

  const displaySolution = solution?.description || post.solution || "Aucune description détaillée.";

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md relative">
      {showSolutionSection && (
        <div className="absolute inset-0 z-30 bg-white/98 backdrop-blur-md p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
                <FiCheckCircle size={20} />
              </div>
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">Espace Solution</h3>
            </div>
            <button type="button" onClick={() => setShowSolutionSection(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all">
              <FiX size={24} />
            </button>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5">
            <p className="text-slate-700 text-sm leading-relaxed">{displaySolution}</p>
          </div>
        </div>
      )}

      <div className="p-6 flex items-start justify-between relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center text-slate-600 font-bold">
            {post.user.avatar ? <img src={post.user.avatar} alt="avatar" className="w-full h-full object-cover" /> : (post.user.name?.[0] || "?")}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-slate-900 leading-none">{post.user.name}</p>
              {post.isSolved ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase">
                    <FiCheckCircle size={10} /> Solved
                  </div>
                  <button type="button" onClick={() => setShowSolutionSection(true)} className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                    Voir détail
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[9px] font-black uppercase">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Not Solved
                </div>
              )}
            </div>
            <div className="flex gap-1.5 mt-2 text-[9px] font-black uppercase text-slate-500">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg">{post.category}</span>
              <span className="px-2 py-0.5 bg-slate-50 rounded-lg">{post.subCategory}</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setShowOptions(!showOptions)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
            <FiMoreHorizontal size={22} />
          </button>
          {showOptions && !readOnly && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} aria-hidden />
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-bold"
                  // TODO: open update modal
                >
                  <FiEdit3 className="text-indigo-500" /> Update Post
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold border-t border-slate-50 disabled:opacity-50"
                  disabled={deleting}
                >
                  <FiTrash2 /> Delete Post
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-6 pb-4 text-right">
        <p className="text-slate-700 leading-relaxed font-medium">{post.content}</p>
      </div>

      {/* Media block: images / videos / pdf */}
      {!!post.media?.length && (
        <div className="border-y border-slate-50 bg-slate-900/95">
          {/* Images */}
          {post.media.some((m) => m.type === "image") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {post.media
                .filter((m) => m.type === "image")
                .slice(0, 4)
                .map((m, idx) => (
                  <div key={m.url + idx} className="aspect-video overflow-hidden">
                    <img
                      src={m.url}
                      alt="post-media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          )}

          {/* Videos */}
          {post.media.some((m) => m.type === "video") && (
            <div className="p-4 space-y-3">
              {post.media
                .filter((m) => m.type === "video")
                .map((m, idx) => (
                  <video
                    key={m.url + idx}
                    src={m.url}
                    controls
                    className="w-full rounded-2xl border border-slate-800 bg-black"
                  />
                ))}
            </div>
          )}

          {/* PDFs / other files */}
          {post.media.some((m) => m.type === "pdf" || m.type === "file" || m.type === "doc") && (
            <div className="p-4 bg-slate-900 text-left">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                Pièces jointes
              </p>
              <div className="space-y-1">
                {post.media
                  .filter((m) => m.type === "pdf" || m.type === "file" || m.type === "doc")
                  .map((m, idx) => (
                    <a
                      key={m.url + idx}
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs text-indigo-100 hover:text-white underline break-all"
                    >
                      {m.url.split("/").pop()}
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-2 grid grid-cols-4 gap-1 border-t border-slate-50 bg-white">
        <button
          type="button"
          disabled={readOnly}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all font-black text-[10px] sm:text-xs disabled:opacity-50 disabled:pointer-events-none"
        >
          <FiHeart size={18} /> Favorite
        </button>
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          disabled={readOnly}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-black text-[10px] sm:text-xs disabled:opacity-50 disabled:pointer-events-none"
        >
          <FiMessageCircle size={18} /> Commenter
        </button>
        <button
          type="button"
          onClick={handleReaction}
          disabled={readOnly}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all font-black text-[10px] sm:text-xs disabled:opacity-50 disabled:pointer-events-none"
        >
          <FiHelpCircle size={18} /> Même prob <span className="text-amber-600">({reactionCount})</span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={readOnly}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-black text-[10px] sm:text-xs disabled:opacity-50 disabled:pointer-events-none"
        >
          <FiShare2 size={18} /> Partager
        </button>
      </div>

      {readOnly && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500">
          Lecture seule — Réactions (même contexte) : {sameContextCount}
        </div>
      )}

      {showComments && (
        <div className="bg-slate-50/40 border-t border-slate-100 py-4">
          <div className="space-y-4 px-6">
            {loadingComments ? (
              <p className="text-[10px] text-slate-400">Chargement...</p>
            ) : Array.isArray(comments) && comments.length > 0 ? (
              comments.map((c) => <CommentItem key={c._id || c.id} comment={c} />)
            ) : (
              <div className="text-[10px] text-slate-400 font-bold uppercase">No comments yet</div>
            )}
            {!readOnly && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Écrire un commentaire..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={sendingComment || !commentText.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs disabled:opacity-50"
                >
                  <FiSend size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
