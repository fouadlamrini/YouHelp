import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import Messaging from "../components/Messaging";
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from "react-icons/fi";
import { campusApi } from "../services/api";

const CampusManager = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: null, text: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const setFeedback = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: "" }), 5000);
  };

  const fetchList = () => {
    setLoading(true);
    campusApi
      .getAll()
      .then((r) => setList(r.data?.data ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name ?? "");
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }
    setSubmitLoading(true);
    setError("");
    const promise = editing
      ? campusApi.update(editing._id, { name: name.trim() })
      : campusApi.create({ name: name.trim() });
    promise
      .then(() => {
        setFormOpen(false);
        setFeedback("success", editing ? "Campus mis à jour avec succès." : "Campus créé avec succès.");
        fetchList();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.response?.data?.error || "Erreur lors de l'enregistrement.";
        setError(msg);
        setFeedback("error", msg);
      })
      .finally(() => setSubmitLoading(false));
  };

  const openDeleteConfirm = (item) => setDeleteConfirm(item);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm._id;
    const name = deleteConfirm.name || "ce campus";
    setDeleteConfirm(null);
    try {
      await campusApi.delete(id);
      setFeedback("success", "Campus supprimé avec succès.");
      fetchList();
    } catch (err) {
      setFeedback("error", err.response?.data?.message || "Erreur lors de la suppression du campus.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarLoggedIn />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg">
                  <FiMapPin size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Campus</h1>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Super Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-700 shadow-lg"
              >
                <FiPlus size={18} /> Nouveau campus
              </button>
            </div>

            {message.text && (
              <div
                className={`px-4 py-3 rounded-xl text-sm font-bold ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {message.text}
              </div>
            )}
            {loading ? (
              <p className="text-slate-500 py-8">Chargement...</p>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom</th>
                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {list.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-8 text-center text-slate-400 text-sm">
                          Aucun campus. Cliquez sur Nouveau campus pour en ajouter.
                        </td>
                      </tr>
                    ) : (
                      list.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/50">
                          <td className="p-5 font-bold text-slate-800">{item.name}</td>
                          <td className="p-5 text-right">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white mr-2"
                            >
                              <FiEdit2 size={16} />
                            </button>
<button
                type="button"
                onClick={() => openDeleteConfirm(item)}
                className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white"
              >
                <FiTrash2 size={16} />
              </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <FiTrash2 size={24} className="text-rose-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Supprimer le campus ?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <span className="font-bold text-slate-800">« {deleteConfirm.name} »</span> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase">
                {editing ? "Modifier le campus" : "Nouveau campus"}
              </h3>
              <button type="button" onClick={() => setFormOpen(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <FiX size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                  placeholder="ex: Safi, Youssoufia"
                  autoFocus
                />
              </div>
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-black text-xs uppercase bg-slate-100 text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-3 rounded-2xl font-black text-xs uppercase bg-indigo-600 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSave size={16} /> {editing ? "Enregistrer" : "Creer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Messaging />
    </div>
  );
};

export default CampusManager;
