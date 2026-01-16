import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import KnowledgeCard from "../components/KnowledgeCard";
import { 
  FiImage, FiCode, FiLink, FiSend, 
  FiChevronDown, FiFileText 
} from "react-icons/fi";

const MyKnowledge = () => {
  const [content, setContent] = useState("");
  // States bach n-controli l-visiblity dial l-inputs
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showResourceInput, setShowResourceInput] = useState(false);

  // Data dial l-feed
  const [knowledgeList] = useState([
    {
      id: 1,
      userName: "Yassine Dev",
      userAvatar: "https://i.pravatar.cc/150?u=yassine",
      time: "2 hours ago",
      isSolved: true,
      category: "Frontend",
      subCategory: "React",
      content: "Exploring how to use server components to fetch data directly on the server side for better performance.",
      mediaUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      snippet: "async function Page() {\n  const data = await db.fetch();\n  return <div>{data}</div>\n}",
      comments: [
        {
          id: 101,
          userName: "Sara Collins",
          userRole: "Senior React Developer",
          avatar: "https://i.pravatar.cc/150?u=sara",
          time: "1h",
          text: "This is a game changer for SEO and performance!"
        }
      ]
    }
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <NavbarLoggedIn />
        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            
            {/* --- COMPOSER (Add Knowledge) --- */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg">YC</div>

                <div className="flex-grow space-y-4">
                  {/* Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all uppercase">
                        <option value="">Category</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all uppercase">
                        <option value="">Sub Category</option>
                        <option value="react">React</option>
                        <option value="node">Node.js</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Textarea Main Content */}
                  <div className="relative bg-slate-50 rounded-[2rem] p-5 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <textarea 
                      rows="3" 
                      placeholder="Share your technical tip..." 
                      className="w-full bg-transparent border-none focus:ring-0 text-md font-medium text-slate-700 placeholder:text-slate-400 resize-none" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                    />

                    {/* 1. Snippet Code Input (iky-ban fach t-cliki 3la <>) */}
                    {showCodeInput && (
                      <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                        <textarea 
                          placeholder="// Paste your code snippet here..." 
                          className="w-full p-5 bg-[#0B1222] rounded-2xl text-[13px] font-mono text-indigo-300 outline-none border border-slate-800"
                          rows="5"
                        />
                      </div>
                    )}

                    {/* 2. Resource Link Input (iky-ban fach t-cliki 3la Link) */}
                    {showResourceInput && (
                      <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                          <FiLink className="text-indigo-500 mr-2" size={18} />
                          <input 
                            type="url" 
                            placeholder="https://documentation-link.com" 
                            className="w-full text-sm font-bold text-slate-700 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Toolbar & Send Button */}
                    <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
                      <div className="flex gap-2">
                        <button title="Add Image" className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                          <FiImage size={20} />
                        </button>
                        
                        {/* Button Code <> */}
                        <button 
                          onClick={() => setShowCodeInput(!showCodeInput)} 
                          className={`p-2 rounded-xl transition-all ${showCodeInput ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-100'}`}
                          title="Add Code Snippet"
                        >
                          <FiCode size={20} />
                        </button>

                        {/* Button Link */}
                        <button 
                          onClick={() => setShowResourceInput(!showResourceInput)} 
                          className={`p-2 rounded-xl transition-all ${showResourceInput ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-slate-100'}`}
                          title="Add Resource Link"
                        >
                          <FiLink size={20} />
                        </button>
                      </div>

                      <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center gap-2">
                        Share <FiSend size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FEED */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-4 mb-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                <FiFileText /> Knowledge Feed
              </div>
              {knowledgeList.map((item) => (
                <KnowledgeCard key={item.id} data={item} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyKnowledge;