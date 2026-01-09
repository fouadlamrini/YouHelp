import React from "react";
import { FiTarget, FiUsers, FiCpu, FiHeart, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* --- Header Section --- */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
            Empowering <span className="text-indigo-600 font-black">YouCoders</span> <br /> to Build the Future.
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-slate-500 font-medium leading-relaxed">
            YouHelp isn't just a platform; it's a community-driven ecosystem designed 
            to bridge the gap between technical challenges and collaborative solutions.
          </p>
        </div>
      </section>

      {/* --- Mission & Vision --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-64 h-64 bg-indigo-100 rounded-[3rem] -z-10 blur-2xl opacity-60"></div>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                alt="Team working" 
                className="rounded-[2.5rem] shadow-2xl border-8 border-white"
              />
            </div>
            
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em]">
                <FiTarget size={18} /> Our Mission
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight">
                Breaking Barriers in <br /> Tech Education.
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                We believe that no student should stay stuck on a bug for hours. 
                YouHelp provides the tools to get instant feedback, peer reviews, 
                and mentor guidance, making the learning journey smoother and more interactive.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-slate-500 italic">Joined by 500+ YouCoders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Core Values --- */}
      <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-6">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-black mb-16 tracking-tight">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: <FiUsers />, 
                title: "Collaboration", 
                desc: "We grow by lifting others. Knowledge sharing is at the heart of everything we do." 
              },
              { 
                icon: <FiCpu />, 
                title: "Innovation", 
                desc: "Using modern tools like WebRTC and Real-time Q&A to solve classic learning hurdles." 
              },
              { 
                icon: <FiHeart />, 
                title: "Inclusivity", 
                desc: "Every YouCoder, from beginner to advanced, has a place to ask and contribute." 
              }
            ].map((value, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl mb-6 mx-auto transition-transform group-hover:scale-110">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Call to Action --- */}
      <section className="py-32 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">
            Want to be part of the <span className="text-indigo-600 italic">Success Story?</span>
          </h2>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95"
          >
            Join the Community <FiArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;