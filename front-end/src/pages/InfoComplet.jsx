import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  const [avatars, setAvatars] = useState([]);
  const [profilePictureSource, setProfilePictureSource] = useState("avatar");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ campus: "", class: "", level: "" });
  const [formData, setFormData] = useState({
    campus: "",
    class: "",
    level: "",
    profilePicture: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.completeProfile && user.status === "active") {
      navigate("/posts");
      return;
    }
    if (!user.completeProfile) {
      Promise.all([authApi.getCompleteProfileOptions(), avatarsApi.getAll()])
        .then(([optsRes, avatarsRes]) => {
          setOptions(optsRes.data?.data ?? { campuses: [], classes: [], levels: [] });
          setAvatars(avatarsRes.data?.data ?? []);
        })
        .catch(() => {
          setOptions({ campuses: [], classes: [], levels: [] });
          setAvatars([]);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    const err = {
      campus: !formData.campus ? "Veuillez sélectionner votre campus." : "",
      class: !formData.class ? "Veuillez sélectionner votre classe." : "",
      level: !formData.level ? "Veuillez sélectionner votre niveau." : "",
    };
    setFieldErrors(err);
    if (err.campus || err.class || err.level) return;
    setSubmitLoading(true);
    try {
      const res = await authApi.completeProfile({
        campus: formData.campus || null,
        class: formData.class || null,
        level: formData.level || null,
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
      // Rester sur la page : affichage du message d'attente + bouton "Voir les posts"
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleIgnore = () => {
    navigate("/posts");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await avatarsApi.upload(file);
      const path = res.data?.data?.path;
      if (path) setFormData((prev) => ({ ...prev, profilePicture: path }));
    } catch (_) {}
  };

  if (!user) return null;
  if (user.completeProfile && user.status === "active") return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const displayName = user?.name || "Utilisateur";
  const isWaiting = user.completeProfile && user.status !== "active";

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
          {/* Message de bienvenue */}
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              Bienvenue {displayName} sur YouHelp !
            </h1>
            <p className="text-slate-600 font-medium leading-relaxed mb-4">
              Nous sommes ravis de vous avoir parmi nous. Pour rejoindre pleinement notre communauté d&apos;entraide, nous avons besoin d&apos;en savoir un peu plus sur vous.
            </p>
            {isWaiting && (
              <>
                <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-sm font-bold mb-8">
                  Nous attendons qu&apos;un responsable active votre compte pour que vous ayez accès à toutes les fonctionnalités.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/posts")}
                  className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  Voir les posts
                </button>
              </>
            )}
          </div>

          {!isWaiting && (
            <>
          <div className="text-center mb-8">
            <p className="text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-2xl px-6 py-4 text-sm font-bold mb-6">
              Complétez votre profil pour que l&apos;administrateur puisse activer votre compte.
            </p>
            <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full mb-4" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
              Campus, classe, niveau et photo
            </p>
          </div>

          <form onSubmit={handleConfirm} noValidate className="space-y-8">
            {/* Photo de profil : Avatar (galerie) ou Depuis mon PC */}
            <div className="flex flex-col items-center gap-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FiCamera className="text-indigo-500" /> Photo de profil
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setProfilePictureSource("avatar")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    profilePictureSource === "avatar" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Avatar (galerie)
                </button>
                <button
                  type="button"
                  onClick={() => setProfilePictureSource("pc")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    profilePictureSource === "pc" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Depuis mon PC
                </button>
              </div>
              {profilePictureSource === "avatar" && (
                <div className="flex flex-wrap justify-center gap-2 max-h-40 overflow-y-auto">
                  {avatars.map((a) => (
                    <button
                      key={a.file}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, profilePicture: a.file }))}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 transition-all ${
                        formData.profilePicture === a.file ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img src={a.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {profilePictureSource === "pc" && (
                <div className="flex flex-col items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200">
                    Choisir un fichier
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              )}
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-100 bg-slate-100">
                  <img
                    src={formData.profilePicture ? resolveAvatarUrl(formData.profilePicture) : resolveAvatarUrl("default-avatar.jpg")}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Campus */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                <FiMapPin className="text-indigo-500" /> Campus
              </label>
              <div className="relative">
                <select
                  value={formData.campus}
                  className={`w-full px-8 py-5 bg-slate-50 border-2 rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all ${fieldErrors.campus ? "border-red-200 focus:border-red-300 focus:bg-white" : "border-transparent focus:border-indigo-100 focus:bg-white"}`}
                  onChange={(e) => { setFormData({ ...formData, campus: e.target.value }); setFieldErrors((p) => ({ ...p, campus: "" })); }}
                >
                  <option value="">Sélectionner le campus</option>
                  {options.campuses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {fieldErrors.campus && (
                <p className="text-red-600 text-xs font-semibold ml-5">{fieldErrors.campus}</p>
              )}
            </div>

            {/* Classe & Niveau */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                  <FiLayers className="text-indigo-500" /> Classe
                </label>
                <div className="relative">
                  <select
                    value={formData.class}
                    className={`w-full px-8 py-5 bg-slate-50 border-2 rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all ${fieldErrors.class ? "border-red-200 focus:border-red-300 focus:bg-white" : "border-transparent focus:border-indigo-100 focus:bg-white"}`}
                    onChange={(e) => { setFormData({ ...formData, class: e.target.value }); setFieldErrors((p) => ({ ...p, class: "" })); }}
                  >
                    <option value="">Sélectionner la classe</option>
                    {options.classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.nickName ? `${c.name} (${c.nickName})` : c.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {fieldErrors.class && (
                  <p className="text-red-600 text-xs font-semibold ml-5">{fieldErrors.class}</p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-widest flex items-center gap-2">
                  <FiBookOpen className="text-indigo-500" /> Niveau
                </label>
                <div className="relative">
                  <select
                    value={formData.level}
                    className={`w-full px-8 py-5 bg-slate-50 border-2 rounded-3xl outline-none text-xs font-black text-slate-700 appearance-none cursor-pointer transition-all ${fieldErrors.level ? "border-red-200 focus:border-red-300 focus:bg-white" : "border-transparent focus:border-indigo-100 focus:bg-white"}`}
                    onChange={(e) => { setFormData({ ...formData, level: e.target.value }); setFieldErrors((p) => ({ ...p, level: "" })); }}
                  >
                    <option value="">Sélectionner le niveau</option>
                    {options.levels.map((l) => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {fieldErrors.level && (
                  <p className="text-red-600 text-xs font-semibold ml-5">{fieldErrors.level}</p>
                )}
              </div>
            </div>

            {/* Boutons */}
            <div className="pt-8 flex flex-col-reverse sm:flex-row gap-4 sm:gap-5">
              <button
                type="button"
                onClick={handleIgnore}
                className="w-full sm:w-auto sm:min-w-[140px] px-8 py-4 rounded-2xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              >
                Ignorer
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full sm:flex-1 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? "Envoi..." : "Confirmer mes informations"}
                <FiSend size={18} />
              </button>
            </div>
          </form>
            </>
          )}
        </div>

        <p className="mt-10 text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
          YouHelp &copy; 2026 • Accès après validation
        </p>
      </main>
    </div>
  );
};

export default InfoComplet;
