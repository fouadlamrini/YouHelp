import React, { useState, useEffect, useRef } from "react";
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
  FiSmile,
  FiImage,
} from "react-icons/fi";
import CommentItem from "./CommentItem";
import { postApi, commentApi, solutionApi, favoritesApi, workshopsApi } from "../services/api";

const API_BASE = "http://localhost:3000";

const EMOJI_LIST = ["😀","😃","😄","😁","🎉","👍","❤️","🔥","😂","🤣","✅","❌","👋","🙏","💪","👏","😊","🥳","😎","🤔","💡","📌","⭐","🎯"];

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

const PostCard = ({ post: rawPost, readOnly = false, onRefresh, sharedInfo = null }) => {
  const post = normalizePost(rawPost);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSolutionSection, setShowSolutionSection] = useState(false);
  const [showWriteSolution, setShowWriteSolution] = useState(false);
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const commentInputRef = useRef(null);
  const commentFileInputRef = useRef(null);
  const [commentMediaFiles, setCommentMediaFiles] = useState([]);
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(false);
  const isSharedInstance = !!sharedInfo;
  const [localSolved, setLocalSolved] = useState(rawPost?.isSolved ?? false);
  const [togglingSolved, setTogglingSolved] = useState(false);
  const [solutionText, setSolutionText] = useState("");
  const [workchopRequested, setWorkchopRequested] = useState(false);
  const [loadingWorkchop, setLoadingWorkchop] = useState(false);

  useEffect(() => {
    setLocalSolved(rawPost?.isSolved ?? false);
  }, [rawPost?.isSolved]);

  if (!post || !post.user) return null;

  useEffect(() => {
    if (!post.id) return;
    favoritesApi.check("post", post.id).then((r) => setIsFavorite(!!r.data?.isFavorite)).catch(() => setIsFavorite(false));
  }, [post.id]);

  useEffect(() => {
    setEditContent(post?.content || "");
    setEditedMedia(post?.originalMedia || []);
    setNewFiles([]);
    setActiveImageIndex(0);
  }, [post?.id]);

  useEffect(() => {
    if (localSolved && post.id) {
      solutionApi.getByPost(post.id).then((r) => setSolution(r.data?.data ?? r.data)).catch(() => setSolution(null));
    } else {
      setSolution(null);
    }
  }, [post.id, localSolved]);

  const handleToggleSolved = () => {
    if (readOnly || togglingSolved || !post.id) return;
    if (!localSolved) {
      setSolutionText("");
      setShowWriteSolution(true);
      return;
    }
    setTogglingSolved(true);
    postApi
      .toggleSolved(post.id)
      .then((r) => {
        const next = r.data?.data?.isSolved ?? !localSolved;
        setLocalSolved(next);
        onRefresh?.();
      })
      .catch(() => {})
      .finally(() => setTogglingSolved(false));
  };

  const handleConfirmSolved = () => {
    if (readOnly || togglingSolved || !post.id) return;
    const trimmed = (solutionText || "").trim();
    if (!trimmed) return;
    setTogglingSolved(true);
    postApi
      .toggleSolved(post.id, { description: trimmed })
      .then((r) => {
        const next = r.data?.data?.isSolved ?? true;
        setLocalSolved(next);
        setShowWriteSolution(false);
        onRefresh?.();
      })
      .catch(() => {})
      .finally(() => setTogglingSolved(false));
  };

  const loadComments = () => {
    if (!post.id) return Promise.resolve();
    return commentApi.getByPost(post.id).then((r) => setComments(r.data?.data ?? r.data ?? [])).catch(() => setComments([]));
  };

  useEffect(() => {
    if (showComments && post.id) {
      setLoadingComments(true);
      loadComments().finally(() => setLoadingComments(false));
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

  const handleFavorite = () => {
    if (readOnly || loadingFavorite || !post.id) return;
    setLoadingFavorite(true);
    const done = () => setLoadingFavorite(false);
    if (isFavorite) {
      favoritesApi.remove({ contentType: "post", contentId: post.id }).then(() => {
        setIsFavorite(false);
        onRefresh?.();
      }).catch(() => {}).finally(done);
    } else {
      favoritesApi.add({ contentType: "post", contentId: post.id }).then(() => {
        setIsFavorite(true);
        onRefresh?.();
      }).catch(() => {}).finally(done);
    }
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

  const handleDeleteShare = () => {
    if (readOnly || deleting || !sharedInfo?.id) return;
    if (!window.confirm("Supprimer ce partage ?")) return;
    setDeleting(true);
    postApi
      .deleteShare(sharedInfo.id)
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

  const handleCommentMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    setCommentMediaFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeCommentMediaFile = (index) => {
    setCommentMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const insertCommentEmoji = (emoji) => {
    const el = commentInputRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = commentText.slice(0, start);
      const after = commentText.slice(end);
      setCommentText(before + emoji + after);
      setShowCommentEmojiPicker(false);
      setTimeout(() => { el.focus(); el.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
    } else {
      setCommentText((prev) => prev + emoji);
      setShowCommentEmojiPicker(false);
    }
  };

  const handleSendComment = () => {
    const hasContent = commentText.trim();
    const hasMedia = commentMediaFiles.length > 0;
    if ((!hasContent && !hasMedia) || readOnly || sendingComment || !post.id) return;
    setSendingComment(true);
    const content = hasContent || " ";
    const req = hasMedia
      ? (() => {
          const formData = new FormData();
          formData.append("content", content);
          commentMediaFiles.forEach((file) => formData.append("media", file));
          return commentApi.createOnPost(post.id, null, formData);
        })()
      : commentApi.createOnPost(post.id, { content });
    req.then(() => {
      setCommentText("");
      setCommentMediaFiles([]);
      loadComments();
      onRefresh?.();
      setTimeout(() => commentInputRef.current?.focus(), 0);
    }).catch(() => {}).finally(() => setSendingComment(false));
  };

  const commentCount = rawPost?.commentCount ?? 0;

  const displaySolution = solution?.description || post.solution || "Aucune description détaillée.";

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md relative">
      {showWriteSolution && (
        <div className="absolute inset-0 z-30 bg-white/98 backdrop-blur-md p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
                <FiCheckCircle size={20} />
              </div>
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">Écrire la solution</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowWriteSolution(false)}
              className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all"
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 space-y-4">
            <textarea
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              placeholder="Décris clairement la solution trouvée..."
              className="w-full min-h-[120px] bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWriteSolution(false)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmSolved}
                disabled={togglingSolved || !solutionText.trim()}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Valider la solution
              </button>
            </div>
          </div>
        </div>
      )}

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
              {localSolved ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleSolved}
                    disabled={readOnly || togglingSolved}
                    className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase cursor-pointer hover:bg-emerald-100/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Cliquer pour marquer comme non résolu"
                  >
                    <FiCheckCircle size={10} /> Solved
                  </button>
                  <button type="button" onClick={() => setShowSolutionSection(true)} className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/50 hover:bg-indigo-100/50">
                    Voir détail
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleSolved}
                  disabled={readOnly || togglingSolved}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[9px] font-black uppercase cursor-pointer hover:bg-red-100/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Cliquer pour marquer comme résolu"
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Not Solved
                </button>
              )}
            </div>
            {isSharedInstance && (
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                Vous avez partagé ce post
              </p>
            )}
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
                {isSharedInstance ? (
                  <button
                    type="button"
                    onClick={handleDeleteShare}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold disabled:opacity-50"
                    disabled={deleting}
                  >
                    <FiTrash2 /> Supprimer ce partage
                  </button>
                ) : (
                  <>
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
                  </>
                )}
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
          onClick={handleFavorite}
          disabled={readOnly || loadingFavorite}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl transition-all font-black text-[10px] sm:text-xs disabled:opacity-50 disabled:pointer-events-none ${
            isFavorite ? "text-rose-600 bg-rose-50 hover:bg-rose-100" : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
          }`}
        >
          <FiHeart size={18} className={isFavorite ? "fill-current" : ""} /> Favorite
        </button>
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          disabled={readOnly}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-black text-[10px] sm:text-xs disabled:opacity-50 disabled:pointer-events-none"
        >
          <FiMessageCircle size={18} /> Commenter <span className="text-indigo-600">({commentCount})</span>
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

      {rawPost?.showDemandeWorkchopButton && rawPost?.sameContextAsAuthor && (
        <div className="px-2 pb-2 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={async () => {
              if (readOnly || loadingWorkchop || workchopRequested || !post.id) return;
              setLoadingWorkchop(true);
              try {
                await workshopsApi.requestFromPost(post.id);
                setWorkchopRequested(true);
                onRefresh?.();
              } catch (e) {
                const msg = e.response?.data?.message || "Erreur";
                alert(msg);
              } finally {
                setLoadingWorkchop(false);
              }
            }}
            disabled={readOnly || loadingWorkchop || workchopRequested}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 text-white hover:bg-violet-700 font-black text-xs disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            <FiTool size={18} />
            {workchopRequested ? "Demande envoyée" : "Demande de workchop"}
          </button>
        </div>
      )}

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
              comments.map((c) => (
                <CommentItem
                  key={c._id || c.id}
                  comment={c}
                  postId={post.id}
                  onRefresh={() => { loadComments(); onRefresh?.(); }}
                />
              ))
            ) : (
              <div className="text-[10px] text-slate-400 font-bold uppercase">No comments yet</div>
            )}
            {!readOnly && (
              <div className="space-y-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative bg-slate-50 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                    <textarea
                      ref={commentInputRef}
                      rows={2}
                      placeholder="Écrire un commentaire..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                      className="w-full px-4 py-2.5 bg-transparent rounded-xl text-sm resize-none outline-none"
                    />
                    {commentMediaFiles.length > 0 && (
                      <div className="px-3 pb-2 flex flex-wrap gap-2">
                        {commentMediaFiles.map((file, index) => (
                          <span
                            key={`${file.name}-${index}`}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-200/80 text-[10px] font-bold text-slate-700"
                          >
                            {file.type.startsWith("image") ? "🖼" : file.type.startsWith("video") ? "🎬" : "📄"}
                            <span className="max-w-[100px] truncate">{file.name}</span>
                            <button type="button" onClick={() => removeCommentMediaFile(index)} className="text-slate-500 hover:text-red-500">
                              <FiX size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between px-2 pb-2 pt-0 border-t border-slate-100 mt-1">
                      <div className="flex items-center gap-1 relative">
                        <button
                          type="button"
                          onClick={() => setShowCommentEmojiPicker((v) => !v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 transition-colors"
                          title="Emoji"
                        >
                          <FiSmile size={18} />
                        </button>
                        {showCommentEmojiPicker && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowCommentEmojiPicker(false)} aria-hidden />
                            <div className="absolute left-0 bottom-full mb-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-[260px]">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Choisir un emoji</p>
                              <div className="grid grid-cols-6 gap-1.5 overflow-y-auto max-h-40">
                                {EMOJI_LIST.map((emoji) => (
                                  <button key={emoji} type="button" onClick={() => insertCommentEmoji(emoji)} className="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-100 rounded-lg shrink-0">
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => commentFileInputRef.current?.click()}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 transition-colors"
                          title="Image / Vidéo / PDF"
                        >
                          <FiImage size={18} />
                        </button>
                        <input
                          ref={commentFileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*,application/pdf"
                          className="hidden"
                          onChange={handleCommentMediaChange}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendComment}
                        disabled={sendingComment || (!commentText.trim() && !commentMediaFiles.length)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs disabled:opacity-50"
                      >
                        <FiSend size={16} />
                      </button>
                    </div>
                  </div>
                </div>
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
