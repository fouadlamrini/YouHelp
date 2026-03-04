import React, { useState, useRef } from "react";
import { FiMoreHorizontal, FiSend, FiEdit2, FiTrash2, FiX, FiSmile, FiImage } from "react-icons/fi";
import { commentApi } from "../services/api";

const API_BASE = "http://localhost:3000";
const EMOJI_LIST = ["😀","😃","😄","😁","🎉","👍","❤️","🔥","😂","🤣","✅","❌","👋","🙏","💪","👏","😊","🥳","😎","🤔","💡","📌","⭐","🎯"];

const resolveAvatarUrl = (src) => {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_BASE}${src}`;
  if (src === "default-avatar.png" || src === "default-avatar.jpg") return `${API_BASE}/avatars/default-avatar.jpg`;
  return `${API_BASE}/avatars/${src}`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "À l'instant";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
  return d.toLocaleDateString();
};

const CommentItem = ({
  comment,
  postId,
  onRefresh,
  isReply = false,
  onToggleLike,
  onReply,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [liking, setLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replyMediaFiles, setReplyMediaFiles] = useState([]);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const replyInputRef = useRef(null);
  const replyFileInputRef = useRef(null);

  const author = comment.author || {};
  const userName = comment.userName ?? author.name ?? author.email ?? "?";
  const userRole = comment.userRole ?? author.role?.name ?? "";
  const text = comment.text ?? comment.content ?? "";
  const time = comment.time ?? formatTime(comment.createdAt);
  const rawAvatar = comment.avatar ?? author.profilePicture;
  const avatarUrl = rawAvatar ? resolveAvatarUrl(rawAvatar) : resolveAvatarUrl("default-avatar.jpg");
  const likeCount = Array.isArray(comment.likes) ? comment.likes.length : 0;
  const isRootComment = !isReply;

  const handleReplyMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    setReplyMediaFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeReplyMediaFile = (index) => {
    setReplyMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const insertReplyEmoji = (emoji) => {
    const el = replyInputRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = replyText.slice(0, start);
      const after = replyText.slice(end);
      setReplyText(before + emoji + after);
      setShowReplyEmojiPicker(false);
      setTimeout(() => { el.focus(); el.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
    } else {
      setReplyText((prev) => prev + emoji);
      setShowReplyEmojiPicker(false);
    }
  };

  const handleSendReply = () => {
    const hasContent = replyText.trim();
    const hasMedia = replyMediaFiles.length > 0;
    if (!hasContent && !hasMedia) return;

    // Délégué (ex: Knowledge) via prop onReply
    if (onReply) {
      const maybePromise = onReply(comment._id, replyText, replyMediaFiles);
      setReplyText("");
      setReplyMediaFiles([]);
      setIsReplying(false);
      if (maybePromise && typeof maybePromise.then === "function") {
        setSendingReply(true);
        maybePromise.finally(() => setSendingReply(false));
      }
      return;
    }

    // Flux classique Post (API commentApi.createOnPost)
    if (!postId || !onRefresh) return;
    setSendingReply(true);
    const content = hasContent || " ";
    const hasFiles = replyMediaFiles.length > 0;
    const req = hasFiles
      ? (() => {
          const formData = new FormData();
          formData.append("content", content);
          formData.append("parentComment", comment._id);
          replyMediaFiles.forEach((f) => formData.append("media", f));
          return commentApi.createOnPost(postId, null, formData);
        })()
      : commentApi.createOnPost(postId, { content, parentComment: comment._id });
    req
      .then(() => {
        setReplyText("");
        setReplyMediaFiles([]);
        setIsReplying(false);
        onRefresh();
      })
      .catch(() => {})
      .finally(() => setSendingReply(false));
  };

  const handleLike = () => {
    if (!comment._id || liking) return;

    if (onToggleLike) {
      setLiking(true);
      const maybePromise = onToggleLike(comment._id);
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.finally(() => setLiking(false));
      } else {
        setLiking(false);
      }
      return;
    }

    if (!onRefresh) return;
    setLiking(true);
    commentApi
      .like(comment._id)
      .then(() => onRefresh())
      .catch(() => {})
      .finally(() => setLiking(false));
  };

  const handleUpdate = () => {
    if (!comment._id || !onRefresh || !editText.trim()) return;
    setSavingEdit(true);
    setShowMenu(false);
    commentApi.update(comment._id, { content: editText.trim() }).then(() => {
      setEditMode(false);
      onRefresh();
    }).catch(() => {}).finally(() => setSavingEdit(false));
  };

  const handleDelete = () => {
    if (!comment._id || !onRefresh) return;
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    setDeleting(true);
    setShowMenu(false);
    commentApi.delete(comment._id).then(() => onRefresh()).catch(() => {}).finally(() => setDeleting(false));
  };

  return (
    <div className={`mb-4 animate-in fade-in duration-500 ${isReply ? "ml-8 pl-4 border-l-2 border-slate-100" : ""}`}>
      <div className="flex gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="user" className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center text-slate-600 text-xs font-bold">
            {(userName || "?")[0]}
          </div>
        )}
        <div className="grow min-w-0">
          <div className="bg-white p-4 rounded-[1.3rem] rounded-tl-none border border-slate-100 shadow-sm relative group">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{userName}</span>
                {userRole && <p className="text-[10px] font-bold text-slate-400">{userRole}</p>}
              </div>
              <div className="flex items-center gap-2 relative">
                <span className="text-[10px] font-bold text-slate-400">{time}</span>
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-slate-300 hover:text-slate-600 p-1"
                >
                  <FiMoreHorizontal size={14} />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} aria-hidden />
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1">
                      <button
                        type="button"
                        onClick={() => { setEditMode(true); setEditText(comment.content || ""); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <FiEdit2 size={12} /> Modifier
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <FiTrash2 size={12} /> Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {editMode ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[60px] resize-none"
                  placeholder="Contenu du commentaire..."
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditMode(false); setEditText(comment.content || ""); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={savingEdit || !editText.trim()}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:opacity-50"
                  >
                    {savingEdit ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-700 font-medium leading-relaxed mt-1 text-right">{text}</p>
                {Array.isArray(comment.media) && comment.media.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {comment.media.map((m, idx) => {
                      let path = m.url;
                      if (path && !path.startsWith("http") && path.startsWith("/uploads/") && !path.includes("/images/") && !path.includes("/videos/") && !path.includes("/files/")) {
                        const filename = path.replace("/uploads/", "");
                        const folder = m.type === "image" ? "images" : m.type === "video" ? "videos" : "files";
                        path = `/uploads/${folder}/${filename}`;
                      }
                      const url = path?.startsWith("http") ? path : path ? `${API_BASE}${path}` : "";
                      if (!url) return null;
                      if (m.type === "image") {
                        return (
                          <a key={idx} href={url} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                            <img src={url} alt="comment media" className="w-full h-full object-cover" />
                          </a>
                        );
                      }
                      if (m.type === "video") {
                        return (
                          <video key={idx} src={url} controls className="max-w-[200px] max-h-[120px] rounded-lg border border-slate-200" />
                        );
                      }
                      return (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">
                          📄 {path?.split("/").pop()}
                        </a>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1.5 ml-2">
            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              className="text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              Like {likeCount > 0 && <span className="text-indigo-600">({likeCount})</span>}
            </button>
            {isRootComment && (onReply || (onRefresh && postId)) && (
              <>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <button
                  type="button"
                  onClick={() => setIsReplying(!isReplying)}
                  className={`text-[11px] font-black transition-colors ${isReplying ? "text-indigo-600 underline underline-offset-4" : "text-slate-500 hover:text-indigo-600"}`}
                >
                  Reply
                </button>
              </>
            )}
          </div>

          {isReplying && isRootComment && (
            <div className="mt-3 ml-2 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-white p-2 rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-50/50 space-y-1.5">
                <div className="flex gap-2 items-center">
                  <input
                    ref={replyInputRef}
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSendReply(); } }}
                    placeholder="Écrire une réponse..."
                    className="flex-1 bg-transparent py-1.5 px-2 text-xs outline-none text-slate-700 placeholder:text-slate-400"
                  />
                  <div className="flex items-center gap-0.5 relative">
                    <button type="button" onClick={() => setShowReplyEmojiPicker((v) => !v)} className="p-1 rounded text-slate-400 hover:text-amber-500">
                      <FiSmile size={16} />
                    </button>
                    {showReplyEmojiPicker && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowReplyEmojiPicker(false)} aria-hidden />
                        <div className="absolute left-0 bottom-full mb-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl p-2 w-[220px]">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5">Emoji</p>
                          <div className="grid grid-cols-6 gap-1 overflow-y-auto max-h-36">
                            {EMOJI_LIST.map((emoji) => (
                              <button key={emoji} type="button" onClick={() => insertReplyEmoji(emoji)} className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded-lg shrink-0">
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    <button type="button" onClick={() => replyFileInputRef.current?.click()} className="p-1 rounded text-slate-400 hover:text-indigo-500">
                      <FiImage size={16} />
                    </button>
                    <input ref={replyFileInputRef} type="file" multiple accept="image/*,video/*,application/pdf" className="hidden" onChange={handleReplyMediaChange} />
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={sendingReply || (!replyText.trim() && !replyMediaFiles.length)}
                      className={`p-1.5 rounded ${(replyText.trim() || replyMediaFiles.length) ? "text-indigo-600" : "text-slate-200"}`}
                    >
                      <FiSend size={14} />
                    </button>
                  </div>
                </div>
                {replyMediaFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {replyMediaFiles.map((file, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-600">
                        <span className="max-w-[80px] truncate">{file.name}</span>
                        <button type="button" onClick={() => removeReplyMediaFile(index)} className="text-slate-400 hover:text-red-500"><FiX size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => !sendingReply && (setIsReplying(false), setReplyMediaFiles([]), setShowReplyEmojiPicker(false))}
                className="text-[9px] font-bold text-slate-400 mt-1 ml-1 hover:text-red-400 uppercase tracking-tighter"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Only show replies for root comments (one level only; no reply-to-reply) */}
          {isRootComment && Array.isArray(comment.replies) && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map((r) => (
                <CommentItem
                  key={r._id || r.id}
                  comment={r}
                  postId={postId}
                  onRefresh={onRefresh}
                  isReply
                  onToggleLike={onToggleLike}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
