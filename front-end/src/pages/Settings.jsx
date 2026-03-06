import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import {
  FiUser,
  FiMail,
  FiLock,
  FiMapPin,
  FiLayers,
  FiSave,
  FiEdit3,
  FiCamera,
  FiMonitor,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api, { usersApi, authApi, avatarsApi } from "../services/api";

const API_BASE = (api.defaults.baseURL || "").replace(/\/api\/?$/, "") || "http://localhost:3000";

function resolveAvatarUrl(src) {
  if (!src) return `${API_BASE}/avatars/default-avatar.jpg`;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads") || src.startsWith("/avatars")) return `${API_BASE}${src}`;
  return `${API_BASE}/avatars/${src}`;
}

const Settings = () => {
  const { user: authUser, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [form, setForm] = useState({
    name: "",
    profilePicture: "",
    coverPicture: "",
  });
  const [profilePictureSource, setProfilePictureSource] = useState("avatar");
  const [coverPictureSource, setCoverPictureSource] = useState("avatar");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    Promise.all([usersApi.getMe(), avatarsApi.getAll()])
      .then(([meRes, avatarsRes]) => {
        const data = meRes.data?.data;
        setProfile(data);
        if (data) {
          setForm({
            name: data.name ?? "",
            profilePicture: data.profilePicture ?? "",
            coverPicture: data.coverPicture ?? "",
          });
        }
        setAvatars(avatarsRes.data?.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleProfileChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await avatarsApi.upload(file);
      const path = res.data?.data?.path;
      if (path) handleProfileChange("profilePicture", path);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCoverPictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await avatarsApi.upload(file);
      const path = res.data?.data?.path;
      if (path) handleProfileChange("coverPicture", path);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await usersApi.updateProfile({
        name: form.name.trim() || undefined,
        profilePicture: form.profilePicture || undefined,
        coverPicture: form.coverPicture || undefined,
      });
      const data = res.data?.data;
      if (data && authUser) {
        setUser({
          ...authUser,
          name: data.name,
          profilePicture: data.profilePicture ?? authUser.profilePicture,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...authUser,
            name: data.name,
            profilePicture: data.profilePicture ?? authUser.profilePicture,
          })
        );
      }
      setProfile(data ?? profile);
      alert("Profil enregistré.");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Le nouveau mot de passe doit faire au moins 6 caractères.");
      return;
    }
    setPasswordSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("Mot de passe modifié.");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex h-screen bg-[#f8fafc]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const campusName = profile.campus?.name ?? "—";
  const className = profile.class?.name ?? "—";
  const levelName = profile.level?.name ?? "—";

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden text-left">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20">
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Paramètres
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Mettre à jour votre profil
                  </p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                  <FiEdit3 size={20} />
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="p-8 md:p-12 space-y-10">
                {/* Nom */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-600 uppercase ml-2 flex items-center gap-2">
                    <FiUser size={14} /> Nom
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  />
                </div>

                {/* Photo de profil : PC ou Avatar */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-indigo-600 uppercase ml-2 flex items-center gap-2">
                    <FiCamera size={14} /> Photo de profil
                  </label>
                  <div className="flex gap-4 mb-2">
                    <button
                      type="button"
                      onClick={() => setProfilePictureSource("avatar")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        profilePictureSource === "avatar"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Avatar (galerie)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfilePictureSource("pc")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        profilePictureSource === "pc"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Depuis mon PC
                    </button>
                  </div>
                  {profilePictureSource === "pc" && (
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200">
                        Choisir un fichier
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePictureUpload}
                        />
                      </label>
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100">
                        <img
                          src={resolveAvatarUrl(form.profilePicture)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  {profilePictureSource === "avatar" && (
                    <div className="flex flex-wrap gap-2">
                      {avatars.map((a) => (
                        <button
                          key={a.file}
                          type="button"
                          onClick={() => handleProfileChange("profilePicture", a.file)}
                          className={`w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 ${
                            form.profilePicture === a.file
                              ? "border-indigo-600 ring-2 ring-indigo-200"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={a.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Photo de couverture : PC ou Avatar */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-indigo-600 uppercase ml-2 flex items-center gap-2">
                    <FiMonitor size={14} /> Photo de couverture
                  </label>
                  <div className="flex gap-4 mb-2">
                    <button
                      type="button"
                      onClick={() => setCoverPictureSource("avatar")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        coverPictureSource === "avatar"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Avatar (galerie)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverPictureSource("pc")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        coverPictureSource === "pc"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Depuis mon PC
                    </button>
                  </div>
                  {coverPictureSource === "pc" && (
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200">
                        Choisir un fichier
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverPictureUpload}
                        />
                      </label>
                      <div className="w-24 h-14 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100">
                        <img
                          src={resolveAvatarUrl(form.coverPicture || "couverture-default.jpg")}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  {coverPictureSource === "avatar" && (
                    <div className="flex flex-wrap gap-2">
                      {avatars.map((a) => (
                        <button
                          key={a.file}
                          type="button"
                          onClick={() => handleProfileChange("coverPicture", a.file)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 ${
                            form.coverPicture === a.file
                              ? "border-indigo-600 ring-2 ring-indigo-200"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={a.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Champs désactivés : email, campus, class, level */}
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 border-l-4 border-slate-300">
                    Informations non modifiables
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">
                        <FiMail size={14} /> Email
                      </label>
                      <input
                        type="text"
                        value={profile.email ?? ""}
                        disabled
                        className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">
                        <FiMapPin size={14} /> Campus
                      </label>
                      <input
                        type="text"
                        value={campusName}
                        disabled
                        className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">
                        <FiLayers size={14} /> Classe
                      </label>
                      <input
                        type="text"
                        value={className}
                        disabled
                        className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">
                        <FiLayers size={14} /> Niveau
                      </label>
                      <input
                        type="text"
                        value={levelName}
                        disabled
                        className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-3 bg-slate-900 text-white px-12 py-5 rounded-4xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                  >
                    <FiSave size={16} />
                    {saving ? "Enregistrement..." : "Enregistrer le profil"}
                  </button>
                </div>
              </form>

              {/* Mot de passe : uniquement pour les comptes inscrits par email (pas Google/GitHub) */}
              {profile.provider === "local" && (
              <div className="p-8 md:p-12 pt-0">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] px-2 border-l-4 border-indigo-600 mb-6">
                  Mot de passe
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 flex items-center gap-2">
                      <FiLock size={14} /> Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                      }
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-800 focus:border-indigo-500 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-800 focus:border-indigo-500 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-[12px] font-black text-slate-800 focus:border-indigo-500 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-wide hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {passwordSaving ? "Envoi..." : "Changer le mot de passe"}
                  </button>
                </form>
              </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
