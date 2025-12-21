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
//update
async updateSubCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, category } = req.body;
    const existingCategory = await Category.findOne({ name: category });
    if (!existingCategory) {
      return res.status(400).json({ message: "Category not found" });
    }
    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      {
        name,
        category: existingCategory._id,
      },
      { new: true, runValidators: true }
    );

    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.json({ success: true, data: subCategory });
  } catch (err) {
    console.error(err);

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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
}
module.exports = new SubCategoryController();