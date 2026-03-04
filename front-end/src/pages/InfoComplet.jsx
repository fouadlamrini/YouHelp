import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMapPin,
  FiLayers,
  FiBookOpen,
  FiSend,
  FiChevronDown,
  FiLogOut,
  FiArrowLeft,
  FiCamera,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import api, { authApi, avatarsApi } from "../services/api";

const API_ORIGIN = (api.defaults.baseURL || "").replace(/\/api$/, "") || "http://localhost:3000";

function resolveAvatarUrl(src) {
  if (!src) return `${API_ORIGIN}/avatars/default-avatar.jpg`;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_ORIGIN}${src}`;
  return `${API_ORIGIN}/avatars/${src}`;
}

const InfoComplet = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [options, setOptions] = useState({ campuses: [], classes: [], levels: [] });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    campus: "",
    class: "",
    level: "",
    specialite: "",
    profilePicture: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.completeProfile) {
      navigate(user.status === "active" ? "/posts" : "/pending");
      return;
    }
    authApi
      .getCompleteProfileOptions()
      .then((res) => setOptions(res.data?.data ?? { campuses: [], classes: [], levels: [] }))
      .catch(() => setOptions({ campuses: [], classes: [], levels: [] }))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!formData.campus || !formData.class || !formData.level) {
      alert("Veuillez remplir Campus, Classe et Niveau.");
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await authApi.completeProfile({
        campus: formData.campus || null,
        class: formData.class || null,
        level: formData.level || null,
        specialite: formData.specialite || null,
        profilePicture: formData.profilePicture || undefined,
      });
      const updated = res.data?.data;
      if (updated) {
        const normalized = {
          id: updated._id,
          name: updated.name,
          email: updated.email,
          status: updated.status,
          role: updated.role?.name ?? updated.role,
          profilePicture: updated.profilePicture ?? null,
          completeProfile: updated.completeProfile ?? true,
        };
        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));
      }
      navigate("/pending");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleIgnore = () => {
    navigate("/");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await avatarsApi.upload(file);
      const url = res.data?.data?.url;
      if (url) setFormData((prev) => ({ ...prev, profilePicture: url }));
    } catch (_) {}
  };

  if (!user || user.completeProfile) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex items-center justify-center p-4 py-12 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/5 -skew-x-12 translate-x-32" />

      <main className="max-w-3xl w-full relative z-10">
        <div className="flex justify-between items-center mb-8 px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all"
          >
            <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour
          </button>
          <button
            type="button"
            onClick={() => { logout(); navigate("/login"); }}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 hover:text-rose-600 transition-all"
          >
            <FiLogOut size={16} className="group-hover:translate-x-1 transition-transform" /> Déconnexion
          </button>
        </div>

        <div className="bg-white rounded-[4rem] p-10 md:p-16 shadow-2xl shadow-indigo-200/20 border border-white/50">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">
              Compléter mon profil
            </h1>
            <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full mb-4" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
              Campus, classe, niveau, spécialité et photo
            </p>
          </div>

          <form onSubmit={handleConfirm} className="space-y-8">
            {/* Photo de profil */}
            <div className="flex flex-col items-center gap-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FiCamera className="text-indigo-500" /> Photo de profil
              </label>
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-100 bg-slate-100">
                  <img
                    src={formData.profilePicture ? resolveAvatarUrl(formData.profilePicture) : resolveAvatarUrl("default-avatar.jpg")}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer shadow-lg">
                  <FiCamera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
            </div>

            {/* Campus */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                <FiMapPin className="text-indigo-500" /> Campus
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.campus}
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all"
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                >
                  <option value="">Sélectionner le campus</option>
                  {options.campuses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Classe & Niveau */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                  <FiLayers className="text-indigo-500" /> Classe
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.class}
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all"
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  >
                    <option value="">Sélectionner la classe</option>
                    {options.classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                  <FiBookOpen className="text-indigo-500" /> Niveau
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.level}
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all"
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="">Sélectionner le niveau</option>
                    {options.levels.map((l) => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Spécialité */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                <FiUser className="text-indigo-500" /> Spécialité
              </label>
              <input
                type="text"
                placeholder="Ex: Développement Web"
                value={formData.specialite}
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl outline-none text-xs font-black text-slate-700 transition-all"
                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
              />
            </div>

            {/* Boutons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 bg-indigo-600 text-white py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-4 group disabled:opacity-50"
              >
                {submitLoading ? "Envoi..." : "Confirmer mes informations"}
                <FiSend size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={handleIgnore}
                className="flex-1 bg-slate-100 text-slate-700 py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all border-2 border-slate-200"
              >
                Ignorer
              </button>
            </div>
          </form>
        </div>

        <p className="mt-10 text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
          YouHelp &copy; 2026 • Accès après validation
        </p>
      </main>
    </div>
  );
};

export default InfoComplet;
