import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import PostCard from "../components/PostCard";
import Messaging from "../components/Messaging";
import { FiImage, FiVideo, FiSmile, FiSend, FiChevronDown } from "react-icons/fi";

const PostPage = () => {
  const [postContent, setPostContent] = useState("");
  const [category, setCategory] = useState("");

 const samplePosts = [
  {
    id: 1,
    user: { name: "fouad lamrini", avatar: "https://i.pravatar.cc/150?u=1" },
    time: "22h",
    isSolved: true, // ✅ Had l-post ghadi t-ban fih "Voir Detail"
    category: "Development",
    subCategory: "React.js",
    content: "j'ai probleme au niveau de hooks dans react",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    comments: [
      { 
        id: 101, 
        userName: "MOUSTAFA OUTERGA", 
        userRole: "Technicien Spécialisé", 
        text: "Try checking the dependency array in useEffect!", 
        time: "1h", 
        avatar: "https://i.pravatar.cc/150?u=5" 
      }
    ]
  },
  {
    id: 2,
    user: { name: "ibrahim lmlilas", avatar: "https://i.pravatar.cc/150?u=2" },
    time: "2h",
    isSolved: false, // 🔴 Had l-post ghadi i-ban fih "Not Solved"
    category: "Backend",
    subCategory: "Node.js",
    content: "Salam l-khout, wach kayna chi tari9a sahla ndir biha deployement dial Node.js f VPS?",
    image: null,
    comments: []
  }
];

 return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans overflow-hidden relative">
      {/* 1. Sidebar fixed left */}
      <Sidebar />
      
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* 2. Top Navbar */}
        <NavbarLoggedIn />
        
        {/* 3. Main Content Scroll Area */}
        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            
            {/* COMPOSER (New Post Input) */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg">
                  YC
                </div>
                <div className="flex-grow space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <select 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                      >
                        <option value="">Category</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all">
                        <option value="">Sub Category</option>
                        <option value="react">React</option>
                        <option value="node">Node.js</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="relative bg-slate-50 rounded-[2rem] p-4 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <textarea 
                      rows="3" 
                      placeholder="بم تفكر يا Fouad؟" 
                      className="w-full bg-transparent border-none focus:ring-0 text-right text-lg font-medium text-slate-800 placeholder:text-slate-400 resize-none" 
                      value={postContent} 
                      onChange={(e) => setPostContent(e.target.value)} 
                    />
                    <div className="flex items-center justify-between mt-2 border-t border-slate-200/50 pt-3">
                      <div className="flex gap-4 text-slate-400">
                        <button className="hover:text-amber-500 transition-colors"><FiSmile size={22} /></button>
                        <button className="hover:text-emerald-500 transition-colors"><FiImage size={22} /></button>
                        <button className="hover:text-red-500 transition-colors"><FiVideo size={22} /></button>
                      </div>
                      <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all">
                        Post <FiSend size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* POSTS LIST */}
            <div className="space-y-6">
              {samplePosts.map((singlePost) => (
                <PostCard 
                  key={singlePost.id}
                  post={singlePost} 
                />
              ))}
            </div>
            
          </div>
        </main>
      </div>

      {/* 4. FLOATING MESSAGING SYSTEM */}
      {/* Had l-component kikon fixed bottom-right b7al image 1, 2 w 3 */}
      <Messaging />

    </div>
  );
};

export default PostPage;