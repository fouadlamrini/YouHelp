import React, { useState, useEffect } from "react";
import {
  FiHeart,
  FiMessageCircle,
  FiHelpCircle,
  FiShare2,
  FiMoreHorizontal,
  FiCheckCircle,
  FiSend,
  FiTool,
  FiEdit3,
  FiTrash2,
  FiX,
  FiPlus,
  FiPlay,
  FiFileText,
} from "react-icons/fi";
import CommentItem from "./CommentItem";
import { postApi, commentApi, solutionApi } from "../services/api";

const API_BASE = "http://localhost:3000";

const resolveAvatarUrl = (src) => {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_BASE}${src}`;
  if (src === "default-avatar.png" || src === "default-avatar.jpg") return `${API_BASE}/avatars/default-avatar.jpg`;
  return `${API_BASE}/avatars/${src}`;
};

const normalizePost = (post) => {
  if (!post) return null;
  const author = post.author || post.user;
  const originalMedia = Array.isArray(post.media) ? post.media : [];
  const cat = post.category?.name || post.category;
  const sub = post.subCategory?.name || post.subCategory;
  const media = originalMedia.map((m) => {
    const url = m.url?.startsWith("http") ? m.url : `${API_BASE}${m.url}`;
    return { ...m, url };
  });
  const firstImage =
    media.find((m) => m.type === "image")?.url ||
    media[0]?.url ||
    post.image;
  const avatarUrl = author
    ? (author.profilePicture ? resolveAvatarUrl(author.profilePicture) : resolveAvatarUrl("default-avatar.jpg"))
    : null;
  return {
    ...post,
    originalMedia,
    user: author
      ? {
          name: author.name || author.email,
          avatar: avatarUrl,
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [solution, setSolution] = useState(null);
  const [reactionCount, setReactionCount] = useState(rawPost?.reactionCount ?? 0);
  const [sameContextCount, setSameContextCount] = useState(rawPost?.sameContextReactionCount ?? 0);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || "");
  const [editedMedia, setEditedMedia] = useState(post?.originalMedia || []);
  const [newFiles, setNewFiles] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomedMediaUrl, setZoomedMediaUrl] = useState(null);

  useEffect(() => {
    setReactionCount(rawPost?.reactionCount ?? 0);
    setSameContextCount(rawPost?.sameContextReactionCount ?? 0);
  }, [rawPost?.reactionCount, rawPost?.sameContextReactionCount]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [reacting, setReacting] = useState(false);

  if (!post || !post.user) return null;

  useEffect(() => {
    setEditContent(post?.content || "");
    setEditedMedia(post?.originalMedia || []);
    setNewFiles([]);
    setActiveImageIndex(0);
  }, [post?.id]);

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

  const openEditModal = () => {
    if (!post?.id) return;
    setEditContent(post.content || "");
    setEditedMedia(post.originalMedia || []);
    setNewFiles([]);
    setShowOptions(false);
    setShowEditModal(true);
  };

  const handleRemoveExistingMedia = (index) => {
    setEditedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = () => {
    if (!post?.id || saving) return;
    const trimmed = (editContent || "").trim();
    if (!trimmed) return;
    setSaving(true);
    const formData = new FormData();
    formData.append("content", trimmed);
    if (editedMedia.length) {
      formData.append("existingMedia", JSON.stringify(editedMedia));
    } else {
      formData.append("existingMedia", JSON.stringify([]));
    }
    newFiles.forEach((file) => formData.append("media", file));

    postApi
      .update(post.id, formData)
      .then(() => {
        setShowEditModal(false);
        onRefresh?.();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
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
                  onClick={openEditModal}
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

      {/* Media block: large viewer + unified thumbnails (images / videos / pdf) */}
      {!!post.media?.length && (
        <div className="border-y border-slate-50 bg-slate-900/95">
          {(() => {
            const mediaItems = post.media;
            const safeIndex = Math.min(activeImageIndex, mediaItems.length - 1);
            const current = mediaItems[safeIndex] || mediaItems[0];
            if (!current) return null;

            const handlePrev = (e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
            };
            const handleNext = (e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) => (prev + 1) % mediaItems.length);
            };

            const filename = current.url?.split("/").pop();

            return (
              <div className="p-3 space-y-3">
                <div
                  className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-black flex items-center justify-center cursor-pointer"
                  onClick={() => current.type === "image" && setZoomedMediaUrl(current.url)}
                  role={current.type === "image" ? "button" : undefined}
                  tabIndex={current.type === "image" ? 0 : undefined}
                  onKeyDown={(e) => current.type === "image" && (e.key === "Enter" || e.key === " ") && setZoomedMediaUrl(current.url)}
                >
                  {current.type === "image" && (
                    <img
                      src={current.url}
                      alt="post-media"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {current.type === "video" && (
                    <video
                      src={current.url}
                      controls
                      className="w-full h-full object-contain bg-black"
                    />
                  )}
                  {(current.type === "pdf" ||
                    current.type === "file" ||
                    current.type === "doc") && (
                    <div className="text-center px-4">
                      <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/80 text-slate-50 text-xs font-bold">
                        <FiFileText />
                        <span className="truncate max-w-[220px]">{filename}</span>
                      </div>
                      <a
                        href={current.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-[11px] text-indigo-100 underline"
                      >
                        Ouvrir le fichier
                      </a>
                    </div>
                  )}

                  {mediaItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full px-2 py-1 text-xs"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full px-2 py-1 text-xs"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {zoomedMediaUrl && (
                  <div
                    className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setZoomedMediaUrl(null)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Escape" && setZoomedMediaUrl(null)}
                  >
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setZoomedMediaUrl(null); }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
                      aria-label="Fermer"
                    >
                      <FiX size={28} />
                    </button>
                    <img
                      src={zoomedMediaUrl}
                      alt="Zoom"
                      className="max-w-full max-h-full object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                {mediaItems.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {mediaItems.map((m, idx) => (
                      <button
                        key={m.url + idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-12 rounded-xl overflow-hidden border ${
                          idx === safeIndex
                            ? "border-indigo-400 ring-2 ring-indigo-300"
                            : "border-slate-700"
                        } flex-shrink-0 bg-slate-900`}
                      >
                        {m.type === "image" && (
                          <img
                            src={m.url}
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {m.type === "video" && (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-100">
                            <FiPlay />
                          </div>
                        )}
                        {(m.type === "pdf" || m.type === "file" || m.type === "doc") && (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-[9px] text-slate-100 px-1 text-center">
                            <span className="truncate w-full">
                              {(m.url || "").split("/").pop()?.split(".").pop()?.toUpperCase() ||
                                "FILE"}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
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

      {showEditModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                Modifier le post
              </h3>
              <button
                type="button"
                onClick={() => !saving && setShowEditModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                placeholder="Mettre à jour le contenu du post..."
              />
              {!!editedMedia.length && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.18em]">
                    Médias existants
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editedMedia.map((m, idx) => {
                      const resolvedUrl = m.url?.startsWith("http")
                        ? m.url
                        : `${API_BASE}${m.url}`;
                      const label =
                        m.type === "image"
                          ? "Image"
                          : m.type === "video"
                          ? "Vidéo"
                          : m.type === "pdf"
                          ? "PDF"
                          : "Fichier";
                      return (
                        <div
                          key={`${m.url}-${idx}`}
                          className="flex items-center gap-2 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[10px]"
                        >
                          {m.type === "image" ? (
                            <img
                              src={resolvedUrl}
                              alt="media"
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700">
                              {label}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingMedia(idx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.18em]">
                  Ajouter des médias
                </p>
                <div className="flex items-center gap-3">
                  <label
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 cursor-pointer hover:bg-slate-50"
                  >
                    <FiPlus size={14} /> Images / Vidéos / PDF
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,application/pdf"
                      className="hidden"
                      onChange={handleNewMediaChange}
                    />
                  </label>
                </div>
                {!!newFiles.length && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {newFiles.map((file, idx) => (
                      <span
                        key={`${file.name}-${file.size}-${idx}`}
                        className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5 text-[10px]"
                      >
                        <span className="max-w-[120px] truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(idx)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <FiX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => !saving && setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={saving || !editContent.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
