import React from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiMessageCircle, FiVideo, FiCheckCircle, FiArrowRight, FiUsers } from "react-icons/fi";

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-8 animate-bounce">
            🚀 Exclusive for YouCoders
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8">
            Solving Problems <br /> 
            <span className="text-indigo-600 italic">Together</span> in Real-Time.
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed mb-12">
            The all-in-one collaboration platform for YouCode students and mentors. 
            Ask questions, join workshops, and get unstuck instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3"
            >
              Get Started for Free <FiArrowRight />
            </Link>
            <Link 
              to="/about" 
              className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all"
            >
              How it works
            </Link>
          </div>

          {/* Mini Search Mockup */}
          <div className="mt-20 max-w-3xl mx-auto p-4 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] flex items-center gap-4">
             <div className="pl-4 text-slate-400">
               <FiSearch size={24} />
             </div>
             <input 
               type="text" 
               placeholder="Search for solutions (e.g. 'React useEffect help')..." 
               className="w-full py-4 outline-none text-slate-600 font-medium"
               disabled
             />
             <button className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-bold hidden md:block">
               Search
             </button>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FiMessageCircle size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Smart Q&A</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Post your technical issues with attachments and get structured answers from peers and mentors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FiVideo size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Live Assistance</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Start instant video calls with helpers to debug your code in real-time using WebRTC technology.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FiCheckCircle size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Workshops</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Request and manage group workshops for complex subjects led by experienced trainers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-16 md:gap-32">
            <div className="text-center">
              <p className="text-5xl font-black text-slate-900 mb-2">500+</p>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Students Active</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-indigo-600 mb-2">1.2k</p>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Problems Solved</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-slate-900 mb-2">50+</p>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Expert Mentors</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px]"></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 relative z-10">
            Ready to help your <br /> classmates?
          </h2>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black hover:bg-indigo-50 transition-all relative z-10"
          >
            Join YouHelp Now <FiUsers />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;