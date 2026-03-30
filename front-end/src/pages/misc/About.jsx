import React from "react";
import { FiTarget, FiUsers, FiCpu, FiHeart, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
          <FiHeart size={14} />
          About YouHelp
        </div>
        <h1 className="mt-4 text-4xl font-black text-slate-900 tracking-tight">
          We build a community that helps each other learn faster.
        </h1>
        <p className="mt-4 text-slate-600 max-w-3xl leading-relaxed">
          YouHelp is a collaborative platform where students and trainers can ask for help, share knowledge,
          and solve real problems together. Our goal is simple: make learning social, practical, and accessible.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
            <FiTarget className="text-indigo-600" size={20} />
            <h3 className="mt-3 font-bold text-slate-900">Our Mission</h3>
            <p className="mt-2 text-sm text-slate-600">
              Connect learners and mentors in one place to turn blockers into progress.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
            <FiUsers className="text-indigo-600" size={20} />
            <h3 className="mt-3 font-bold text-slate-900">Community First</h3>
            <p className="mt-2 text-sm text-slate-600">
              Encourage teamwork, peer support, and respectful collaboration at every level.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
            <FiCpu className="text-indigo-600" size={20} />
            <h3 className="mt-3 font-bold text-slate-900">Smart Features</h3>
            <p className="mt-2 text-sm text-slate-600">
              Real-time messaging, media sharing, and focused workflows to support daily learning.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link
            to="/posts"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors"
          >
            Explore Posts
            <FiArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;

