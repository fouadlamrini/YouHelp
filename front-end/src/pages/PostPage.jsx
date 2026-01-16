import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import PostCard from "../components/PostCard";
import Messaging from "../components/Messaging";
import Welcome from "../components/Welcome";
import { 
  FiImage, FiVideo, FiSmile, FiSend, 
  FiChevronDown, FiSearch, FiCheckCircle, FiClock, FiGrid
} from "react-icons/fi";

const PostPage = () => {
  // --- States dyal l-Post ---
  const [postContent, setPostContent] = useState("");
  const [category, setCategory] = useState("");

  // --- States dyal l-Filtre ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "solved", "notSolved"
  const [catFilter, setCatFilter] = useState("all");
  const [subCatFilter, setSubCatFilter] = useState("all");

  const samplePosts = [
    {
      id: 1,
      user: { name: "fouad lamrini", avatar: "https://i.pravatar.cc/150?u=1" },
      time: "22h",
      isSolved: true,
      category: "frontend",
      subCategory: "react",
      content: "j'ai probleme au niveau de hooks dans react",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      comments: [{ id: 101, userName: "MOUSTAFA OUTERGA", text: "Check dependency array!", avatar: "https://i.pravatar.cc/150?u=5" }]
    },
    {
      id: 2,
      user: { name: "ibrahim lmlilas", avatar: "https://i.pravatar.cc/150?u=2" },
      time: "2h",
      isSolved: false,
      category: "backend",
      subCategory: "node",
      content: "Salam l-khout, wach kayna chi tari9a sahla ndir biha deployement dial Node.js f VPS?",
      image: null,
      comments: []
    }
  ];

  // --- Logic dyal l-Filtrage ---
  const filteredPosts = samplePosts.filter((post) => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" ? true : 
      statusFilter === "solved" ? post.isSolved : !post.isSolved;
    const matchesCat = catFilter === "all" ? true : post.category === catFilter;
    const matchesSubCat = subCatFilter === "all" ? true : post.subCategory === subCatFilter;

    return matchesSearch && matchesStatus && matchesCat && matchesSubCat;
  });

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans overflow-hidden relative">
      <Sidebar />

      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            
            {/* 1. SECTION WELCOME */}
            <Welcome userName="Fouad" />

            {/* 2. SECTION FILTERS (Mabin Welcome o Creation) */}
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 space-y-4">
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
                    onChange={(e) => setCatFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl text-[10px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Toutes les Catégories</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select 
                    onChange={(e) => setSubCatFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl text-[10px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Sous-catégories</option>
                    <option value="react">React.js</option>
                    <option value="node">Node.js</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3. SECTION CREATE POST */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg">YC</div>
                <div className="flex-grow space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div className="relative">
                      <select onChange={(e) => setCategory(e.target.value)} className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                        <option value="">Category</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                        <option value="">Sub Category</option>
                        <option value="react">React</option>
                        <option value="node">Node.js</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div className="relative bg-slate-50 rounded-[2rem] p-4 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <textarea rows="3" placeholder="À quoi pensez-vous, Fouad ?" className="w-full bg-transparent border-none focus:ring-0 text-left text-lg font-medium text-slate-800 placeholder:text-slate-400 resize-none" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
                    <div className="flex items-center justify-between mt-2 border-t border-slate-200/50 pt-3">
                      <div className="flex gap-4 text-slate-400">
                        <button className="hover:text-amber-500 transition-colors"><FiSmile size={22} /></button>
                        <button className="hover:text-emerald-500 transition-colors"><FiImage size={22} /></button>
                        <button className="hover:text-red-500 transition-colors"><FiVideo size={22} /></button>
                      </div>
                      <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-md">Post <FiSend size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. POSTS LIST */}
            <div className="space-y-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((singlePost) => (
                  <PostCard key={singlePost.id} post={singlePost} />
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