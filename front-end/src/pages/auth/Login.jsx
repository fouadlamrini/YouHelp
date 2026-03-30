import React, { useMemo, useState, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
  FiGithub,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const apiRoot = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, ""),
    []
  );

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    const email = (formData.email ?? "").toString().trim();
    if (!email) newErrors.email = "L'email est requis";
    else if (!email.match(/^\S+@\S+\.\S+$/))
      newErrors.email = "Adresse email invalide";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user && !user.completeProfile) {
        navigate("/complete-profile");
      } else {
        navigate("/posts");
      }
    } catch (error) {
      setErrors({ general: "Invalid email or password" });
    } finally {
      setLoading(false);
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
            Log in to continue sharing knowledge, asking questions, and
            collaborating with your YouCode peers.
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

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {searchParams.get("oauth") === "failed" && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700 font-bold">
                  OAuth failed{searchParams.get("reason") ? `: ${searchParams.get("reason")}` : "."}
                </p>
              </div>
            )}
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                className={`peer w-full pl-6 pr-4 py-4.5 bg-white border-2 rounded-2xl outline-none transition-all duration-300 text-slate-900 placeholder-transparent
                ${errors.email ? "border-red-300 shadow-sm shadow-red-50" : "border-slate-100 focus:border-indigo-600 focus:shadow-xl focus:shadow-indigo-50/50"}`}
              />
              <label
                className={`absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 pointer-events-none
                peer-focus:!-top-2 peer-focus:!left-4 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-indigo-600 peer-focus:font-bold peer-focus:!translate-y-0
                ${(formData.email ?? "").toString().trim() ? "!-top-2 !left-4 !translate-y-0 text-xs bg-white px-2 text-indigo-600 font-bold" : ""}`}
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
                autoComplete="current-password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                className={`peer w-full pl-6 pr-12 py-4.5 bg-white border-2 rounded-2xl outline-none transition-all duration-300 text-slate-900 placeholder-transparent
                ${errors.password ? "border-red-300 shadow-sm shadow-red-50" : "border-slate-100 focus:border-indigo-600 focus:shadow-xl focus:shadow-indigo-50/50"}`}
              />
              <label
                className={`absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 pointer-events-none
                peer-focus:!-top-2 peer-focus:!left-4 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-indigo-600 peer-focus:font-bold peer-focus:!translate-y-0
                ${(formData.password ?? "").toString().trim() ? "!-top-2 !left-4 !translate-y-0 text-xs bg-white px-2 text-indigo-600 font-bold" : ""}`}
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

            {errors.general && (
              <p className="text-[11px] text-red-500 mt-2 ml-2 font-bold uppercase tracking-wider">
                {errors.general}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"} <FiArrowRight size={20} />
            </button>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <a
                href={`${apiRoot}/api/auth/google`}
                className="w-full py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-indigo-400 hover:text-indigo-600 transition-all text-center inline-flex items-center justify-center gap-2"
              >
                <FcGoogle size={20} />
                Continuer avec Google
              </a>
              <a
                href={`${apiRoot}/api/auth/github`}
                className="w-full py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-indigo-400 hover:text-indigo-600 transition-all text-center inline-flex items-center justify-center gap-2"
              >
                <FiGithub size={18} />
                Continuer avec GitHub
              </a>
            </div>
          </form>

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

