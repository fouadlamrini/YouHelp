import React, { useState } from "react";
// Importer les composants li sawabna (t'akad mn l-paths s7a7)
import NavbarLoggedIn from "./NavbarLoggedIn";
import Sidebar from "./Sidebar";
import { 
  FiImage, FiVideo, FiSmile, FiSend, FiHeart, 
  FiMessageCircle, FiHelpCircle, FiMoreHorizontal, FiChevronDown 
} from "react-icons/fi";

const PostPage = () => {
  const [postContent, setPostContent] = useState("");
  const [category, setCategory] = useState("");

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* 1. Sidebar (Fixed or Sidebar component) */}
      <Sidebar />

      <div className="flex-grow flex flex-col">
        {/* 2. Navbar l-fo9 */}
        <NavbarLoggedIn />

        {/* 3. Main Content Area */}
        <main className="p-4 md:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* --- Section: Create Post (Inspired by Image 1) --- */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
                  YC
                </div>
                <div className="flex-grow space-y-4">
                  {/* Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <select 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">Category</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                        <option value="">Sub Category</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Textarea Style Image 1 */}
                  <div className="relative bg-slate-50 rounded-[2rem] p-4 group transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                    <textarea 
                      rows="3"
                      placeholder="بم تفكر يا Fouad؟"
                      className="w-full bg-transparent border-none focus:ring-0 text-right text-lg font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-2 border-t border-slate-100 pt-3">
                      <div className="flex gap-4 text-slate-400">
                        <button className="hover:text-amber-500 transition-colors"><FiSmile size={20} /></button>
                        <button className="hover:text-emerald-500 transition-colors"><FiImage size={20} /></button>
                        <button className="hover:text-red-500 transition-colors"><FiVideo size={20} /></button>
                      </div>
                      <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                        Post <FiSend size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Section: Post Display (Style Image 2) --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600">CA</div>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-none">Canyon Arabic</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">22h • Public 🌍</p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600"><FiMoreHorizontal size={20} /></button>
              </div>

              <div className="px-6 pb-4">
                <p className="text-slate-700 leading-relaxed font-medium">
                  Est-ce que quelqu'un peut m'aider avec cette erreur React ? C'est vraiment bloquant pour mon projet YouCode.
                </p>
              </div>

              {/* Video/Image Content */}
              <div className="w-full aspect-video bg-slate-100 relative group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000" 
                  className="w-full h-full object-cover" 
                  alt="coding" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                   <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center text-white">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                   </div>
                </div>
              </div>

              {/* Action Buttons with Question Mark & Heart */}
              <div className="p-2 grid grid-cols-3 gap-1 border-t border-slate-50">
                <button className="flex items-center justify-center gap-2 py-3 hover:bg-red-50 rounded-2xl text-slate-600 transition-all group">
                  <FiHeart className="group-hover:text-red-500 group-hover:fill-red-500" size={18} />
                  <span className="text-xs font-black group-hover:text-red-600">J'aime</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 hover:bg-indigo-50 rounded-2xl text-slate-600 transition-all group">
                  <FiMessageCircle className="group-hover:text-indigo-600" size={18} />
                  <span className="text-xs font-black group-hover:text-indigo-600">Commenter</span>
                </button>
                {/* Question Mark Reaction */}
                <button className="flex items-center justify-center gap-2 py-3 hover:bg-amber-50 rounded-2xl text-slate-600 transition-all group">
                  <FiHelpCircle className="group-hover:text-amber-500" size={18} />
                  <span className="text-xs font-black group-hover:text-amber-600 whitespace-nowrap">Même problème ?</span>
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default PostPage;