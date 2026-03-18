import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NavbarLoggedIn from "../../components/NavbarLoggedIn";
import KnowledgeCard from "../../components/KnowledgeCard";
import Messaging from "../../components/Messaging";
import Sidebar from "../../components/Sidebar";
import {
  FiImage,
  FiSend,
  FiChevronDown,
  FiFileText,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { postApi, categoryApi, subCategoryApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "http://localhost:3000";

const resolveAvatarUrl = (src) => {
  if (!src) return `${API_BASE}/avatars/default-avatar.jpg`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars"))
    return `${API_BASE}${src}`;
  if (src === "default-avatar.png" || src === "default-avatar.jpg")
    return `${API_BASE}/avatars/default-avatar.jpg`;
  return `${API_BASE}/avatars/${src}`;
};

const mapKnowledgeToCardData = (knowledge) => {
  if (!knowledge) return null;
  const author = knowledge.author || {};
  const rawMedia = Array.isArray(knowledge.media) ? knowledge.media : [];
  const media = rawMedia.map((m) => {
    const url = m.url?.startsWith("http") ? m.url : `${API_BASE}${m.url}`;
    return { ...m, url };
  });
  return {
    id: knowledge._id,
    authorId: author._id || author,
    userName: author.name || author.email || "?",
    userAvatar: author.profilePicture
      ? resolveAvatarUrl(author.profilePicture)
      : resolveAvatarUrl("default-avatar.jpg"),
    category: knowledge.category?.name || knowledge.category || "",
    subCategory: knowledge.subCategory?.name || knowledge.subCategory || "",
    time: knowledge.createdAt
      ? new Date(knowledge.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    content: knowledge.content || "",
    media,
    comments: knowledge.comments || [],
    commentCount: (knowledge.comments || []).length,
    shareCount: knowledge.shareCount ?? 0,
    canReact: knowledge.canReact,
    canModerate: knowledge.canModerate,
  };
};

const KnowledgePage = () => {
  const [searchParams] = useSearchParams();
  const knowledgeIdFromUrl = searchParams.get("knowledge") || null;
  const commentIdFromUrl = searchParams.get("comment") || null;
  const { user } = useAuth();
  const readOnly = user && user.status !== "active";
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubCategory, setFilterSubCategory] = useState("all");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [knowledgeRaw, setKnowledgeRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [viewFilter, setViewFilter] = useState("all");

  // Inputs optionnels (plus utilisés: on garde l'état simple pour éviter les erreurs)
  const [showCodeInput] = useState(false);
  const [showLinkInput] = useState(false);
  const [link] = useState("");

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const res = await postApi.getAll({ filter: viewFilter, type: "knowledge" });
      setKnowledgeRaw(res.data?.data ?? []);
    } catch {
      setKnowledgeRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledge();
  }, [viewFilter]);

  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data?.data ?? res.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  const handleCategoryChange = (e) => {
    const id = e.target.value;
    const selected = categories.find((c) => c._id === id);
    setCategory(selected?.name || "");
    setSubCategory("");
    setSubCategories([]);
    if (!id) return;
    subCategoryApi
      .getByCategory(id)
      .then((res) => setSubCategories(res.data?.data ?? res.data ?? []))
      .catch(() => setSubCategories([]));
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateKnowledge = async () => {
    const trimmed = (content || "").trim();
    if (!trimmed || !category) return;
    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("type", "knowledge");
      formData.append("content", trimmed);
      formData.append("category", category);
      if (subCategory) formData.append("subCategory", subCategory);
      files.forEach((f) => formData.append("media", f));
      await postApi.create(formData);
      setContent("");
      setFiles([]);
      await loadKnowledge();
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const knowledgeList = knowledgeRaw
    .map(mapKnowledgeToCardData)
    .filter(Boolean);

  const filteredKnowledge = knowledgeList.filter((item) => {
    const matchesSearch = item.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCat =
      filterCategory === "all" ? true : item.category === filterCategory;
    const matchesSubCat =
      filterSubCategory === "all"
        ? true
        : item.subCategory === filterSubCategory;
    return matchesSearch && matchesCat && matchesSubCat;
  });

  useEffect(() => {
    if (!knowledgeIdFromUrl || filteredKnowledge.length === 0) return;
    const timer1 = setTimeout(() => {
      const el = document.querySelector(
        `[data-knowledge-id="${knowledgeIdFromUrl}"]`,
      );
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    let timer2;
    if (commentIdFromUrl) {
      timer2 = setTimeout(() => {
        const el = document.querySelector(
          `[data-knowledge-id="${knowledgeIdFromUrl}"] [data-comment-id="${commentIdFromUrl}"]`,
        );
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 1400);
    }
    return () => {
      clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    };
  }, [knowledgeIdFromUrl, commentIdFromUrl, filteredKnowledge]);

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <NavbarLoggedIn />
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <main className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              {/* --- COMPOSER (With Source & Code logic) --- */}
              {!readOnly && (
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 uppercase tracking-tighter">
                      YC
                    </div>
                    <div className="flex-grow space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <select
                            value={
                              categories.find((c) => c.name === category)
                                ?._id || ""
                            }
                            onChange={handleCategoryChange}
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer uppercase tracking-tight"
                          >
                            <option value="">Category</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <div className="relative">
                          <select
                            value={subCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer uppercase tracking-tight"
                          >
                            <option value="">Sub Category</option>
                            {subCategories.map((sub) => (
                              <option key={sub._id} value={sub.name}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      <div className="relative bg-slate-50 rounded-[2rem] p-5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all border border-transparent">
                        <textarea
                          rows="3"
                          placeholder="Share your technical tip..."
                          className="w-full bg-transparent border-none focus:ring-0 text-md font-medium text-slate-700 placeholder:text-slate-400 resize-none"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />

                        {/* Pas de snippet ni de resource pour Knowledge (UI simplifiée) */}

                        {!!files.length && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {files.map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600"
                              >
                                <span className="max-w-40 truncate">
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(idx)}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <FiX size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
                          <div className="flex gap-2">
                            <input
                              type="file"
                              multiple
                              ref={fileInputRef}
                              onChange={handleFilesChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={handleChooseFiles}
                              className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                            >
                              <FiImage size={20} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleCreateKnowledge}
                            disabled={creating}
                            className="bg-indigo-600 text-white px-8 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {creating ? "Publishing..." : "Share"}{" "}
                            <FiSend size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {readOnly && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm font-bold text-center">
                  Mode lecture seule : un responsable doit activer votre compte
                  pour créer et réagir sur les connaissances.
                </div>
              )}

              {/* --- FILTER BAR --- */}
              <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-black text-slate-400">
                    Vue :
                  </span>
                  <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setViewFilter("all")}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                        viewFilter === "all"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      All Campus
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewFilter("friends")}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                        viewFilter === "friends"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Friends
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewFilter("my_campus")}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                        viewFilter === "my_campus"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      My Campus
                    </button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-grow w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="text"
                      placeholder="Search knowledge..."
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-slate-50 border-none rounded-xl px-4 py-3 text-[10px] font-black text-slate-500 uppercase cursor-pointer"
                    >
                      <option value="all">Categories</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                    </select>
                    <select
                      value={filterSubCategory}
                      onChange={(e) => setFilterSubCategory(e.target.value)}
                      className="bg-slate-50 border-none rounded-xl px-4 py-3 text-[10px] font-black text-slate-500 uppercase cursor-pointer"
                    >
                      <option value="all">Technologies</option>
                      <option value="React">React</option>
                      <option value="Node.js">Node.js</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* --- FEED --- */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                  <FiFileText /> Ma Bibliothèque ({filteredKnowledge.length})
                </div>
                {loading ? (
                  <div className="py-10 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Chargement de la knowledge...
                  </div>
                ) : filteredKnowledge.length ? (
                  filteredKnowledge.map((item) => (
                    <div key={item.id} data-knowledge-id={item.id}>
                      <KnowledgeCard
                        data={item}
                        readOnly={
                          readOnly ||
                          (user?.status === "active" &&
                            item.canReact === false &&
                            !item.canModerate)
                        }
                        onRefresh={loadKnowledge}
                        scrollToCommentId={
                          commentIdFromUrl && item.id === knowledgeIdFromUrl
                            ? commentIdFromUrl
                            : undefined
                        }
                        canModerate={item.canModerate}
                      />
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Aucune knowledge trouvée
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Messaging />
    </div>
  );
};
export default KnowledgePage;

