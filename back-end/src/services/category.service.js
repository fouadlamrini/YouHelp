const Category = require("../models/Category");

async function getAll() {
  const categories = await Category.find().sort({ createdAt: -1 });
  return { data: categories };
}

async function create(body) {
  const { name, icon, color } = body;
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const existing = await Category.findOne({
    name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  });
  if (existing) return { error: { status: 400, message: "Une catégorie avec ce nom existe déjà." } };
  const category = await Category.create({
    name: trimmedName,
    icon: icon || null,
    color: color || null,
  });
  return { data: category };
}

async function update(id, body) {
  const { name, icon, color } = body;
  const category = await Category.findByIdAndUpdate(
    id,
    {
      name,
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
    },
    { new: true, runValidators: true }
  );
  if (!category) return { error: { status: 404, message: "Category not found" } };
  return { data: category };
}

async function deleteCategory(id) {
  const category = await Category.findByIdAndDelete(id);
  if (!category) return { error: { status: 404, message: "Category not found" } };
  return { ok: true };
}

module.exports = { getAll, create, update, deleteCategory };
