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
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

// ================= CREATE =================
async createSubCategory(req, res) {
  try {
    const { name, category } = req.body; 

    const existingCategory = await Category.findOne({ name: category });

    if (!existingCategory) {
      return res.status(400).json({ message: "Category not found" });
    }
    const subCategory = await SubCategory.create({
      name,
      category: existingCategory._id,
    });

    res.status(201).json({ success: true, data: subCategory });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
}
