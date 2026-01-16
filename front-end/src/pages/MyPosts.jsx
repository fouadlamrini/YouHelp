import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import PostCard from "../components/PostCard";
import Messaging from "../components/Messaging";
import { 
  FiSearch, FiFilter, FiChevronDown, FiCheckCircle, FiXCircle 
} from "react-icons/fi";

const MyPost = () => {
  // 1. States dyal les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSolved, setFilterSolved] = useState("all"); // "all", "solved", "notSolved"
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubCategory, setFilterSubCategory] = useState("all");

  const samplePosts = [
    {
      id: 1,
      user: { name: "fouad lamrini", avatar: "https://i.pravatar.cc/150?u=1" },
      time: "22h",
      isSolved: true,
      category: "Development",
      subCategory: "React.js",
      content: "j'ai probleme au niveau de hooks dans react",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      comments: [{ id: 101, userName: "fouad lamrini", text: "Try checking dependencies!", avatar: "https://i.pravatar.cc/150?u=5" }]
    },
    {
      id: 2,
      user: { name: "fouad lamrini", avatar: "https://i.pravatar.cc/150?u=2" },
      time: "2h",
      isSolved: false,
      category: "Backend",
      subCategory: "Node.js",
      content: "Salam l-khout, wach kayna chi tari9a sahla ndir biha deployement dial Node.js f VPS?",
      image: null,
      comments: []
    }
  ];

  // 2. Logic dyal l-Filtrage
  const filteredPosts = samplePosts.filter((post) => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSolved = 
      filterSolved === "all" ? true : 
      filterSolved === "solved" ? post.isSolved : !post.isSolved;
    const matchesCat = filterCategory === "all" ? true : post.category === filterCategory;
    const matchesSubCat = filterSubCategory === "all" ? true : post.subCategory === filterSubCategory;

    return matchesSearch && matchesSolved && matchesCat && matchesSubCat;
  });

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans overflow-hidden relative">
      <Sidebar />

      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            
            {/* --- FILTER BAR --- */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-grow relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Rechercher dans mes posts..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter (Solved/Not Solved) */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFilterSolved("all")}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${filterSolved === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400'}`}
                  >
                    Tous
                  </button>
                  <button 
                    onClick={() => setFilterSolved("solved")}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${filterSolved === 'solved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400'}`}
                  >
                    <FiCheckCircle /> Résolus
                  </button>
                  <button 
                    onClick={() => setFilterSolved("notSolved")}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${filterSolved === 'notSolved' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-slate-50 text-slate-400'}`}
                  >
                    <FiXCircle /> Non Résolus
                  </button>
                </div>
              </div>

              {/* Category & SubCategory Selects */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="relative">
                  <select 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl text-[10px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Toutes Catégories</option>
                    <option value="Development">Development</option>
                    <option value="Backend">Backend</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="relative">
                  <select 
                    onChange={(e) => setFilterSubCategory(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl text-[10px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Sous-catégories</option>
                    <option value="React.js">React.js</option>
                    <option value="Node.js">Node.js</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* --- POSTS LIST --- */}
            <div className="space-y-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((singlePost) => (
                  <PostCard key={singlePost.id} post={singlePost} />
                ))
              ) : (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucun post ne correspond à vos filtres</p>
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

export default MyPost;