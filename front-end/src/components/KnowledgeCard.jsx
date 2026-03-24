import React, { useEffect, useState, useRef } from "react";
import {
  FiGlobe,
  FiX,
  FiZoomIn,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreHorizontal,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiPlay,
  FiSmile,
  FiImage,
} from "react-icons/fi";
import CommentItem from "./CommentItem";
import {
  postApi,
  favoritesApi,
  commentApi,
  API_BASE,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const resolveAvatarUrl = (src) => {
  if (!src) return `${API_BASE}/avatars/default-avatar.jpg`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars"))
    return `${API_BASE}${src}`;
  if (src === "default-avatar.png" || src === "default-avatar.jpg")
    return `${API_BASE}/avatars/default-avatar.jpg`;
  return `${API_BASE}/avatars/${src}`;
};

const EMOJI_LIST = [
  "😀",
  "😃",
  "😄",
  "😁",
  "🎉",
  "👍",
  "❤️",
  "🔥",
  "😂",
  "🤣",
  "✅",
  "❌",
  "👋",
  "🙏",
  "💪",
  "👏",
  "😊",
  "🥳",
  "😎",
  "🤔",
  "💡",
  "📌",
  "⭐",
  "🎯",
];

const KnowledgeCard = ({
  data,
  isFavorite: isFavoriteProp = false,
  onFavoriteClick,
  onRefresh,
  readOnly = false,
  scrollToCommentId,
  canModerate = false,
}) => {
  const { user } = useAuth();
  const isAuthor = !!(
    user?.id &&
    data.authorId &&
    String(user.id) === String(data.authorId)
  );
  const showMenu = isAuthor || canModerate;
  const canDelete = isAuthor || canModerate;
  const cardRef = useRef(null);
  const [showComments, setShowComments] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isFavorite, setIsFavorite] = useState(isFavoriteProp);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareCount, setShareCount] = useState(data.shareCount ?? 0);
  const [commentCount, setCommentCount] = useState(
    data.commentCount ?? data.comments?.length ?? 0,
  );
  const media = Array.isArray(data.media)
    ? data.media
    : data.mediaUrl
      ? [{ url: data.mediaUrl, type: "image" }]
      : [];
  const hasMedia = media.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);

  const [commentMediaFiles, setCommentMediaFiles] = useState([]);
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(false);
  const commentInputRef = useRef(null);
  const commentFileInputRef = useRef(null);

  const myAvatar = user?.profilePicture
    ? resolveAvatarUrl(user.profilePicture)
    : data.userAvatar || resolveAvatarUrl("default-avatar.jpg");

  const categoryLabel =
    (data.category &&
      typeof data.category === "object" &&
      data.category.name) ||
    data.category ||
    "";
  const subCategoryLabel =
    (data.subCategory &&
      typeof data.subCategory === "object" &&
      data.subCategory.name) ||
    data.subCategory ||
    "";
  const isArabicContent = /[\u0600-\u06FF]/.test(data.content || "");
  const contentDirection = isArabicContent ? "rtl" : "ltr";
  const contentAlignClass = isArabicContent ? "text-right" : "text-left";

  useEffect(() => {
    if (!data.id) return;
    favoritesApi
      .check("knowledge", data.id)
      .then((r) => setIsFavorite(!!r.data?.isFavorite))
      .catch(() => setIsFavorite(false));
  }, [data.id]);

  useEffect(() => {
    setIsFavorite(isFavoriteProp);
  }, [isFavoriteProp]);

  useEffect(() => {
    setShareCount(data.shareCount ?? 0);
  }, [data.shareCount]);

  useEffect(() => {
    setCommentCount(data.commentCount ?? data.comments?.length ?? 0);
  }, [data.commentCount, data.comments?.length]);

  useEffect(() => {
    if (!scrollToCommentId || !data.id) return;
    setShowComments(true);
    setLoadingComments(true);
    loadComments().finally(() => setLoadingComments(false));
  }, [scrollToCommentId, data.id]);

  useEffect(() => {
    if (
      !scrollToCommentId ||
      !cardRef.current ||
      loadingComments ||
      !showComments
    )
      return;
    const timer = setTimeout(() => {
      const el = cardRef.current?.querySelector?.(
        `[data-comment-id="${scrollToCommentId}"]`,
      );
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(timer);
  }, [scrollToCommentId, loadingComments, showComments, comments.length]);

  const loadComments = () => {
    if (!data.id) return Promise.resolve();
    return commentApi
      .getByPost(data.id)
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        setComments(list);
        setCommentCount(list.length);
      })
      .catch(() => {
        setComments([]);
      });
  };

  // State dyal l-Menu (Update/Delete)
  const [showDropdown, setShowDropdown] = useState(false);

  const handleToggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && data.id) {
      setLoadingComments(true);
      loadComments().finally(() => setLoadingComments(false));
    }
  };

  const handleSendComment = () => {
    if (readOnly) return;
    const hasText = (commentText || "").trim().length > 0;
    const hasMedia = commentMediaFiles.length > 0;
    if (!data.id || (!hasText && !hasMedia) || sendingComment) return;

    setSendingComment(true);
    const content = hasText ? commentText.trim() : " ";

    const req = hasMedia
      ? (() => {
          const formData = new FormData();
          formData.append("content", content);
          commentMediaFiles.forEach((file) => formData.append("media", file));
          return commentApi.createOnPost(data.id, null, formData);
        })()
      : commentApi.createOnPost(data.id, { content });

    req
      .then(() => {
        setCommentText("");
        setCommentMediaFiles([]);
        setCommentCount((prev) => prev + 1);
        return loadComments();
      })
      .catch(() => {})
      .finally(() => setSendingComment(false));
  };

  const handleCommentMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setCommentMediaFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveCommentMedia = (index) => {
    setCommentMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCommentEmojiClick = (emoji) => {
    setCommentText((prev) => (prev || "") + emoji);
    setShowCommentEmojiPicker(false);
    setTimeout(() => commentInputRef.current?.focus(), 0);
  };

  const handleFavoriteClick = () => {
    if (readOnly) return;
    if (!data.id || loadingFavorite) return;
    setLoadingFavorite(true);
    const done = () => setLoadingFavorite(false);
    if (isFavorite) {
      favoritesApi
        .remove({ contentType: "knowledge", contentId: data.id })
        .then(() => {
          setIsFavorite(false);
          onFavoriteClick?.(false);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(
            "Favorite REMOVE error (knowledge):",
            err?.response?.data || err?.message || err,
          );
        })
        .finally(done);
    } else {
      favoritesApi
        .add({ contentType: "knowledge", contentId: data.id })
        .then(() => {
          setIsFavorite(true);
          onFavoriteClick?.(true);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(
            "Favorite ADD error (knowledge):",
            err?.response?.data || err?.message || err,
          );
        })
        .finally(done);
    }
  };

  const handleShare = () => {
    if (readOnly) return;
    if (!data.id) return;
    postApi
      .share(data.id)
      .then((r) => {
        const total = r.data?.totalShares ?? r.data?.data?.totalShares;
        if (typeof total === "number") setShareCount(total);
        else setShareCount((prev) => prev + 1);
      })
      .catch(() => {});
  };

  const handleDeleteKnowledge = () => {
    if (!data.id || deleting) return;
    setDeleting(true);
    postApi
      .delete(data.id)
      .then(() => {
        setShowDeleteConfirm(false);
        onRefresh?.();
      })
      .catch(() => {})
      .finally(() => setDeleting(false));
  };

  return (
    <>
      <div
        ref={cardRef}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md group flex flex-col font-sans"
      >
        {/* HEADER */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-white">
              <img
                src={data.userAvatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[15px] font-black text-slate-900 leading-none">
                  {data.userName}
                </h4>
                <div className="flex gap-1.5 items-center ml-1">
                  <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm shadow-indigo-100">
                    {categoryLabel}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter border border-slate-200">
                    {subCategoryLabel}
                  </span>
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-bold mt-1.5 uppercase tracking-wider">
                {data.time} • PUBLIC{" "}
                <FiGlobe className="inline ml-1" size={10} />
              </p>
            </div>
          </div>

          {/* DROPDOWN MENU (Update = auteur only, Delete + icon = auteur | super_admin | admin même campus | formateur même contexte) */}
          {showMenu && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`p-2 rounded-xl transition-all ${showDropdown ? "bg-slate-100 text-indigo-600" : "text-slate-300 hover:text-slate-600"}`}
              >
                <FiMoreHorizontal size={20} />
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {isAuthor && (
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border-b border-slate-50 uppercase tracking-tight"
                        onClick={() => {
                          console.log("Update");
                          setShowDropdown(false);
                        }}
                      >
                        <FiEdit2 size={14} className="text-indigo-500" /> Update
                        Knowledge
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-tight"
                        onClick={() => {
                          setShowDropdown(false);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <FiTrash2 size={14} className="text-rose-500" /> Delete
                        Knowledge
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* MEDIA + CONTENT */}
        <div className="px-6 pb-4 space-y-4">
          {hasMedia &&
            (() => {
              const current = media[activeIndex] || media[0];
              if (!current) return null;

              const filename = current.url?.split("/").pop();

              return (
                <div className="space-y-3">
                  <div
                    onClick={() =>
                      current.type === "image" && setIsImageOpen(true)
                    }
                    className="w-full aspect-video rounded-[1.5rem] overflow-hidden bg-slate-100 relative cursor-pointer border border-slate-50 flex items-center justify-center"
                  >
                    {current.type === "image" && (
                      <>
                        <img
                          src={current.url}
                          className="w-full h-full object-cover"
                          alt="knowledge-media"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FiZoomIn className="text-white" size={24} />
                        </div>
                      </>
                    )}
                    {current.type === "video" && (
                      <video
                        src={current.url}
                        controls
                        className="w-full h-full object-contain bg-black"
                      />
                    )}
                    {current.type !== "image" && current.type !== "video" && (
                      <a
                        href={current.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center text-slate-700 hover:text-indigo-600"
                      >
                        <FiFileText size={32} className="mb-2" />
                        <span className="text-xs font-bold truncate max-w-[220px]">
                          {filename}
                        </span>
                      </a>
                    )}
                  </div>

                  {media.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {media.map((m, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveIndex(idx)}
                          className={`w-16 h-12 rounded-xl overflow-hidden border ${
                            idx === activeIndex
                              ? "border-indigo-500"
                              : "border-slate-200"
                          } flex-shrink-0 bg-slate-100 flex items-center justify-center`}
                        >
                          {m.type === "image" ? (
                            <img
                              src={m.url}
                              className="w-full h-full object-cover"
                              alt={`thumb-${idx}`}
                            />
                          ) : m.type === "video" ? (
                            <FiPlay size={18} className="text-slate-700" />
                          ) : (
                            <FiFileText size={16} className="text-slate-700" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          <div
            dir={contentDirection}
            className={`text-slate-700 font-medium leading-relaxed ${contentAlignClass}`}
          >
            {data.content}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mx-6 mb-4 p-1 grid grid-cols-3 gap-1 bg-slate-50 rounded-2xl border border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFavoriteClick();
            }}
            disabled={loadingFavorite || readOnly}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
              isFavorite
                ? "bg-white text-rose-600 shadow-sm"
                : "text-slate-500 hover:text-rose-500"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <FiHeart className={isFavorite ? "fill-rose-600" : ""} size={16} />
            <span className="text-[11px] font-black uppercase">Favorite</span>
          </button>

          <button
            onClick={handleToggleComments}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
              showComments
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            <FiMessageCircle size={16} />
            <span className="text-[11px] font-black uppercase tracking-tight">
              Comment <span className="text-indigo-600">({commentCount})</span>
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleShare();
            }}
            disabled={readOnly}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-500 hover:text-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiShare2 size={16} />
            <span className="text-[11px] font-black uppercase tracking-tight">
              Share <span className="text-emerald-600">({shareCount})</span>
            </span>
          </button>
        </div>

        {showComments && (
          <div className="bg-slate-50/40 border-t border-slate-100 py-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex gap-3 px-6 mb-6">
              <img
                src={myAvatar}
                className="w-9 h-9 rounded-full border border-slate-200"
                alt="me"
              />
              <div className="flex-grow">
                <div className="relative">
                  <textarea
                    ref={commentInputRef}
                    rows={1}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-4 pr-20 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm resize-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowCommentEmojiPicker((v) => !v)}
                      className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
                    >
                      <FiSmile size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => commentFileInputRef.current?.click()}
                      className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
                    >
                      <FiImage size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSendComment();
                      }}
                      disabled={sendingComment}
                      className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <FiSend size={14} />
                    </button>
                  </div>
                </div>

                {showCommentEmojiPicker && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 flex flex-wrap gap-1 max-w-xs">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleCommentEmojiClick(emoji)}
                        className="text-lg hover:scale-110 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {!!commentMediaFiles.length && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {commentMediaFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600"
                      >
                        <span className="max-w-40 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCommentMedia(idx)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  ref={commentFileInputRef}
                  onChange={handleCommentMediaChange}
                  className="hidden"
                />
              </div>
            </div>
            <div className="space-y-1">
              {loadingComments ? (
                <p className="px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Chargement des commentaires...
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment._id || comment.id}
                    comment={comment}
                    onToggleLike={(id) =>
                      commentApi
                        .like(id)
                        .then(() => loadComments())
                        .catch(() => {})
                    }
                    onReply={(parentId, replyContent, files) => {
                      const trimmed = (replyContent || "").trim();
                      if (!trimmed || !data.id) return;

                      if (files?.length) {
                        const formData = new FormData();
                        formData.append("content", trimmed);
                        files.forEach((f) => formData.append("media", f));
                        return commentApi
                          .createOnPost(data.id, null, formData)
                          .then(() => loadComments())
                          .catch(() => {});
                      }

                      return commentApi
                        .createOnPost(data.id, {
                          content: trimmed,
                          parentComment: parentId,
                        })
                        .then(() => loadComments())
                        .catch(() => {});
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL IMAGE (images only) */}
      {isImageOpen && hasMedia && media[activeIndex]?.type === "image" && (
        <div
          className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsImageOpen(false)}
        >
          <button className="absolute top-8 right-8 text-white hover:rotate-90 transition-transform">
            <FiX size={32} />
          </button>
          <img
            src={media[activeIndex]?.url}
            className="max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300"
            alt="full"
          />
        </div>
      )}

      {/* MODAL CONFIRM DELETE */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-700 font-semibold mb-6">
              Supprimer cette knowledge ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteKnowledge}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KnowledgeCard;
