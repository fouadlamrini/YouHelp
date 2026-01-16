import React, { useState } from "react";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import KnowledgeCard from "../components/KnowledgeCard";
import Messaging from "../components/Messaging";
import Sidebar from "../components/Sidebar";
import { FiImage, FiCode, FiLink, FiSend, FiChevronDown, FiFileText, FiSearch, FiX } from "react-icons/fi";

const KnowledgePage = () => {
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubCategory, setFilterSubCategory] = useState("all");

  // Input states for Composer
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [link, setLink] = useState("");

  const [knowledgeList] = useState([
    { id: 1, userName: "Yassine Dev", userAvatar: "https://i.pravatar.cc/150?u=y", time: "2h ago", category: "Frontend", subCategory: "React", content: "Kifach t-asta3mel 'useOptimistic' hook f Next.js 15.", mediaUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800", snippet: "const [state, update] = useOptimistic(s, u);" },
    { id: 2, userName: "Anas Backend", userAvatar: "https://i.pravatar.cc/150?u=a", time: "5h ago", category: "Backend", subCategory: "Node.js", content: "Trick bach t-secure l-API dyalk b Redis.", snippet: "const limiter = rateLimit({ windowMs: 15 * 60 * 1000 });" },
    { id: 3, userName: "Sarah UI", userAvatar: "https://i.pravatar.cc/150?u=s", time: "1d ago", category: "Design", subCategory: "Tailwind CSS", content: "Glassmorphism effect b Tailwind.", snippet: "className='bg-white/30 backdrop-blur-md'" }
  ]);

  const filteredKnowledge = knowledgeList.filter((item) => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === "all" ? true : item.category === filterCategory;
    const matchesSubCat = filterSubCategory === "all" ? true : item.subCategory === filterSubCategory;
    return matchesSearch && matchesCat && matchesSubCat;
  });

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <NavbarLoggedIn />
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <main className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              
              {/* --- COMPOSER (With Source & Code logic) --- */}
              <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 uppercase tracking-tighter">YD</div>
                  <div className="flex-grow space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer uppercase tracking-tight">
                          <option value="">Category</option>
                          <option value="Frontend">Frontend</option>
                          <option value="Backend">Backend</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      <div className="relative">
                        <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer uppercase tracking-tight">
                          <option value="">Sub Category</option>
                          <option value="React">React</option>
                          <option value="Node.js">Node.js</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div className="relative bg-slate-50 rounded-[2rem] p-5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all border border-transparent">
                      <textarea rows="3" placeholder="Share your technical tip..." className="w-full bg-transparent border-none focus:ring-0 text-md font-medium text-slate-700 placeholder:text-slate-400 resize-none" value={content} onChange={(e) => setContent(e.target.value)} />
                      
                      {/* SOURCE LINK INPUT */}
                      {showLinkInput && (
                        <div className="mt-3 flex items-center gap-2 bg-white border border-slate-200 p-2 px-4 rounded-xl">
                          <FiLink className="text-emerald-500" />
                          <input type="text" placeholder="https://source-link.com" className="flex-1 bg-transparent border-none text-xs focus:ring-0 font-bold text-slate-600" value={link} onChange={(e) => setLink(e.target.value)} />
                          <button onClick={() => setShowLinkInput(false)}><FiX className="text-slate-400" /></button>
                        </div>
                      )}

                      {/* CODE SNIPPET INPUT */}
                      {showCodeInput && (
                        <textarea placeholder="// Paste code snippet here..." className="w-full mt-4 p-5 bg-[#0B1222] rounded-2xl text-[13px] font-mono text-indigo-300 outline-none border border-slate-800" rows="5" />
                      )}
                      
                      <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
                        <div className="flex gap-2">
                          <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><FiImage size={20} /></button>
                          <button onClick={() => setShowCodeInput(!showCodeInput)} className={`p-2.5 rounded-xl transition-all ${showCodeInput ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}><FiCode size={20} /></button>
                          <button onClick={() => setShowLinkInput(!showLinkInput)} className={`p-2.5 rounded-xl transition-all ${showLinkInput ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}><FiLink size={20} /></button>
                        </div>
                        <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2">
                          Share <FiSend size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- FILTER BAR --- */}
              <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input type="text" placeholder="Search knowledge..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-[10px] font-black text-slate-500 uppercase cursor-pointer">
                    <option value="all">Categories</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                  </select>
                  <select value={filterSubCategory} onChange={(e) => setFilterSubCategory(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-[10px] font-black text-slate-500 uppercase cursor-pointer">
                    <option value="all">Technologies</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                  </select>
                </div>
              </div>

              {/* --- FEED --- */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                  <FiFileText /> Ma Bibliothèque ({filteredKnowledge.length})
                </div>
                {filteredKnowledge.map((item) => (
                  <KnowledgeCard key={item.id} data={item} />
                ))}
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