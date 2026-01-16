import React, { useState } from "react";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import HeaderProfile from "../components/HeaderProfile";
import KnowledgeCard from "../components/KnowledgeCard";
import Messaging from "../components/Messaging";
import Sidebar from "../components/Sidebar"; 
import { 
  FiImage, FiCode, FiLink, FiSend, 
  FiChevronDown, FiFileText, FiSearch 
} from "react-icons/fi";

const MyKnowledge = () => {
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubCategory, setFilterSubCategory] = useState("all");
  
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showResourceInput, setShowResourceInput] = useState(false);

  const [knowledgeList] = useState([
    {
      id: 1,
      userName: "Fouad Lamrini",
      userAvatar: "https://i.pravatar.cc/150?u=youcoder",
      time: "2 hours ago",
      category: "Frontend",
      subCategory: "React",
      content: "Exploring how to use server components to fetch data directly on the server side for better performance.",
      mediaUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      snippet: "async function Page() {\n  const data = await db.fetch();\n  return <div>{data}</div>\n}",
      comments: []
    }
  ]);

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
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 uppercase">FL</div>

                  <div className="flex-grow space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all uppercase">
                          <option value="">Category</option>
                          <option value="frontend">Frontend</option>
                          <option value="backend">Backend</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all uppercase">
                          <option value="">Sub Category</option>
                          <option value="react">React</option>
                          <option value="node">Node.js</option>
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

                      {showCodeInput && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                          <textarea 
                            placeholder="// Collez votre code ici..." 
                            className="w-full p-5 bg-[#0B1222] rounded-2xl text-[13px] font-mono text-indigo-300 outline-none border border-slate-800 shadow-inner"
                            rows="5"
                          />
                        </div>
                      )}

                      {showResourceInput && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                            <FiLink className="text-indigo-500 mr-2" size={18} />
                            <input type="url" placeholder="Lien vers la documentation..." className="w-full text-sm font-bold text-slate-700 outline-none" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-400 hover:bg-white hover:shadow-sm rounded-xl transition-all"><FiImage size={20} /></button>
                          <button onClick={() => setShowCodeInput(!showCodeInput)} className={`p-2 rounded-xl transition-all ${showCodeInput ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:shadow-sm'}`}><FiCode size={20} /></button>
                          <button onClick={() => setShowResourceInput(!showResourceInput)} className={`p-2 rounded-xl transition-all ${showResourceInput ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:shadow-sm'}`}><FiLink size={20} /></button>
                        </div>
                        <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2">
                          Publier <FiSend size={16} />
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
                {filteredKnowledge.map((item) => (
                  <KnowledgeCard key={item.id} data={item} />
                ))}
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