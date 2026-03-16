const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

async function getAll() {
  const subCategories = await SubCategory.find()
    .populate("category", "name")
    .sort({ createdAt: -1 });
  return { data: subCategories };
}

async function getByCategory(categoryId) {
  if (!categoryId) return { error: { status: 400, message: "categoryId is required" } };
  const subCategories = await SubCategory.find({ category: categoryId })
    .populate("category", "name")
    .sort({ createdAt: -1 });
  return { data: subCategories };
}

async function create(body) {
  const { name, category: categoryName } = body;
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const existingCategory = await Category.findOne({ name: categoryName });
  if (!existingCategory) {
    return { error: { status: 400, message: "Catégorie parente introuvable." } };
  }
  try {
    const subCategory = await SubCategory.create({
      name: trimmedName,
      category: existingCategory._id,
    });
    return { data: subCategory };
  } catch (err) {
    if (err.code === 11000) {
      return { error: { status: 400, message: "Cette sous-catégorie existe déjà dans cette catégorie." } };
    }
    throw err;
  }
}

async function update(id, body) {
  const { name, category: categoryName } = body;
  const existingCategory = await Category.findOne({ name: categoryName });
  if (!existingCategory) return { error: { status: 400, message: "Category not found" } };
  try {
    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      {
        name,
        category: existingCategory._id,
      },
      { new: true, runValidators: true }
    );
    if (!subCategory) return { error: { status: 404, message: "SubCategory not found" } };
    return { data: subCategory };
  } catch (err) {
    if (err.code === 11000) {
      return { error: { status: 400, message: "SubCategory already exists in this category" } };
    }
    throw err;
  }
}

async function deleteSubCategory(id) {
  const subCategory = await SubCategory.findByIdAndDelete(id);
  if (!subCategory) return { error: { status: 404, message: "SubCategory not found" } };
  return { ok: true };
}

module.exports = { getAll, getByCategory, create, update, deleteSubCategory };
