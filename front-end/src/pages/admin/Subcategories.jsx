import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Subcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");

  // ================= FETCH =================
  const fetchSubCategories = async () => {
    try {
      const res = await api.get("/subcategory");
      setSubcategories(res.data.data);
    } catch (err) {
      console.log(err);
      setError("mchkil f fetch subcategories");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data.data);
    } catch (err) {
      console.log(err);
      setError("mchkil f fetch categories");
    }
  };

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !category) {
      setError("3ammar name w category");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/subcategory/${editingId}`, {
          name,
          category, // name dyal category
        });
      } else {
        await api.post("/subcategory", {
          name,
          category,
        });
      }

      setName("");
      setCategory("");
      setEditingId(null);
      fetchSubCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("wach mt2kd bghiti tms7 had subcategory؟")) return;

    try {
      await api.delete(`/subcategory/${id}`);
      fetchSubCategories();
    } catch (err) {
      alert("Erreur suppression");
    }
  };

  // ================= EDIT =================
  const handleEdit = (sub) => {
    setEditingId(sub._id);
    setName(sub.name);
    setCategory(sub.category.name); // مهم
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">SubCategories</h2>

      {/* ===== FORM ===== */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 shadow rounded-lg mb-8 space-y-4"
      >
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="text"
          placeholder="Subcategory name"
          className="w-full border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="w-full border px-3 py-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">-- choisir category --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      {/* ===== TABLE ===== */}
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {subcategories.map((sub) => (
            <tr key={sub._id} className="border-b">
              <td className="px-4 py-2">{sub.name}</td>
              <td className="px-4 py-2">{sub.category?.name}</td>
              <td className="px-4 py-2 text-center space-x-2">
                <button
                  onClick={() => handleEdit(sub)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sub._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
