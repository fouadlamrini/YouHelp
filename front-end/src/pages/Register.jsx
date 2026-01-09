import React, { useState } from "react";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function RegisterYouHelp() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Invalid email address";
    if (formData.password.length < 8) newErrors.password = "Minimum 8 characters";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) setErrors(validationErrors);
    else console.log("Account Created for YouHelp:", formData);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* --- JIHA DYAL L-IMAGE (Left Side - Visible on Desktop) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#4F46E5] items-center justify-center p-12">
        {/* Background Pattern/Overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        
        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-8 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Join 500+ YouCoders today</span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Share. Solve. <br /> <span className="text-indigo-200">Succeed Together.</span>
          </h1>
          
          <div className="space-y-6">
            {[
              "Get real-time help via Video Calls",
              "Request Workshops from classmates",
              "Access a database of solved problems"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <FiCheckCircle className="text-white" size={20} />
                </div>
                <p className="text-lg text-indigo-50">{text}</p>
              </div>
            ))}
          </div>

          {/* Glassmorphism Card */}
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
            <p className="italic text-indigo-100">
              "YouHelp transformed how we collaborate at YouCode. No question stays unanswered!"
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 border-2 border-white/30"></div>
              <div>
                <p className="font-bold text-sm">YouCoder Member</p>
                <p className="text-xs text-indigo-200">Software Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- JIHA DYAL L-FORM (Right Side) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-slate-50/50">
        <div className="w-full max-w-md">
          {/* Logo / Mobile Header */}
          <div className="mb-10 lg:mb-12">
            <h2 className="text-3xl font-black text-indigo-600 tracking-tighter mb-2">YouHelp.</h2>
            <h3 className="text-2xl font-bold text-slate-800">Create an account</h3>
            <p className="text-slate-500 mt-2 font-medium">Start your journey in the YouCode community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Full Name */}
            <div className="relative group">
              <input
                type="text" name="fullName" placeholder=" " value={formData.fullName} onChange={handleChange}
                onFocus={() => setFocused("fullName")} onBlur={() => setFocused("")}
                className={`peer w-full pl-5 pr-4 py-4 bg-white border-2 rounded-2xl outline-none transition-all duration-300
                ${errors.fullName ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-indigo-600 focus:shadow-lg focus:shadow-indigo-50"}`}
              />
              <label className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-all duration-300 flex items-center gap-2
                peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-indigo-600 peer-focus:font-bold
                ${formData.fullName ? "-top-2 left-3 text-xs bg-white px-2 font-bold" : ""}`}>
                <FiUser /> Full Name
              </label>
              {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-2 uppercase tracking-wider">{errors.fullName}</p>}
            </div>

            {/* Input Email */}
            <div className="relative group">
              <input
                type="email" name="email" placeholder=" " value={formData.email} onChange={handleChange}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                className={`peer w-full pl-5 pr-4 py-4 bg-white border-2 rounded-2xl outline-none transition-all duration-300
                ${errors.email ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-indigo-600 focus:shadow-lg focus:shadow-indigo-50"}`}
              />
              <label className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-all duration-300 flex items-center gap-2
                peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-indigo-600 peer-focus:font-bold
                ${formData.email ? "-top-2 left-3 text-xs bg-white px-2 font-bold" : ""}`}>
                <FiMail /> Email Address
              </label>
              {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-2 uppercase tracking-wider">{errors.email}</p>}
            </div>

            {/* Input Password */}
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"} name="password" placeholder=" " value={formData.password} onChange={handleChange}
                onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                className={`peer w-full pl-5 pr-12 py-4 bg-white border-2 rounded-2xl outline-none transition-all duration-300
                ${errors.password ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-indigo-600 focus:shadow-lg focus:shadow-indigo-50"}`}
              />
              <label className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-all duration-300 flex items-center gap-2
                peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-indigo-600 peer-focus:font-bold
                ${formData.password ? "-top-2 left-3 text-xs bg-white px-2 font-bold" : ""}`}>
                <FiLock /> Password
              </label>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
              {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-2 uppercase tracking-wider">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span>Create Account</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Alternative Login */}
          <div className="mt-8">
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase">Or join with</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="flex items-center justify-center gap-2 py-3 border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-slate-700">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-slate-700">
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5" alt="G" /> GitHub
              </button>
            </div>
          </div>

          <p className="text-center mt-10 text-slate-500 font-medium">
            Already a member? <a href="/login" className="text-indigo-600 font-extrabold hover:underline underline-offset-4">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}