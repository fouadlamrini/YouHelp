import React, { useEffect, useRef, useState } from "react";
import NavbarLoggedIn from "../../components/NavbarLoggedIn";
import HeaderProfile from "../../components/HeaderProfile";
import PostCard from "../../components/PostCard";
import KnowledgeCard from "../../components/KnowledgeCard";
import Messaging from "../../components/Messaging";
import Sidebar from "../../components/SideBar";
import { postApi } from "../../services/api";

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
  };
};

const MyShares = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadShares = async () => {
    try {
      setLoading(true);
      const res = await postApi.getMyShares();
      const data = res.data?.data ?? [];
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
  }, []);

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <NavbarLoggedIn />
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <HeaderProfile />
          <main className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              <div className="space-y-6">
                {loading ? (
                  <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-[10px] font-black text-slate-400 tracking-[0.2em]">
                    Chargement de mes partages...
                  </div>
                ) : items.length > 0 ? (
                  items.map((item) => {
                    if (item.post) {
                      return (
                        <PostCard
                          key={item._id}
                          post={item.post}
                          sharedInfo={{ id: item._id, sharedAt: item.sharedAt }}
                          onRefresh={loadShares}
                        />
                      );
                    }
                    if (item.knowledge) {
                      const mapped = mapKnowledgeToCardData(item.knowledge);
                      if (!mapped) return null;
                      return (
                        <KnowledgeCard
                          key={item._id}
                          data={mapped}
                          onRefresh={loadShares}
                        />
                      );
                    }
                    return null;
                  })
                ) : (
                  <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                      Aucun partage pour le moment
                    </p>
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

export default MyShares;

