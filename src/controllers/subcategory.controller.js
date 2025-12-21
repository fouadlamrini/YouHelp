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
  }}
