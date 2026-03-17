import React, { useState, useContext } from "react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function RegisterYouHelp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // const validate = () => {
  //   const newErrors = {};
  //   if (!formData.fullName.trim())
  //     newErrors.fullName = "Le nom complet est requis";
  //   const email = (formData.email ?? "").toString().trim();
  //   if (!email) newErrors.email = "L'email est requis";
  //   else if (!email.match(/^\S+@\S+\.\S+$/))
  //     newErrors.email = "Adresse email invalide";
  //   if (formData.password.length < 8)
  //     newErrors.password = "Minimum 8 caractères";
  //   return newErrors;
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const response = await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (response.data?.success) {
        const { user: userData, token } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        navigate("/complete-profile");
      } else {
        setErrors({ general: response.data?.message || "Registration failed" });
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";
      setErrors({ general: message });
      if (error.response?.status === 400) {
        console.warn("Register 400:", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Side: Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#4F46E5] items-center justify-center p-12">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("https://www.transparenttextures.com/patterns/cubes.png")',
          }}
        ></div>

        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-8 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">
              Join 500+ YouCoders today
            </span>
          </div>

          <h1 className="text-5xl font-extrabold leading-tight mb-6 italic tracking-tight">
            Level up your <br />{" "}
            <span className="text-indigo-300">Learning Game.</span>
          </h1>

          <div className="space-y-6">
            {[
              "Real-time Video Assistance",
              "Collaborative Workshops",
              "Peer-to-Peer Solutions",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-4 group cursor-default"
              >
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-green-400/20 transition-colors">
                  <FiCheckCircle
                    className="text-white group-hover:text-green-400"
                    size={20}
                  />
                </div>
                <p className="text-lg text-indigo-50 font-medium">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl">
            <p className="italic text-indigo-100 text-lg leading-relaxed">
              "The best way to learn is by helping others. YouHelp makes it
              seamless."
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-400 border-2 border-white/50 flex items-center justify-center font-bold">
                YC
              </div>
              <div>
                <p className="font-bold text-white">YouCode Community</p>
                <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold">
                  Official Platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 bg-slate-50/30">
        <div className="w-full max-w-md">
          <div className="mb-10 text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              Register
            </h2>
            <p className="text-slate-500 mt-3 font-medium text-lg">
              Create your YouHelp account now.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Input Wrapper */}
            {[
              {
                id: "fullName",
                label: "Full Name",
                icon: FiUser,
                type: "text",
              },
              {
                id: "email",
                label: "Email Address",
                icon: FiMail,
                type: "email",
              },
              {
                id: "password",
                label: "Password",
                icon: FiLock,
                type: "password",
              },
            ].map((field) => (
              <div key={field.id} className="relative group">
                <input
                  type={
                    field.id === "password" && showPassword
                      ? "text"
                      : field.type
                  }
                  name={field.id}
                  autoComplete={
                    field.id === "fullName"
                      ? "name"
                      : field.id === "email"
                        ? "email"
                        : field.id === "password"
                          ? "new-password"
                          : "off"
                  }
                  placeholder=" "
                  value={formData[field.id]}
                  onChange={handleChange}
                  className={`peer w-full pl-6 pr-4 py-4.5 bg-white border-2 rounded-2xl outline-none transition-all duration-300 text-slate-900 placeholder-transparent
                  ${errors[field.id] ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-indigo-600 focus:shadow-xl focus:shadow-indigo-50/50"}`}
                />
                <label
                  className={`absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-all duration-300 flex items-center gap-2
                  peer-focus:!-top-2 peer-focus:!left-4 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-indigo-600 peer-focus:font-bold peer-focus:!translate-y-0
                  ${(formData[field.id] ?? "").toString().trim() ? "!-top-2 !left-4 !translate-y-0 text-xs bg-white px-2 font-bold text-indigo-600" : ""}`}
                >
                  <field.icon /> {field.label}
                </label>

                {field.id === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600"
                  >
                    {showPassword ? (
                      <FiEyeOff size={22} />
                    ) : (
                      <FiEye size={22} />
                    )}
                  </button>
                )}
                {errors[field.id] && (
                  <p className="text-[11px] text-red-500 font-bold mt-2 ml-2 tracking-wide italic leading-none">
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}

            {errors.general && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700 font-bold">
                  {errors.general}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all transform active:scale-[0.97] flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}{" "}
              <FiArrowRight size={20} />
            </button>
          </form>

          <p className="text-center mt-12 text-slate-500 font-semibold">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-black hover:underline underline-offset-8"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

