import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield
} from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!formData.email.match(/^\S+@\S+\.\S+$/))
      newErrors.email = "Valid email is required";
    if (!formData.password)
      newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      console.log("Login submitted:", formData);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] w-full flex bg-white font-sans overflow-hidden">
      
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 items-center justify-center p-16">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>

        <div className="relative z-10 text-white max-w-md">
          <div className="mb-6 w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
            <FiShield size={32} className="text-indigo-200" />
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tighter mb-6">
            Welcome Back to <br />
            <span className="text-indigo-200 underline decoration-indigo-400 decoration-4 underline-offset-8 transition-all hover:text-white">
              YouHelp.
            </span>
          </h1>

          <p className="text-lg text-indigo-100 font-medium leading-relaxed opacity-90">
            Log in to continue sharing knowledge, asking questions, and collaborating
            with your YouCode peers.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-slate-50/50">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              Login
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                className={`peer w-full pl-6 pr-4 py-4.5 bg-white border-2 rounded-2xl outline-none transition-all duration-300
                ${errors.email ? "border-red-300 shadow-sm shadow-red-50" : "border-slate-100 focus:border-indigo-600 focus:shadow-xl focus:shadow-indigo-50/50"}`}
              />
              <label
                className={`absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 pointer-events-none
                peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-indigo-600 peer-focus:font-bold
                ${formData.email ? "-top-2 text-xs bg-white px-2 text-indigo-600 font-bold" : ""}`}
              >
                <FiMail className="inline mr-2" />
                Email Address
              </label>
              {errors.email && (
                <p className="text-[11px] text-red-500 mt-2 ml-2 font-bold uppercase tracking-wider">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                className={`peer w-full pl-6 pr-12 py-4.5 bg-white border-2 rounded-2xl outline-none transition-all duration-300
                ${errors.password ? "border-red-300 shadow-sm shadow-red-50" : "border-slate-100 focus:border-indigo-600 focus:shadow-xl focus:shadow-indigo-50/50"}`}
              />
              <label
                className={`absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 pointer-events-none
                peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-indigo-600 peer-focus:font-bold
                ${formData.password ? "-top-2 text-xs bg-white px-2 text-indigo-600 font-bold" : ""}`}
              >
                <FiLock className="inline mr-2" />
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>

              {errors.password && (
                <p className="text-[11px] text-red-500 mt-2 ml-2 font-bold uppercase tracking-wider">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex justify-end mt-[-10px]">
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.97] flex items-center justify-center gap-3"
            >
              SIGN IN <FiArrowRight size={20} />
            </button>
          </form>

          {/* Divider dyal "Or" */}
          <div className="mt-10 mb-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-400">
              <span className="bg-[#fcfcfd] px-4">Or continue with</span>
            </div>
          </div>

          {/* Social Logins Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3.5 border-2 border-slate-100 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-700 text-sm shadow-sm active:scale-95">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Google
            </button>
            <button className="flex items-center justify-center gap-3 py-3.5 border-2 border-slate-100 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-700 text-sm shadow-sm active:scale-95">
              <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5" alt="GitHub" />
              GitHub
            </button>
          </div>

          <p className="text-center mt-12 text-slate-500 font-semibold">
            New here?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-black hover:underline underline-offset-8 decoration-2"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;