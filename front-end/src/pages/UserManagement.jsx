import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { FiUserPlus, FiTrash2, FiEdit, FiSearch, FiX, FiSave, FiCheck } from "react-icons/fi";
import api, { usersApi, campusApi, classApi, levelApi, rolesApi, avatarsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const roleBadgeClass = (roleName) => {
  const r = roleName?.toLowerCase?.() ?? "";
  if (r === "super_admin") return "bg-rose-100 text-rose-600";
  if (r === "admin") return "bg-amber-100 text-amber-600";
  if (r === "formateur") return "bg-indigo-100 text-indigo-600";
  return "bg-emerald-100 text-emerald-600";
};

const statusBadgeClass = (status) => {
  if (status === "active") return "bg-emerald-100 text-emerald-600";
  if (status === "rejected") return "bg-rose-100 text-rose-600";
  return "bg-amber-100 text-amber-600";
};

const UserManagement = () => {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    campus: "",
    class: "",
    level: "",
    role: "",
    profilePicture: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const API_ORIGIN = (api.defaults.baseURL || "").replace(/\/api$/, "");

  const resolveAvatarUrl = (src) => {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    // handle stored relative paths (/uploads/... or /avatars/...)
    if (src.startsWith("/uploads") || src.startsWith("/avatars")) {
      return `${API_ORIGIN}${src}`;
    }
    // legacy default name from older docs
    if (src === "default-avatar.png") {
      return `${API_ORIGIN}/avatars/default-avatar.jpg`;
    }
    // default: treat as file inside /avatars
    return `${API_ORIGIN}/avatars/${src}`;
  };

  const fetchUsers = () => {
    usersApi
      .getAll()
      .then((r) => setUsers(r.data?.data ?? []))
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      usersApi.getAll().then((r) => setUsers(r.data?.data ?? [])).catch(() => setUsers([])),
      campusApi.getAll().then((r) => setCampuses(r.data?.data ?? [])).catch(() => setCampuses([])),
      classApi.getAll().then((r) => setClasses(r.data?.data ?? [])).catch(() => setClasses([])),
      levelApi.getAll().then((r) => setLevels(r.data?.data ?? [])).catch(() => setLevels([])),
      rolesApi.getAll().then((r) => setRoles(r.data?.data ?? [])).catch(() => setRoles([])),
      avatarsApi
        .getAll()
        .then((r) => setAvailableAvatars(r.data?.data ?? []))
        .catch(() => setAvailableAvatars([])),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authUser?.id) return;
    usersApi
      .getMe()
      .then((r) => setCurrentUser(r.data?.data ?? null))
      .catch(() => setCurrentUser(null));
  }, [authUser?.id]);

  const isAdmin = currentUser?.role?.name === "admin" || authUser?.role === "admin";
  const isFormateur = currentUser?.role?.name === "formateur" || authUser?.role === "formateur";
  const isSuperAdmin = currentUser?.role?.name === "super_admin" || authUser?.role === "super_admin";
  const adminCampusId = currentUser?.campus?._id ?? currentUser?.campus ?? null;
  const adminCampusName = currentUser?.campus?.name ?? (currentUser?.campus ? "—" : null);
  const rolesForAdmin = roles.filter((r) => r.name === "formateur" || r.name === "etudiant");
  const rolesForSuperAdmin = roles.filter((r) => r.name === "admin" || r.name === "formateur" || r.name === "etudiant");
  const roleEtudiant = roles.find((r) => r.name === "etudiant") || null;
  const formateurCampusId = currentUser?.campus?._id ?? currentUser?.campus ?? null;
  const formateurCampusName = currentUser?.campus?.name ?? (currentUser?.campus ? "—" : null);
  const formateurClassId = currentUser?.class?._id ?? currentUser?.class ?? null;
  const formateurClassName = currentUser?.class?.name ?? (currentUser?.class ? "—" : null);
  const formateurLevelId = currentUser?.level?._id ?? currentUser?.level ?? null;
  const formateurLevelName = currentUser?.level?.name ?? (currentUser?.level ? "—" : null);

  useEffect(() => {
    if (isAdmin && adminCampusId && formData.campus !== adminCampusId) {
      setFormData((prev) => ({ ...prev, campus: adminCampusId }));
    }
  }, [isAdmin, adminCampusId]);

  useEffect(() => {
    if (!isFormateur) return;
    const updates = {};
    if (formateurCampusId && formData.campus !== formateurCampusId) updates.campus = formateurCampusId;
    if (roleEtudiant?._id && formData.role !== roleEtudiant._id) updates.role = roleEtudiant._id;
    if (formateurClassId && formData.class !== formateurClassId) updates.class = formateurClassId;
    if (formateurLevelId && formData.level !== formateurLevelId) updates.level = formateurLevelId;
    if (Object.keys(updates).length) setFormData((prev) => ({ ...prev, ...updates }));
  }, [isFormateur, formateurCampusId, formateurClassId, formateurLevelId, roleEtudiant?._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalAvatarChange = async (event, mode = "create") => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setSubmitLoading(true);
      const res = await avatarsApi.upload(file);
      const url = res.data?.data?.url;
      if (url) {
        if (mode === "edit") {
          setEditingUser((prev) => ({ ...prev, profilePicture: url }));
        } else {
          setFormData((prev) => ({ ...prev, profilePicture: url }));
        }
      }
    } catch (err) {
      console.error(err);
      setFormError("Upload de la photo impossible");
    } finally {
      setSubmitLoading(false);
      if (mode === "edit") {
        if (editFileInputRef.current) editFileInputRef.current.value = "";
      } else if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name?.trim() || !formData.email?.trim()) {
      setFormError("Nom et email requis");
      return;
    }
    setSubmitLoading(true);
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password || undefined,
      role: isFormateur && roleEtudiant?._id ? roleEtudiant._id : (formData.role || undefined),
      campus: isFormateur && formateurCampusId ? formateurCampusId : (isAdmin && adminCampusId ? adminCampusId : (formData.campus || undefined)),
      class: isFormateur && formateurClassId ? formateurClassId : (formData.class || undefined),
      level: isFormateur && formateurLevelId ? formateurLevelId : (formData.level || undefined),
      profilePicture: formData.profilePicture || undefined,
    };
    usersApi
      .create(payload)
      .then(() => {
        setFormData({ name: "", email: "", password: "", campus: "", class: "", level: "", role: "", profilePicture: "" });
        fetchUsers();
      })
      .catch((err) => setFormError(err.response?.data?.message || "Erreur"))
      .finally(() => setSubmitLoading(false));
  };

  const handleDelete = (user) => {
    if (!window.confirm("Supprimer l'utilisateur " + user.name + " ?")) return;
    usersApi
      .delete(user._id)
      .then(() => fetchUsers())
      .catch((err) => alert(err.response?.data?.message || "Erreur"));
  };

  const handleAcceptUser = (user) => {
    usersApi
      .acceptUser(user._id)
      .then(() => fetchUsers())
      .catch((err) => alert(err.response?.data?.message || "Non autorisé pour cet utilisateur"));
  };

  const openEditModal = (user) => {
    setEditingUser({
      ...user,
      campus: user.campus?._id ?? user.campus ?? "",
      class: user.class?._id ?? user.class ?? "",
      level: user.level?._id ?? user.level ?? "",
      role: user.role?._id ?? user.role ?? "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitLoading(true);
    const payload = {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role || undefined,
      campus: editingUser.campus || undefined,
      class: editingUser.class || undefined,
      level: editingUser.level || undefined,
      profilePicture: editingUser.profilePicture || undefined,
    };
    usersApi
      .update(editingUser._id, payload)
      .then(() => {
        setIsEditModalOpen(false);
        fetchUsers();
      })
      .catch((err) => alert(err.response?.data?.message || "Erreur"))
      .finally(() => setSubmitLoading(false));
  };

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight text-left">
                Gestion des Utilisateurs
              </h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1 text-left">
                Gérer les profils et les accès
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
                    <FiUserPlus size={20} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Ajouter un profil</h3>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nom Complet</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Nom et Prénom"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 text-left block">
                      Email & Password
                    </label>
                    <div className="space-y-2">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="email@youcode.ma"
                        required
                      />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Campus</label>
                      {isAdmin || isFormateur ? (
                        <div
                          className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 cursor-not-allowed"
                          title="Votre campus (lecture seule)"
                        >
                          {(isAdmin ? adminCampusName : formateurCampusName) || "—"}
                        </div>
                      ) : (
                        <select
                          name="campus"
                          value={formData.campus}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer"
                        >
                          <option value="">Sélectionner</option>
                          {campuses.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Rôle</label>
                      {isFormateur ? (
                        <div
                          className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 cursor-not-allowed"
                          title="Un formateur ne peut créer que des étudiants"
                        >
                          Étudiant
                        </div>
                      ) : (
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer"
                        >
                          <option value="">Sélectionner</option>
                          {(isAdmin ? rolesForAdmin : isSuperAdmin ? rolesForSuperAdmin : roles).map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Classe</label>
                      {isFormateur ? (
                        <div
                          className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 cursor-not-allowed"
                          title="Votre classe (lecture seule)"
                        >
                          {formateurClassName || "—"}
                        </div>
                      ) : (
                        <select
                          name="class"
                          value={formData.class}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer"
                        >
                          <option value="">Sélectionner</option>
                          {classes.map((cl) => (
                            <option key={cl._id} value={cl._id}>
                              {cl.name}{cl.nickName ? ` (${cl.nickName})` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Level</label>
                      {isFormateur ? (
                        <div
                          className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 cursor-not-allowed"
                          title="Votre level (lecture seule)"
                        >
                          {formateurLevelName || "—"}
                        </div>
                      ) : (
                        <select
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer"
                        >
                          <option value="">Sélectionner</option>
                          {levels.map((l) => (
                            <option key={l._id} value={l._id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 block">
                      Photo de profil / Avatar
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {availableAvatars.map((av) => {
                        const url = resolveAvatarUrl(av.url || av);
                        const selected = formData.profilePicture === url;
                        return (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, profilePicture: url }))}
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                              selected ? "border-indigo-500 ring-2 ring-indigo-300" : "border-transparent hover:border-slate-200"
                            }`}
                          >
                            <img src={url} alt="avatar" className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-2xl border border-dashed border-slate-300 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
                      >
                        Depuis mon PC
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLocalAvatarChange}
                      />
                      <input
                        type="text"
                        name="profilePicture"
                        value={formData.profilePicture}
                        onChange={handleInputChange}
                        placeholder="URL photo personnelle"
                        className="flex-1 min-w-[140px] p-3 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  {formError && <p className="text-red-500 text-xs">{formError}</p>}
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all mt-4 shadow-xl disabled:opacity-50"
                  >
                    Créer le profil
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                  <FiSearch className="text-slate-400 ml-2" size={20} />
                  <input
                    type="text"
                    placeholder="Filtrer par nom ou email..."
                    className="flex-1 bg-transparent border-none outline-none text-[11px] font-bold text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center text-slate-500">Chargement...</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Utilisateur
                          </th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Détails
                          </th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Statut
                          </th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-10">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                              Aucun utilisateur.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-50/20 transition-colors">
                              <td className="p-6">
                                <div className="flex items-center gap-4">
                                  {user.profilePicture ? (
                                    <img
                                      src={resolveAvatarUrl(user.profilePicture)}
                                      alt={user.name}
                                      className="w-12 h-12 rounded-2xl object-cover border border-slate-100"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                                      {(user.name || "?").charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-black text-slate-800">{user.name}</p>
                                    <span
                                      className={
                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md " +
                                        roleBadgeClass(user.role?.name ?? user.role)
                                      }
                                    >
                                      {user.role?.name ?? user.role ?? "—"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="flex flex-col">
                                  <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">
                                    {user.campus?.name ?? "—"}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400">
                                    {user.class?.name ?? "—"} • {user.level?.name ?? "—"}
                                  </p>
                                </div>
                              </td>
                              <td className="p-6">
                                <span
                                  className={
                                    "text-[9px] font-black uppercase px-2 py-1 rounded-md " +
                                    statusBadgeClass(user.status)
                                  }
                                >
                                  {user.status === "active" ? "Actif" : user.status === "rejected" ? "Refusé" : "En attente"}
                                </span>
                              </td>
                              <td className="p-6">
                                <div className="flex justify-end gap-2 pr-4">
                                  {user.status === "pending" && (
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptUser(user)}
                                      className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                      title="Accepter"
                                    >
                                      <FiCheck size={14} />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(user)}
                                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                    title="Modifier"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(user)}
                                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                    title="Supprimer"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b pb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase">Modifier Profil</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 bg-slate-50 rounded-xl hover:text-rose-500 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nom Complet</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Campus</label>
                  <select
                    value={editingUser.campus}
                    onChange={(e) => setEditingUser({ ...editingUser, campus: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="">—</option>
                    {campuses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Rôle</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="">—</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Photo de profil / Avatar
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    {editingUser.profilePicture && (
                      <img
                        src={resolveAvatarUrl(editingUser.profilePicture)}
                        alt={editingUser.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-100"
                      />
                    )}
                    <input
                      type="text"
                      value={editingUser.profilePicture || ""}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, profilePicture: e.target.value })
                      }
                      placeholder="URL photo personnelle ou avatar"
                      className="flex-1 p-3 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableAvatars.map((av) => {
                      const url = av.url || av;
                      const selected = editingUser.profilePicture === url;
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() =>
                            setEditingUser((prev) => ({ ...prev, profilePicture: url }))
                          }
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                            selected
                              ? "border-indigo-500 ring-2 ring-indigo-300"
                              : "border-transparent hover:border-slate-200"
                          }`}
                        >
                          <img src={url} alt="avatar" className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-3 py-2 rounded-2xl border border-dashed border-slate-300 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
                    >
                      Depuis mon PC
                    </button>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLocalAvatarChange(e, "edit")}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Classe</label>
                  <select
                    value={editingUser.class}
                    onChange={(e) => setEditingUser({ ...editingUser, class: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="">—</option>
                    {classes.map((cl) => (
                      <option key={cl._id} value={cl._id}>
                        {cl.name}{cl.nickName ? ` (${cl.nickName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Level</label>
                  <select
                    value={editingUser.level}
                    onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="">—</option>
                    {levels.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                <FiSave size={16} /> Mettre à jour
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
