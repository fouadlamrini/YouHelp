import React, { useState } from "react";
import { FiMoreHorizontal, FiSend, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { commentApi } from "../services/api";

const API_BASE = "http://localhost:3000";

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

const CommentItem = ({ comment, postId, onRefresh, isReply = false }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [liking, setLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const author = comment.author || {};
  const userName = comment.userName ?? author.name ?? author.email ?? "?";
  const userRole = comment.userRole ?? author.role?.name ?? "";
  const text = comment.text ?? comment.content ?? "";
  const time = comment.time ?? formatTime(comment.createdAt);
  const rawAvatar = comment.avatar ?? author.profilePicture;
  const avatarUrl = rawAvatar ? resolveAvatarUrl(rawAvatar) : resolveAvatarUrl("default-avatar.jpg");
  const likeCount = Array.isArray(comment.likes) ? comment.likes.length : 0;
  const isRootComment = !isReply;

  const handleSendReply = () => {
    if (!replyText.trim() || !postId || !onRefresh) {
      if (replyText.trim()) setReplyText("");
      setIsReplying(false);
      return;
    }
    setSendingReply(true);
    commentApi
      .createOnPost(postId, { content: replyText.trim(), parentComment: comment._id })
      .then(() => {
        setReplyText("");
        setIsReplying(false);
        onRefresh();
      })
      .catch(() => {})
      .finally(() => setSendingReply(false));
  };

  const handleLike = () => {
    if (!comment._id || !onRefresh || liking) return;
    setLiking(true);
    commentApi.like(comment._id).then(() => onRefresh()).catch(() => {}).finally(() => setLiking(false));
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
              <p className="text-sm text-slate-700 font-medium leading-relaxed mt-1 text-right">{text}</p>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1.5 ml-2">
            <button
              type="button"
              onClick={handleLike}
              disabled={liking || !onRefresh}
              className="text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              Like {likeCount > 0 && <span className="text-indigo-600">({likeCount})</span>}
            </button>
            {isRootComment && onRefresh && postId && (
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
              <div className="flex gap-3 items-center bg-white p-2 rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-50/50">
                <div className="grow relative flex items-center pr-2">
                  <input
                    autoFocus
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSendReply(); } }}
                    placeholder="Écrire une réponse..."
                    className="w-full bg-transparent py-1.5 px-1 text-xs outline-none text-slate-700 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className={`transition-all ${replyText.trim() ? "text-indigo-600 scale-110" : "text-slate-200"}`}
                  >
                    <FiSend size={14} />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !sendingReply && setIsReplying(false)}
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
