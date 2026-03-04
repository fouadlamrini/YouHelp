import React, { useState, useEffect } from "react";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import HeaderProfile from "../components/HeaderProfile";
import PostCard from "../components/PostCard";
import KnowledgeCard from "../components/KnowledgeCard";
import Messaging from "../components/Messaging";
import Sidebar from "../components/Sidebar";
import { FiSearch, FiStar, FiTrendingUp } from "react-icons/fi";
import { favoritesApi } from "../services/api";

const API_BASE = "http://localhost:3000";

const resolveAvatarUrl = (src) => {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_BASE}${src}`;
  if (src === "default-avatar.png" || src === "default-avatar.jpg") return `${API_BASE}/avatars/default-avatar.jpg`;
  return `${API_BASE}/avatars/${src}`;
};

const mapKnowledgeToCardData = (knowledge) => {
  if (!knowledge) return null;
  const author = knowledge.author || {};
  const firstImage = knowledge.media?.find((m) => m.type === "image");
  let mediaUrl = firstImage?.url || "";
  if (mediaUrl && !mediaUrl.startsWith("http")) mediaUrl = `${API_BASE}${mediaUrl}`;
  return {
    id: knowledge._id,
    userName: author.name || author.email || "?",
    userAvatar: author.profilePicture ? resolveAvatarUrl(author.profilePicture) : resolveAvatarUrl("default-avatar.jpg"),
    category: knowledge.category?.name || knowledge.category || "",
    subCategory: knowledge.subCategory?.name || knowledge.subCategory || "",
    time: knowledge.createdAt ? new Date(knowledge.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "",
    content: knowledge.content || "",
    mediaUrl: mediaUrl || "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800",
    snippet: (knowledge.snippet && (typeof knowledge.snippet === "string" ? knowledge.snippet : knowledge.snippet.code)) || "// No snippet",
    comments: knowledge.comments || [],
  };
};

const MyFavorites = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = () => {
    setLoading(true);
    favoritesApi
      .getMine({ limit: 100 })
      .then((res) => setFavorites(res.data?.data?.favorites || []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const favoritePosts = favorites.filter((f) => f.post).map((f) => f.post);
  const favoriteKnowledge = favorites.filter((f) => f.knowledge).map((f) => f.knowledge);

  const filteredPosts = favoritePosts.filter((post) =>
    (post.content || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredKnowledge = favoriteKnowledge.filter((k) =>
    (k.content || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <HeaderProfile />

          <main className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
              <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher dans mes favoris..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                  Chargement des favoris...
                </div>
              ) : (
                <>
                  {filteredKnowledge.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-4">
                        <FiStar className="text-amber-400 fill-amber-400" size={16} />
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Snippets & Knowledge</h2>
                      </div>
                      {filteredKnowledge.map((k) => {
                        const data = mapKnowledgeToCardData(k);
                        if (!data) return null;
                        return (
                          <KnowledgeCard
                            key={k._id}
                            data={data}
                            isFavorite={true}
                            onFavoriteClick={() => {
                              favoritesApi.remove({ contentType: "knowledge", contentId: k._id }).then(loadFavorites).catch(() => {});
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {filteredPosts.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-4">
                        <FiTrendingUp className="text-indigo-500" size={16} />
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Questions & Problems</h2>
                      </div>
                      {filteredPosts.map((post) => (
                        <PostCard key={post._id} post={post} onRefresh={loadFavorites} />
                      ))}
                    </div>
                  )}

                  {!loading && filteredPosts.length === 0 && filteredKnowledge.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                      <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucun favori trouvé</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <Messaging />
    </div>
  );
};

export default MyFavorites;
