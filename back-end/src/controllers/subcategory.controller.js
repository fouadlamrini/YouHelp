const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

class SubCategoryController {

  // ================= GET ALL =================
  async getAllSubCategories(req, res) {
    try {
      const subCategories = await SubCategory.find()
        .populate("category", "name")
        .sort({ createdAt: -1 });

      res.json({ success: true, data: subCategories });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // ================= GET BY CATEGORY =================
  async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      if (!categoryId) {
        return res.status(400).json({ message: "categoryId is required" });
      }
      const subCategories = await SubCategory.find({ category: categoryId })
        .populate("category", "name")
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: subCategories });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

// ================= CREATE =================
async createSubCategory(req, res) {
  try {
    const { name, category, icon, color } = req.body;
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const existingCategory = await Category.findOne({ name: category });
    if (!existingCategory) {
      return res.status(400).json({ message: "Catégorie parente introuvable." });
    }
    const subCategory = await SubCategory.create({
      name: trimmedName,
      category: existingCategory._id,
      icon: icon || null,
      color: color || null,
    });

    res.status(201).json({ success: true, data: subCategory });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Cette sous-catégorie existe déjà dans cette catégorie." });
    }
    res.status(500).json({ message: err.message || "Server error" });
  }
}
// ================= UPDATE =================
async updateSubCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, category, icon, color } = req.body;
    const existingCategory = await Category.findOne({ name: category });
    if (!existingCategory) {
      return res.status(400).json({ message: "Category not found" });
    }
    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      {
        name,
        category: existingCategory._id,
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
      },
      { new: true, runValidators: true }
    );

    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.json({ success: true, data: subCategory });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "SubCategory already exists in this category",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
}

//delete 
async deleteSubCategory(req, res) {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findByIdAndDelete(id);

    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.json({
      success: true,
      message: "SubCategory deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
}
module.exports = new SubCategoryController();