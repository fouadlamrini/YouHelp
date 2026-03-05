import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import PostCard from "../components/PostCard";
import Messaging from "../components/Messaging";
import { 
  FiImage, FiVideo, FiSmile, FiSend, FiX,
  FiChevronDown, FiSearch, FiCheckCircle, FiClock, FiGrid
} from "react-icons/fi";
import { postApi, categoryApi, subcategoryApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const EMOJI_LIST = ["😀","😃","😄","😁","🎉","👍","❤️","🔥","😂","🤣","✅","❌","👋","🙏","💪","👏","😊","🥳","😎","🤔","💡","📌","⭐","🎯"];

const PostPage = () => {
  const { user } = useAuth();
  const readOnly = user && user.status !== "active";
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // --- States dyal l-Post ---
  const [postContent, setPostContent] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // --- States dyal l-Filtre ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [subCatFilter, setSubCatFilter] = useState("all");
  const [postViewFilter, setPostViewFilter] = useState("all");

  const loadMeta = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        categoryApi.getAll(),
        subcategoryApi.getAll(),
      ]);
      setCategories(catRes.data?.data ?? []);
      setSubcategories(subRes.data?.data ?? []);
    } catch {
      setCategories([]);
      setSubcategories([]);
    }
  };

  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await postApi.getAll({ filter: postViewFilter });
      setPosts(res.data?.data ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [postViewFilter]);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeMediaFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = postContent.slice(0, start);
      const after = postContent.slice(end);
      setPostContent(before + emoji + after);
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
    } else {
      setPostContent((prev) => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() || !category) return;
    const formData = new FormData();
    formData.append("content", postContent.trim());
    formData.append("category", category);
    if (subCategory) formData.append("subCategory", subCategory);
    mediaFiles.forEach((file) => formData.append("media", file));
    try {
      await postApi.create(formData);
      setPostContent("");
      setSubCategory("");
      setMediaFiles([]);
      await loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Logic dyal l-Filtrage ---
  const filteredPosts = posts.filter((post) => {
    const content = (post.content || "").toLowerCase();
    const matchesSearch = content.includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" ? true : 
      statusFilter === "solved" ? post.isSolved : !post.isSolved;
    const catName = post.category?.name || post.category;
    const subName = post.subCategory?.name || post.subCategory;
    const matchesCat = catFilter === "all" ? true : catName === catFilter;
    const matchesSubCat = subCatFilter === "all" ? true : subName === subCatFilter;

    return matchesSearch && matchesStatus && matchesCat && matchesSubCat;
  });

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans overflow-hidden relative">
      <Sidebar />

      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            
      

        
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 space-y-4">
              {/* Filtres vue: All Campus / Friends / My Campus */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 self-center">Vue :</span>
                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPostViewFilter("all")}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${postViewFilter === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    All Campus
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostViewFilter("friends")}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${postViewFilter === "friends" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Friends
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostViewFilter("my_campus")}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${postViewFilter === "my_campus" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    My Campus
                  </button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-grow">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Rechercher un problème..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Status Filter (Solved / Not Solved) */}
                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${statusFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Tous
                  </button>
                  <button 
                    onClick={() => setStatusFilter("solved")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${statusFilter === 'solved' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-emerald-500'}`}
                  >
                    <FiCheckCircle /> Solved
                  </button>
                  <button 
                    onClick={() => setStatusFilter("notSolved")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${statusFilter === 'notSolved' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    <FiClock /> Not Solved
                  </button>
                </div>
              </div>

              {/* Category & SubCategory Filters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select 
                    value={catFilter}
                    onChange={(e) => setCatFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl text-[10px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Toutes les Catégories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select 
                    value={subCatFilter}
                    onChange={(e) => setSubCatFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl text-[10px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Sous-catégories</option>
                    {subcategories.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {readOnly && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm font-bold text-center">
                Mode lecture seule : un responsable doit activer votre compte pour créer des posts et réagir.
              </div>
            )}

            {/* 3. SECTION CREATE POST */}
            {!readOnly && (
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg">YC</div>
                <div className="flex-grow space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">Sub Category</option>
                        {subcategories
                          .filter((s) => !category || s.category?.name === category)
                          .map((s) => (
                            <option key={s._id} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div className="relative bg-slate-50 rounded-[2rem] p-4 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <textarea
                      ref={textareaRef}
                      rows="3"
                      placeholder={user ? `À quoi pensez-vous, ${user.name} ?` : "À quoi pensez-vous ?"}
                      className="w-full bg-transparent border-none focus:ring-0 text-left text-lg font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                    {mediaFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-slate-600">
                        {mediaFiles.map((file, index) => (
                          <span
                            key={`${file.name}-${file.size}-${index}`}
                            className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5"
                          >
                            {file.type.startsWith("image")
                              ? "🖼 "
                              : file.type.startsWith("video")
                              ? "🎬 "
                              : file.type === "application/pdf"
                              ? "📄 "
                              : "📎 "}
                            <span className="max-w-[120px] truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeMediaFile(index)}
                              className="text-slate-400 hover:text-red-500 p-0.5 rounded-full"
                            >
                              <FiX size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 border-t border-slate-200/50 pt-3 relative">
                      <div className="flex gap-4 text-slate-400">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker((v) => !v)}
                          className={`hover:text-amber-500 transition-colors ${showEmojiPicker ? "text-amber-500" : ""}`}
                        >
                          <FiSmile size={22} />
                        </button>
                        {showEmojiPicker && (
                          <>
                            <div className="absolute left-0 bottom-full mb-2 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 max-w-[280px]">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Choisir un emoji</p>
                              <div className="grid grid-cols-6 gap-1">
                                {EMOJI_LIST.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => insertEmoji(emoji)}
                                    className="text-xl hover:bg-slate-100 rounded-lg p-1"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} aria-hidden />
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="hover:text-emerald-500 transition-colors flex items-center"
                        >
                          <FiImage size={22} />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="hover:text-red-500 transition-colors flex items-center"
                        >
                          <FiVideo size={22} />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*,application/pdf"
                          className="hidden"
                          onChange={handleMediaChange}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCreatePost}
                        className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-md disabled:opacity-50"
                        disabled={!postContent.trim() || !category}
                      >
                        Post <FiSend size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* 4. POSTS LIST */}
            <div className="space-y-6">
              {loadingPosts ? (
                <div className="py-10 text-center bg-white rounded-[2.5rem] border border-slate-100 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                  Chargement des posts...
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((singlePost) => (
                  <PostCard
                    key={singlePost._id || singlePost.id}
                    post={singlePost}
                    onRefresh={loadPosts}
                    readOnly={readOnly || (user?.status === "active" && singlePost.canReact === false)}
                  />
                ))
              ) : (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Aucun post ne correspond à vos filtres</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      <Messaging />
    </div>
  );
};

export default PostPage;