import React, { useEffect, useRef, useState } from "react";
import NavbarLoggedIn from "../../components/NavbarLoggedIn";
import HeaderProfile from "../../components/HeaderProfile";
import KnowledgeCard from "../../components/KnowledgeCard";
import Messaging from "../../components/Messaging";
import Sidebar from "../../components/Sidebar"; 
import { 
  FiImage, FiSend, 
  FiChevronDown, FiFileText, FiSearch, FiX 
} from "react-icons/fi";
import { API_BASE, postApi, categoryApi, subCategoryApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const resolveAvatarUrl = (src) => {
  if (!src) return `${API_BASE}/avatars/default-avatar.jpg`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_BASE}${src}`;
  if (src === "default-avatar.png" || src === "default-avatar.jpg") return `${API_BASE}/avatars/default-avatar.jpg`;
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
    userName: author.name || author.email || "?",
    userAvatar: author.profilePicture ? resolveAvatarUrl(author.profilePicture) : resolveAvatarUrl("default-avatar.jpg"),
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
  };
};

const MyKnowledge = () => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubCategory, setFilterSubCategory] = useState("all");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  const [showCodeInput] = useState(false);
  const [showResourceInput] = useState(false);
  const [knowledgeRaw, setKnowledgeRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const res = await postApi.getAll({ type: "knowledge" });
      const all = res.data?.data ?? [];
      const myId = user?.id || user?._id;
      const mine = myId
        ? all.filter((k) => (k.author?._id || k.author)?.toString() === myId.toString())
        : [];
      setKnowledgeRaw(mine);
    } catch {
      setKnowledgeRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledge();
  }, []);

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

  const knowledgeList = knowledgeRaw.map(mapKnowledgeToCardData).filter(Boolean);

  const filteredKnowledge = knowledgeList.filter((item) => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === "all" ? true : item.category === filterCategory;
    const matchesSubCat = filterSubCategory === "all" ? true : item.subCategory === filterSubCategory;
    return matchesSearch && matchesCat && matchesSubCat;
  });

  return (
    // Flex h-screen kat-khalli l-page kamla t-ched l-ecran o mat-kounch skorable 3la berra
    <div className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden">
      
      {/* 1. Sidebar Fixe (kheddam f l-lissar) */}
      <Sidebar />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Navbar l-foq */}
        <NavbarLoggedIn />

        {/* Blast l-scroll l-li fiha l-feed */}
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          
          {/* Header Profile (Facebook Style) */}
          <HeaderProfile />

          <main className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              
              {/* COMPOSER (Add Knowledge) */}
              <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 uppercase">
                    YC
                  </div>

                  <div className="flex-grow space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <select
                          value={categories.find((c) => c.name === category)?._id || ""}
                          onChange={handleCategoryChange}
                          className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all uppercase"
                        >
                          <option value="">Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all uppercase"
                        >
                          <option value="">Sub Category</option>
                          {subCategories.map((sub) => (
                            <option key={sub._id} value={sub.name}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="relative bg-slate-50 rounded-[2rem] p-5 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                      <textarea 
                        rows="3" 
                        placeholder="Partagez une astuce technique..." 
                        className="w-full bg-transparent border-none focus:ring-0 text-md font-medium text-slate-700 placeholder:text-slate-400 resize-none" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                      />

                      {/* Pas de snippet ni de resource pour Knowledge (UI simplifiée) */}

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
                            className="p-2 text-slate-400 hover:bg-white hover:shadow-sm rounded-xl transition-all"
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
                          {creating ? "Publication..." : "Publier"} <FiSend size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FILTER BAR */}
              <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative text-indigo-600">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Chercher dans ma bibliothèque de connaissances..." 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-slate-50 border-none rounded-xl px-4 py-3 text-[10px] font-black text-slate-500 uppercase focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">Catégorie</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                    </select>
                    <select 
                      onChange={(e) => setFilterSubCategory(e.target.value)}
                      className="bg-slate-50 border-none rounded-xl px-4 py-3 text-[10px] font-black text-slate-500 uppercase focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">Technologie</option>
                      <option value="React">React</option>
                      <option value="Node.js">Node.js</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* FEED */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-4 mb-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                  <FiFileText /> Ma Bibliothèque ({filteredKnowledge.length})
                </div>
                {loading ? (
                  <div className="py-10 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Chargement de mes connaissances...
                  </div>
                ) : filteredKnowledge.length ? (
                  filteredKnowledge.map((item) => (
                    <KnowledgeCard key={item.id} data={item} />
                  ))
                ) : (
                  <div className="py-10 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Aucune connaissance trouvée
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Messaging Panel (kayban foq l-kol wlla f l-limen 3la hssab kifach m-codi) */}
      <Messaging />
    </div>
  );
};

export default MyKnowledge;

