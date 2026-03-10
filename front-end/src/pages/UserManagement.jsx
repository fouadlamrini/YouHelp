import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import Messaging from "../components/Messaging";
import { FiUserPlus, FiTrash2, FiEdit, FiSearch, FiX, FiSave, FiCheck } from "react-icons/fi";
import api, { usersApi, campusApi, classApi, levelApi, rolesApi, avatarsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../services/socket";

const roleBadgeClass = (roleName) => {
  const r = roleName?.toLowerCase?.() ?? "";
  if (r === "super_admin") return "bg-rose-100 text-rose-600";
  if (r === "admin") return "bg-amber-100 text-amber-600";
  if (r === "formateur") return "bg-indigo-100 text-indigo-600";
  return "bg-emerald-100 text-emerald-600";
};

const statusBadgeClass = (status) => {
  if (status === "active") return "bg-emerald-100 text-emerald-600";
  if (status === "inactive") return "bg-slate-100 text-slate-600";
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
  const [filterCampus, setFilterCampus] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
  const [formSuccess, setFormSuccess] = useState("");
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [lastUpdatedUserId, setLastUpdatedUserId] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 10;
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
    const params = {};
    if (filterCampus) params.campus = filterCampus;
    if (filterClass) params.class = filterClass;
    if (filterLevel) params.level = filterLevel;
    setLoading(true);
    usersApi
      .getAll(params)
      .then((r) => setUsers(r.data?.data ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    const isAdminLike = authUser?.role === "super_admin" || authUser?.role === "admin";

    const campusPromise = isAdminLike
      ? campusApi
          .getAll()
          .then((r) => setCampuses(r.data?.data ?? []))
          .catch(() => setCampuses([]))
      : Promise.resolve().then(() => setCampuses([]));

    const classPromise = isAdminLike
      ? classApi
          .getAll()
          .then((r) => setClasses(r.data?.data ?? []))
          .catch(() => setClasses([]))
      : Promise.resolve().then(() => setClasses([]));

    const levelPromise = isAdminLike
      ? levelApi
          .getAll()
          .then((r) => setLevels(r.data?.data ?? []))
          .catch(() => setLevels([]))
      : Promise.resolve().then(() => setLevels([]));

    Promise.all([
      campusPromise,
      classPromise,
      levelPromise,
      rolesApi.getAll().then((r) => setRoles(r.data?.data ?? [])).catch(() => setRoles([])),
      avatarsApi
        .getAll()
        .then((r) => setAvailableAvatars(r.data?.data ?? []))
        .catch(() => setAvailableAvatars([])),
    ]).finally(() => setLoading(false));
  }, [authUser?.role]);

  useEffect(() => {
    const params = {};
    if (filterCampus) params.campus = filterCampus;
    if (filterClass) params.class = filterClass;
    if (filterLevel) params.level = filterLevel;
    setLoading(true);
    usersApi
      .getAll(params)
      .then((r) => setUsers(r.data?.data ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [filterCampus, filterClass, filterLevel]);

  // Real-time presence updates for users list
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = ({ userId, status, lastSeen }) => {
      const id = String(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u && u._id && String(u._id) === id
            ? {
                ...u,
                online: status === "online",
                lastSeen: lastSeen || u.lastSeen,
              }
            : u
        )
      );
    };
    socket.on("user:status", handler);
    return () => {
      socket.off("user:status", handler);
    };
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
    setFormSuccess("");
    const name = formData.name?.trim() || "";
    const email = formData.email?.trim() || "";
    const password = formData.password || "";

    if (!name) {
      setFormError("Le nom est requis.");
      return;
    }
    if (name.length < 2) {
      setFormError("Le nom doit contenir au moins 2 caractères.");
      return;
    }
    if (!email) {
      setFormError("L'email est requis.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Veuillez entrer une adresse email valide.");
      return;
    }
    if (!password) {
      setFormError("Le mot de passe est requis.");
      return;
    }
    if (password.length < 6) {
      setFormError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (!isFormateur && !formData.role) {
      setFormError("Le rôle est requis.");
      return;
    }
    const selectedRoleName = roles.find((r) => r._id === formData.role)?.name || "";
    if (!isFormateur && selectedRoleName !== "admin" && (!formData.class || !formData.level)) {
      setFormError("Classe et niveau sont requis pour ce rôle.");
      return;
    }
    if (!isAdmin && !isFormateur && !formData.campus) {
      setFormError("Le campus est requis.");
      return;
    }
    setSubmitLoading(true);
    const isRoleAdmin = selectedRoleName === "admin";
    const payload = {
      name,
      email,
      password,
      role: isFormateur && roleEtudiant?._id ? roleEtudiant._id : (formData.role || undefined),
      campus: isFormateur && formateurCampusId ? formateurCampusId : (isAdmin && adminCampusId ? adminCampusId : (formData.campus || undefined)),
      class: isRoleAdmin ? undefined : (isFormateur && formateurClassId ? formateurClassId : (formData.class || undefined)),
      level: isRoleAdmin ? undefined : (isFormateur && formateurLevelId ? formateurLevelId : (formData.level || undefined)),
      profilePicture: formData.profilePicture || undefined,
    };
    usersApi
      .create(payload)
      .then(() => {
        setFormData({ name: "", email: "", password: "", campus: "", class: "", level: "", role: "", profilePicture: "" });
        setFormSuccess("Utilisateur créé avec succès.");
        setIsCreateModalOpen(false);
        fetchUsers();
      })
      .catch((err) => setFormError(err.response?.data?.message || "Erreur"))
      .finally(() => setSubmitLoading(false));
  };

  const handleDelete = (user) => {
    setConfirmAction({ type: "delete", user });
  };

  const handleConfirmAction = () => {
    if (!confirmAction?.user) return;
    if (confirmAction.type === "delete") {
      usersApi
        .delete(confirmAction.user._id)
        .then(() => { setConfirmAction(null); fetchUsers(); })
        .catch((err) => alert(err.response?.data?.message || "Erreur"));
    } else if (confirmAction.type === "reject") {
      usersApi
        .rejectUser(confirmAction.user._id)
        .then(() => { setConfirmAction(null); fetchUsers(); })
        .catch((err) => alert(err.response?.data?.message || "Non autorisé pour cet utilisateur"));
    }
  };

  const handleAcceptUser = (user) => {
    usersApi
      .acceptUser(user._id)
      .then(() => fetchUsers())
      .catch((err) => alert(err.response?.data?.message || "Non autorisé pour cet utilisateur"));
  };

  const handleToggleStatus = (u) => {
    const newStatus = u.status === "active" ? "inactive" : "active";
    usersApi
      .update(u._id, { status: newStatus })
      .then(() => {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === u._id ? { ...user, status: newStatus } : user
          )
        );
      })
      .catch((err) => alert(err.response?.data?.message || "Erreur"));
  };

  const handleRejectUser = (user) => {
    setConfirmAction({ type: "reject", user });
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
      .then((res) => {
        const updated = res.data?.data ?? res.data ?? null;
        setIsEditModalOpen(false);
        setFormError("");
        setFormSuccess("Utilisateur mis à jour avec succès.");
        if (updated && updated._id) {
          setUsers((prev) =>
            prev.map((u) => (u._id === updated._id ? updated : u))
          );
          setLastUpdatedUserId(updated._id);
          setTimeout(() => setLastUpdatedUserId(null), 5000);
        }
      })
      .catch((err) => alert(err.response?.data?.message || "Erreur"))
      .finally(() => setSubmitLoading(false));
  };

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const currentUserPage = Math.min(userPage, totalUserPages);
  const userStartIndex = (currentUserPage - 1) * USERS_PER_PAGE;
  const userPageItems = filteredUsers.slice(userStartIndex, userStartIndex + USERS_PER_PAGE);

  const getUserPageNumbers = () => {
    const pages = [];
    const maxButtons = 7;
    if (totalUserPages <= maxButtons) {
      for (let i = 1; i <= totalUserPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }
    const showLeftEllipsis = currentUserPage > 3;
    const showRightEllipsis = currentUserPage < totalUserPages - 2;
    pages.push(1);
    const start = Math.max(2, currentUserPage - 1);
    const end = Math.min(totalUserPages - 1, currentUserPage + 1);
    if (showLeftEllipsis && start > 2) pages.push("...");
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    if (showRightEllipsis && end < totalUserPages - 1) pages.push("...");
    pages.push(totalUserPages);
    return pages;
  };

  const userPageNumbers = getUserPageNumbers();

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight text-left">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1 text-left">
                  Gérer les profils et les accès
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    campus: "",
                    class: "",
                    level: "",
                    role: "",
                    profilePicture: "",
                  });
                  setFormError("");
                  setFormSuccess("");
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
              >
                <FiUserPlus size={18} />
                Créer un utilisateur
              </button>
            </div>

            {formSuccess && (
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                <span>{formSuccess}</span>
                <button type="button" onClick={() => setFormSuccess("")} className="p-1 hover:bg-emerald-100 rounded">
                  <FiX size={14} />
                </button>
              </div>
            )}

            <div className="space-y-4">
                <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <FiSearch className="text-slate-400 ml-2 shrink-0" size={20} />
                    <input
                      type="text"
                      placeholder="Filtrer par nom ou email..."
                      className="flex-1 min-w-0 bg-transparent border-none outline-none text-[11px] font-bold text-slate-600"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtres :</span>
                    <select
                      value={filterCampus}
                      onChange={(e) => setFilterCampus(e.target.value)}
                      className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="">Tous les campus</option>
                      {campuses.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                      className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="">Toutes les classes</option>
                      {classes.map((cl) => (
                        <option key={cl._id} value={cl._id}>{cl.name}{cl.nickName ? ` (${cl.nickName})` : ""}</option>
                      ))}
                    </select>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="">Tous les niveaux</option>
                      {levels.map((l) => (
                        <option key={l._id} value={l._id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
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
                        {userPageItems.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                              Aucun utilisateur.
                            </td>
                          </tr>
                        ) : (
                          userPageItems.map((user) => (
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
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">
                                    {user.campus?.name ?? "—"}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400">
                                    {user.class?.name ?? "—"} • {user.level?.name ?? "—"}
                                  </p>
                                  {lastUpdatedUserId === user._id && (
                                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.16em]">
                                      Mis à jour avec succès
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={
                                      "text-[9px] font-black uppercase px-2 py-1 rounded-md " +
                                      statusBadgeClass(user.status)
                                    }
                                  >
                                    {user.status === "active"
                                      ? "Actif"
                                      : user.status === "inactive"
                                        ? "Inactif"
                                        : user.status === "rejected"
                                          ? "Refusé"
                                          : "En attente"}
                                  </span>
                                  {(user.status === "active" || user.status === "inactive") &&
                                    (user._id !== authUser?.id) && (
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={user.status === "active"}
                                      onClick={() => handleToggleStatus(user)}
                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                        user.status === "active"
                                          ? "bg-emerald-500 border-emerald-500"
                                          : "bg-slate-200 border-slate-200"
                                      }`}
                                      title={user.status === "active" ? "Désactiver" : "Activer"}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                                          user.status === "active" ? "translate-x-5" : "translate-x-0.5"
                                        }`}
                                      />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="flex justify-end gap-2 pr-4">
                                  {user.status === "pending" && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleAcceptUser(user)}
                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                        title="Accepter"
                                      >
                                        <FiCheck size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRejectUser(user)}
                                        className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                        title="Refuser"
                                      >
                                        <FiX size={14} />
                                      </button>
                                    </>
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
                {filteredUsers.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>
                      Page <span className="font-bold">{currentUserPage}</span> sur{" "}
                      <span className="font-bold">{totalUserPages}</span> —{" "}
                      <span className="font-bold">{filteredUsers.length}</span> utilisateurs
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                        disabled={currentUserPage === 1}
                        className="px-3 py-1 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-slate-50"
                      >
                        Précédent
                      </button>
                      {userPageNumbers.map((p, index) =>
                        p === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-[10px] font-bold text-slate-400 select-none"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setUserPage(p)}
                            className={
                              "min-w-[28px] px-2 py-1 rounded-xl text-[10px] font-black tracking-widest border " +
                              (p === currentUserPage
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")
                            }
                          >
                            {p}
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                        disabled={currentUserPage === totalUserPages}
                        className="px-3 py-1 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-slate-50"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsCreateModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase">Créer un utilisateur</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 bg-slate-50 rounded-xl hover:text-rose-500 transition-colors"
              >
                <FiX size={24} />
              </button>
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
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 text-left block">Email & Password</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="email@youcode.ma"
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
                    <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 cursor-not-allowed" title="Votre campus (lecture seule)">
                      {(isAdmin ? adminCampusName : formateurCampusName) || "—"}
                    </div>
                  ) : (
                    <select name="campus" value={formData.campus} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                      <option value="">Sélectionner</option>
                      {campuses.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Rôle</label>
                  {isFormateur ? (
                    <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 cursor-not-allowed" title="Un formateur ne peut créer que des étudiants">
                      Étudiant
                    </div>
                  ) : (
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                      <option value="">Sélectionner</option>
                      {(isAdmin ? rolesForAdmin : isSuperAdmin ? rolesForSuperAdmin : roles).map((r) => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              {(() => {
                const selectedRoleName = roles.find((r) => r._id === formData.role)?.name || "";
                if (selectedRoleName === "admin") return null;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Classe</label>
                      {isFormateur ? (
                        <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 cursor-not-allowed" title="Votre classe (lecture seule)">
                          {formateurClassName || "—"}
                        </div>
                      ) : (
                        <select name="class" value={formData.class} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                          <option value="">Sélectionner</option>
                          {classes.map((cl) => (
                            <option key={cl._id} value={cl._id}>{cl.name}{cl.nickName ? ` (${cl.nickName})` : ""}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Level</label>
                      {isFormateur ? (
                        <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 cursor-not-allowed" title="Votre level (lecture seule)">
                          {formateurLevelName || "—"}
                        </div>
                      ) : (
                        <select name="level" value={formData.level} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                          <option value="">Sélectionner</option>
                          {levels.map((l) => (
                            <option key={l._id} value={l._id}>{l.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 block">Photo de profil / Avatar</label>
                <div className="flex flex-wrap gap-3">
                  {availableAvatars.map((av) => {
                    const url = resolveAvatarUrl(av.url || av);
                    const selected = formData.profilePicture === url;
                    return (
                      <button key={url} type="button" onClick={() => setFormData((prev) => ({ ...prev, profilePicture: url }))} className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${selected ? "border-indigo-500 ring-2 ring-indigo-300" : "border-transparent hover:border-slate-200"}`}>
                        <img src={url} alt="avatar" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-2xl border border-dashed border-slate-300 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
                    Depuis mon PC
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLocalAvatarChange} />
                  <input type="text" name="profilePicture" value={formData.profilePicture} onChange={handleInputChange} placeholder="URL photo personnelle" className="flex-1 min-w-[140px] p-3 bg-slate-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              {formError && (
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  <span>{formError}</span>
                  <button type="button" onClick={() => setFormError("")} className="p-1 hover:bg-rose-100 rounded">
                    <FiX size={14} />
                  </button>
                </div>
              )}
              <button type="submit" disabled={submitLoading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all mt-4 shadow-xl disabled:opacity-50">
                Créer le profil
              </button>
            </form>
          </div>
        </div>
      )}

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

      {confirmAction && confirmAction.user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
            <div className="text-center space-y-4">
              <p className="text-slate-700 font-bold">
                {confirmAction.type === "delete"
                  ? `Supprimer l'utilisateur ${confirmAction.user.name || confirmAction.user.email} ?`
                  : `Refuser l'utilisateur ${confirmAction.user.name || confirmAction.user.email} ?`}
              </p>
              <div className="flex gap-4 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Messaging />
    </div>
  );
};

export default UserManagement;
