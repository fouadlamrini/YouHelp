import React, { useState } from "react";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import HeaderProfile from "../components/HeaderProfile";
import KnowledgeCard from "../components/KnowledgeCard";
import Messaging from "../components/Messaging";
import { 
  FiImage, FiCode, FiLink, FiSend, 
  FiChevronDown, FiFileText, FiSearch 
} from "react-icons/fi";

const KnowledgePage = () => {
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // States dyal l-Filter
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubCategory, setFilterSubCategory] = useState("all");

  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showResourceInput, setShowResourceInput] = useState(false);

  // Data m-updatya b les categories
  const [knowledgeList] = useState([
    {
      id: 1,
      userName: "Yassine Dev",
      userAvatar: "https://i.pravatar.cc/150?u=yassine",
      time: "2 hours ago",
      category: "Frontend",
      subCategory: "React",
      content: "Exploring how to use server components to fetch data directly on the server side.",
      mediaUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      snippet: "async function Page() {\n  const data = await db.fetch();\n  return <div>{data}</div>\n}",
      comments: []
    },
    {
      id: 2,
      userName: "Yassine Dev",
      userAvatar: "https://i.pravatar.cc/150?u=yassine",
      time: "5 hours ago",
      category: "Backend",
      subCategory: "Node.js",
      content: "How to handle middleware in Express.js efficiently.",
      mediaUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800",
      snippet: "app.use((req, res, next) => {\n  console.log('Time:', Date.now());\n  next();\n});",
      comments: []
    }
  ]);

  // Logic dyal Filtrage
  const filteredKnowledge = knowledgeList.filter((item) => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === "all" ? true : item.category === filterCategory;
    const matchesSubCat = filterSubCategory === "all" ? true : item.subCategory === filterSubCategory;
    return matchesSearch && matchesCat && matchesSubCat;
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans overflow-hidden relative">
      <NavbarLoggedIn />

      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          
          <HeaderProfile />

          <main className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              
              {/* --- COMPOSER (Add Knowledge) --- */}
              <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg">YC</div>
                  <div className="flex-grow space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer uppercase">
                          <option value="">Category</option>
                          <option value="Frontend">Frontend</option>
                          <option value="Backend">Backend</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      <div className="relative">
                        <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer uppercase">
                          <option value="">Sub Category</option>
                          <option value="React">React</option>
                          <option value="Node.js">Node.js</option>
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
                      {showCodeInput && (
                        <textarea placeholder="// Code here..." className="w-full mt-4 p-5 bg-[#0B1222] rounded-2xl text-[13px] font-mono text-indigo-300 outline-none border border-slate-800" rows="5" />
                      )}
                      <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
                        <div className="flex gap-2">
                          <button onClick={() => setShowCodeInput(!showCodeInput)} className={`p-2 rounded-xl transition-all ${showCodeInput ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}><FiCode size={20} /></button>
                          <button onClick={() => setShowResourceInput(!showResourceInput)} className={`p-2 rounded-xl transition-all ${showResourceInput ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}><FiLink size={20} /></button>
                        </div>
                        <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2">
                          Share <FiSend size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- FILTER BAR (The View You Wanted) --- */}
              <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input 
                    type="text" 
                    placeholder="Search your library..." 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <select 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-50 border-none rounded-xl px-4 py-3 text-[10px] font-black text-slate-500 uppercase focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Toutes Catégories</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                  </select>

                  <select 
                    onChange={(e) => setFilterSubCategory(e.target.value)}
                    className="bg-slate-50 border-none rounded-xl px-4 py-3 text-[10px] font-black text-slate-500 uppercase focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Toutes Technologies</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                  </select>
                </div>
              </div>

              {/* --- FEED --- */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                    <FiFileText /> Ma Bibliothèque ({filteredKnowledge.length})
                  </div>
                </div>

                {filteredKnowledge.length > 0 ? (
                  filteredKnowledge.map((item) => (
                    <KnowledgeCard key={item.id} data={item} />
                  ))
                ) : (
                  <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Aucune connaissance trouvée</p>
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