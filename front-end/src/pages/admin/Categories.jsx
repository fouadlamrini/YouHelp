import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  // ===== get all categories =====
  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ===== create or update =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/category/${editingId}`, { name });
      } else {
        await api.post("/category", { name });
      }

      setName("");
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  // ===== delete =====
  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      await api.delete(`/category/${id}`);
      fetchCategories();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ===== edit =====
  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Categories</h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow flex gap-4"
      >
        <input
          type="text"
          placeholder="Category name"
          className="flex-1 border px-4 py-2 rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-t">
                <td className="px-4 py-2">{cat.name}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center py-6 text-gray-500">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
