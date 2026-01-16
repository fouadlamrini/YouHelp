import React, { useState } from "react";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import HeaderProfile from "../components/HeaderProfile"; 
import PostCard from "../components/PostCard";
import KnowledgeCard from "../components/KnowledgeCard";
import Messaging from "../components/Messaging";
import Sidebar from "../components/Sidebar"; 
import { FiSearch, FiStar, FiTrendingUp } from "react-icons/fi";

const MyFavorites = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const dataPosts = [
    {
      id: "p1",
      user: { name: "lahcen ouirghan", avatar: "https://i.pravatar.cc/150?u=1" },
      time: "22h",
      isSolved: true,
      category: "Development",
      subCategory: "Java",
      content: "J'ai un problème au niveau des hooks dans React, quelqu'un peut m'aider ?",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      comments: []
    }
  ];

  const dataKnowledge = [
    {
      id: "k1",
      userName: "Anas Hamaoui",
      userAvatar: "https://i.pravatar.cc/150?u=9",
      time: "5h",
      category: "Frontend",
      subCategory: "React JS",
      content: "Trick dyal kifach t-asta3mel Tailwind CSS m3a Framer Motion.",
      mediaUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800",
      snippet: "const Animation = () => {\n  return (\n    <motion.div whileHover={{ scale: 1.1 }} />\n  );\n};",
      comments: []
    }
  ];

  const filteredPosts = dataPosts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKnowledge = dataKnowledge.filter(item => 
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden">
      {/* 1. Sidebar on the left */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar inside the content area to stay aligned */}
        <NavbarLoggedIn />

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <HeaderProfile />

          <main className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
              
              {/* --- SEARCH BAR --- */}
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

              {/* --- KNOWLEDGE SECTION --- */}
              {filteredKnowledge.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-4">
                    <FiStar className="text-amber-400 fill-amber-400" size={16} />
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Snippets & Knowledge</h2>
                  </div>
                  {filteredKnowledge.map((item) => (
                    <KnowledgeCard key={item.id} data={item} />
                  ))}
                </div>
              )}

              {/* --- POSTS SECTION --- */}
              {filteredPosts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-4">
                    <FiTrendingUp className="text-indigo-500" size={16} />
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Questions & Problems</h2>
                  </div>
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}

              {/* --- EMPTY STATE --- */}
              {filteredPosts.length === 0 && filteredKnowledge.length === 0 && (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucun favori trouvé</p>
                </div>
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