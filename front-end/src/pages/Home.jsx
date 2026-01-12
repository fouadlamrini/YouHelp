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
             Exclusive for YouCoders
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
       
        </div>
      </section>

      {/* --- Features Grid --- */}
    <section className="py-24 bg-slate-50/50">
  <div className="max-w-7xl mx-auto px-6">
    {/* Heading dyal section bach t-fesser chno l-faida */}
    <div className="text-center mb-16">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Everything you need to succeed</h2>
      <p className="text-slate-500 font-medium mt-4">Discover the powerful features built for YouCoders.</p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Feature 1: Smart Q&A (Modified) */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all group">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <FiMessageCircle size={28} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4">Smart Q&A</h3>
        <p className="text-slate-500 font-medium leading-relaxed">
          Post technical issues and engage with the community through <strong>detailed comments and threaded replies</strong> to find the best solutions.
        </p>
      </div>

      {/* Feature 2: Private Messaging (New) */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all group">
        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="28" width="28"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4">Private Messaging</h3>
        <p className="text-slate-500 font-medium leading-relaxed">
          Need 1-on-1 help? Connect directly with mentors or classmates through <strong>secure private messages</strong> for personalized guidance.
        </p>
      </div>

      {/* Feature 3: Share Knowledge (New) */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all group">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="28" width="28"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4">Share Knowledge</h3>
        <p className="text-slate-500 font-medium leading-relaxed">
          Contribute to the community by <strong>sharing your expertise</strong>, tutorials, and tips to help other YouCoders grow.
        </p>
      </div>

      {/* Feature 4: Live Assistance */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all group">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <FiVideo size={28} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4">Live Assistance</h3>
        <p className="text-slate-500 font-medium leading-relaxed">
          Start instant video calls to debug code in real-time. Fast, efficient, and direct support when you're stuck.
        </p>
      </div>

      {/* Feature 5: Workshops */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all group">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <FiCheckCircle size={28} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4">Workshops</h3>
        <p className="text-slate-500 font-medium leading-relaxed">
          Join or request group workshops led by experienced trainers to master complex technical subjects together.
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