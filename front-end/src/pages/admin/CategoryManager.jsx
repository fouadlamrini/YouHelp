import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import NavbarLoggedIn from "../../components/NavbarLoggedIn";
import Messaging from "../../components/Messaging";
import { 
  FiPlus, FiEdit3, FiTrash, FiGrid, FiHash, 
  FiSettings, FiActivity, FiCode, FiCpu, FiBook, FiLayers, FiStar
} from "react-icons/fi";
import { categoryApi, subcategoryApi } from "../../services/api";

const ICON_MAP = {
  FiHash, FiGrid, FiSettings, FiActivity, FiCode, FiCpu, FiBook, FiLayers, FiStar,
};

const CategoryManager = () => {
  const ICON_CHOICES = [
    { value: "", label: "Aucun" },
    { value: "FiHash", label: "Hashtag" },
    { value: "FiGrid", label: "Grid" },
    { value: "FiSettings", label: "Settings" },
    { value: "FiActivity", label: "Activity" },
    { value: "FiCode", label: "Code" },
    { value: "FiCpu", label: "Cpu" },
    { value: "FiBook", label: "Book" },
    { value: "FiLayers", label: "Layers" },
    { value: "FiStar", label: "Star" },
  ];

  const COLOR_CHOICES = [
    { value: "#007FFF", label: "azure" },
    { value: "#EAB308", label: "yellow" },
    { value: "#FFFFF0", label: "ivory" },
    { value: "#36454F", label: "charcoal" },
    { value: "#DC2626", label: "red" },
    { value: "#FF69B4", label: "hot pink" },
    { value: "#06B6D4", label: "cyan" },
    { value: "#2563EB", label: "blue" },
    { value: "#FFD700", label: "golden" },
    { value: "#FFFFFF", label: "white" },
    { value: "#000000", label: "black" },
    { value: "#DC143C", label: "crimson" },
    { value: "#D946EF", label: "magenta" },
    { value: "#0D9488", label: "teal" },
    { value: "#1E3A8A", label: "navy blue" },
    { value: "#F97316", label: "orange" },
    { value: "#C0C0C0", label: "silver" },
    { value: "#92400E", label: "brown" },
    { value: "#800000", label: "maroon" },
    { value: "#9333EA", label: "purple" },
    { value: "#22C55E", label: "green" },
  ];
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "",
    color: "",
  });

  const [targetCategoryId, setTargetCategoryId] = useState(null);
  const [editingSubId, setEditingSubId] = useState(null);
  const [subForm, setSubForm] = useState({ name: "" });
  const [categoryMessage, setCategoryMessage] = useState({ type: null, text: "" });
  const [subMessage, setSubMessage] = useState({ type: null, text: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const setCategoryFeedback = (type, text) => {
    setCategoryMessage({ type, text });
    setTimeout(() => setCategoryMessage({ type: null, text: "" }), 5000);
  };
  const setSubFeedback = (type, text) => {
    setSubMessage({ type, text });
    setTimeout(() => setSubMessage({ type: null, text: "" }), 5000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, subRes] = await Promise.all([
        categoryApi.getAll(),
        subcategoryApi.getAll(),
      ]);
      setCategories(catRes.data.data || []);
      setSubcategories(subRes.data.data || []);
    } catch (e) {
      console.error("Failed to load categories/subcategories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: "", icon: "", color: "" });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const trimmedName = categoryForm.name.trim();
    if (!trimmedName) {
      setCategoryFeedback("error", "Le nom de la catégorie est requis.");
      return;
    }
    setCategoryMessage({ type: null, text: "" });
    const payload = { ...categoryForm, name: trimmedName };
    try {
      if (editingCategoryId) {
        await categoryApi.update(editingCategoryId, payload);
        setCategoryFeedback("success", "Catégorie mise à jour avec succès.");
      } else {
        await categoryApi.create(payload);
        setCategoryFeedback("success", "Catégorie créée avec succès.");
      }
      resetCategoryForm();
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement de la catégorie.";
      setCategoryFeedback("error", msg);
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name || "",
      icon: category.icon || "",
      color: category.color || "",
    });
  };

  const openCategoryDeleteConfirm = (cat) => {
    setDeleteConfirm({ type: "category", id: cat._id, name: cat.name || "cette catégorie" });
  };

  const handleCategoryDelete = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "category") return;
    const id = deleteConfirm.id;
    setDeleteConfirm(null);
    try {
      await categoryApi.delete(id);
      setCategoryFeedback("success", "Catégorie supprimée avec succès.");
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la suppression de la catégorie.";
      setCategoryFeedback("error", msg);
    }
  };

  const resetSubForm = () => {
    setTargetCategoryId(null);
    setEditingSubId(null);
    setSubForm({ name: "" });
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim() || !targetCategoryId) {
      setSubFeedback("error", "Le nom et la catégorie parente sont requis.");
      return;
    }
    const targetCategory = categories.find((c) => c._id === targetCategoryId);
    if (!targetCategory) return;
    setSubMessage({ type: null, text: "" });
    try {
      if (editingSubId) {
        await subcategoryApi.update(editingSubId, {
          name: subForm.name.trim(),
          category: targetCategory.name,
        });
        setSubFeedback("success", "Sous-catégorie mise à jour avec succès.");
      } else {
        await subcategoryApi.create({
          name: subForm.name.trim(),
          category: targetCategory.name,
        });
        setSubFeedback("success", "Sous-catégorie créée avec succès.");
      }
      resetSubForm();
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement de la sous-catégorie.";
      setSubFeedback("error", msg);
    }
  };

  const openSubDeleteConfirm = (sub) => {
    setDeleteConfirm({ type: "subcategory", id: sub._id, name: sub.name || "cette sous-catégorie" });
  };

  const handleSubDelete = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "subcategory") return;
    const id = deleteConfirm.id;
    setDeleteConfirm(null);
    try {
      await subcategoryApi.delete(id);
      setSubFeedback("success", "Sous-catégorie supprimée avec succès.");
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la suppression de la sous-catégorie.";
      setSubFeedback("error", msg);
    }
  };

  const handleSubEdit = (sub, parentCategoryId) => {
    setTargetCategoryId(parentCategoryId);
    setEditingSubId(sub._id);
    setSubForm({ name: sub.name || "" });
  };

  const isHexColor = (v) => typeof v === "string" && v.startsWith("#");
  const getColorStyle = (color) => {
    if (!color) return {};
    if (isHexColor(color)) return { backgroundColor: color };
    return {};
  };
  const getColorClass = (color) => {
    if (!color || isHexColor(color)) return "bg-indigo-500";
    return color;
  };

  const IconPicker = ({ value, onChange }) => (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-[10px] font-black text-slate-500 uppercase mr-1">Icon</span>
      {ICON_CHOICES.map((opt) => {
        const IconComponent = opt.value ? ICON_MAP[opt.value] : null;
        const selected = value === opt.value;
        return (
          <button
            key={opt.value || "none"}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
              selected ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-400 hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            {IconComponent ? <IconComponent size={20} /> : <span className="text-xs">—</span>}
          </button>
        );
      })}
    </div>
  );

  const ColorPicker = ({ value, onChange }) => (
    <div className="flex flex-wrap gap-3 items-end">
      <span className="text-[10px] font-black text-slate-500 uppercase w-full">Couleur</span>
      {COLOR_CHOICES.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex flex-col items-center gap-1 group"
          >
            <span
              className={`w-8 h-8 rounded-full border-2 shrink-0 transition-all ${
                selected ? "border-slate-900 ring-2 ring-indigo-400" : "border-white shadow-md group-hover:scale-110"
              }`}
              style={{ backgroundColor: opt.value }}
            />
            <span className="text-[9px] font-bold text-slate-600 capitalize">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <NavbarLoggedIn />
        
        <main className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            
            {/* --- TOP BAR + CATEGORY FORM --- */}
            <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <FiGrid size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800 tracking-tight">System Categories</h1>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Workspace / Categories</p>
                </div>
              </div>
              <form
                onSubmit={handleCategorySubmit}
                className="flex flex-col gap-4"
              >
                {categoryMessage.text && (
                  <div
                    className={`px-4 py-3 rounded-xl text-xs font-bold ${
                      categoryMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {categoryMessage.text}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                  <IconPicker
                    value={categoryForm.icon}
                    onChange={(icon) => setCategoryForm((prev) => ({ ...prev, icon }))}
                  />
                  <div className="flex gap-2 ml-auto">
                    <button
                      type="submit"
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-indigo-600 transition-all active:scale-95"
                    >
                      <FiPlus size={16} />
                      {editingCategoryId ? "Update" : "Create"}
                    </button>
                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                <ColorPicker
                  value={categoryForm.color}
                  onChange={(color) => setCategoryForm((prev) => ({ ...prev, color }))}
                />
              </form>
            </div>

            {subMessage.text && (
              <div
                className={`mb-6 px-4 py-3 rounded-xl text-xs font-bold ${
                  subMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {subMessage.text}
              </div>
            )}

            {/* --- GRID OF CATEGORIES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {loading && (
                <div className="col-span-full text-center text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                  Loading categories...
                </div>
              )}
              {!loading && categories.map((cat) => {
                const subsForCategory = subcategories.filter(
                  (sub) => sub.category && sub.category._id === cat._id
                );
                const colorClass = getColorClass(cat.color);
                const colorStyle = getColorStyle(cat.color);
                const CatIcon = (cat.icon && ICON_MAP[cat.icon]) ? ICON_MAP[cat.icon] : FiHash;

                return (
                <div key={cat._id} className="group bg-white rounded-[2.5rem] border border-slate-100 p-6 hover:border-indigo-200 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50">
                  
                  {/* Decorative Background Pattern */}
                  <div
                    className={`absolute -top-10 -right-10 w-32 h-32 opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700 ${!isHexColor(cat.color) ? colorClass : ""}`}
                    style={isHexColor(cat.color) ? { backgroundColor: cat.color } : {}}
                  />

                  <div className="relative z-10">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-inner ${!isHexColor(cat.color) ? colorClass : ""}`}
                          style={isHexColor(cat.color) ? { backgroundColor: cat.color } : {}}
                        >
                          <CatIcon size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-800">{cat.name}</h2>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <FiActivity size={12} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Active Directory</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleCategoryEdit(cat)}
                          className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <FiEdit3 size={18} />
                        </button>
                        <button
                          onClick={() => openCategoryDeleteConfirm(cat)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <FiTrash size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Sub-categories Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-Modules</span>
                        <span className="w-10 h-0.5 bg-slate-100 flex-grow mx-4"></span>
                        
                        {/* --- NEW ADD ICON CIRCLE --- */}
                        <button 
                          onClick={() => {
                            setTargetCategoryId(cat._id);
                            setSubForm({ name: "", icon: "", color: "" });
                          }}
                          title="Add Sub-category"
                          className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm border border-indigo-100 active:scale-90"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {subsForCategory.map((sub) => (
                          <div key={sub._id} className="flex items-center group/item">
                            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 group-hover/item:border-indigo-200 group-hover/item:bg-white transition-all flex items-center gap-2">
                              {sub.name}
                              <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button
                                  className="text-slate-300 hover:text-indigo-500"
                                  onClick={() => handleSubEdit(sub, cat._id)}
                                  type="button"
                                >
                                  <FiEdit3 size={10} />
                                </button>
                                <button
                                  className="text-slate-300 hover:text-rose-500"
                                  onClick={() => openSubDeleteConfirm(sub)}
                                >
                                  <FiTrash size={10}/>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {targetCategoryId === cat._id && (
                        <form
                          onSubmit={handleSubSubmit}
                          className="mt-4 flex flex-col gap-3"
                        >
                          <input
                            type="text"
                            placeholder="SubCategory name"
                            value={subForm.name}
                            onChange={(e) =>
                              setSubForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 w-full max-w-xs"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-[11px] font-black hover:bg-indigo-700"
                            >
                              Add Sub-category
                            </button>
                            <button
                              type="button"
                              onClick={resetSubForm}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                 
                  </div>
                </div>
              )})}
              
              {(!loading && categories.length === 0) && (
                <div className="col-span-full border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-10 bg-slate-50/50">
                  <p className="font-black text-slate-400 uppercase text-xs tracking-[0.2em]">
                    Aucune catégorie pour le moment — crée-en une ci-dessus.
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Modal de confirmation de suppression */}
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
                <FiTrash size={24} className="text-rose-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800">
                {deleteConfirm.type === "category" ? "Supprimer la catégorie ?" : "Supprimer la sous-catégorie ?"}
              </h3>
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
                onClick={deleteConfirm.type === "category" ? handleCategoryDelete : handleSubDelete}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <Messaging />
    </div>
  );
};

export default CategoryManager;

