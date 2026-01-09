import React, { useState } from "react";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function RegisterYouHelp() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
    else console.log("Form Submitted:", formData);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* Left Side: Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#4F46E5] items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        
        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-8 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Join 500+ YouCoders today</span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6 italic tracking-tight">
            Level up your <br /> <span className="text-indigo-300">Learning Game.</span>
          </h1>
          
          <div className="space-y-6">
            {["Real-time Video Assistance", "Collaborative Workshops", "Peer-to-Peer Solutions"].map((text, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-default">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-green-400/20 transition-colors">
                  <FiCheckCircle className="text-white group-hover:text-green-400" size={20} />
                </div>
                <p className="text-lg text-indigo-50 font-medium">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl">
            <p className="italic text-indigo-100 text-lg leading-relaxed">
              "The best way to learn is by helping others. YouHelp makes it seamless."
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-400 border-2 border-white/50 flex items-center justify-center font-bold">YC</div>
              <div>
                <p className="font-bold text-white">YouCode Community</p>
                <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold">Official Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 bg-slate-50/30">
        <div className="w-full max-w-md">
          <div className="mb-10 text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Register</h2>
            <p className="text-slate-500 mt-3 font-medium text-lg">Create your YouHelp account now.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Wrapper */}
            {[
              { id: "fullName", label: "Full Name", icon: FiUser, type: "text" },
              { id: "email", label: "Email Address", icon: FiMail, type: "email" },
              { id: "password", label: "Password", icon: FiLock, type: "password" }
            ].map((field) => (
              <div key={field.id} className="relative group">
                <input
                  type={field.id === "password" && showPassword ? "text" : field.type}
                  name={field.id}
                  placeholder=" "
                  value={formData[field.id]}
                  onChange={handleChange}
                  className={`peer w-full pl-6 pr-4 py-4.5 bg-white border-2 rounded-2xl outline-none transition-all duration-300
                  ${errors[field.id] ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-indigo-600 focus:shadow-xl focus:shadow-indigo-50/50"}`}
                />
                <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-all duration-300 flex items-center gap-2
                  peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-indigo-600 peer-focus:font-bold
                  ${formData[field.id] ? "-top-2 left-4 text-xs bg-white px-2 font-bold text-indigo-600" : ""}`}>
                  <field.icon /> {field.label}
                </label>
                
                {field.id === "password" && (
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600">
                    {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
                  </button>
                )}
                {errors[field.id] && <p className="text-[11px] text-red-500 font-bold mt-2 ml-2 tracking-wide italic leading-none">{errors[field.id]}</p>}
              </div>
            ))}

            <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all transform active:scale-[0.97] flex items-center justify-center gap-3 mt-4">
              CREATE ACCOUNT <FiArrowRight size={20} />
            </button>
          </form>

          {/* Social Auth */}
          <div className="mt-10">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Or connect with</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="flex items-center justify-center gap-3 py-3.5 border-2 border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all font-bold text-slate-700">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="" /> Google
              </button>
              <button className="flex items-center justify-center gap-3 py-3.5 border-2 border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all font-bold text-slate-700">
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5" alt="" /> GitHub
              </button>
            </div>
          </div>

          <p className="text-center mt-12 text-slate-500 font-semibold">
            Already have an account? <a href="/login" className="text-indigo-600 font-black hover:underline underline-offset-8">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}