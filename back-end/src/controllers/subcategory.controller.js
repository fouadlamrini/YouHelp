const subcategoryService = require("../services/subcategory.service");

class SubCategoryController {
  getAllSubCategories = async (req, res) => {
    try {
      const result = await subcategoryService.getAll();
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  };

  getByCategory = async (req, res) => {
    try {
      const result = await subcategoryService.getByCategory(req.params.categoryId);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  };

  createSubCategory = async (req, res) => {
    try {
      const result = await subcategoryService.create(req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "Cette sous-catégorie existe déjà dans cette catégorie." });
      }
      return res.status(500).json({ message: err.message || "Server error" });
    }
  };

  updateSubCategory = async (req, res) => {
    try {
      const result = await subcategoryService.update(req.params.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "SubCategory already exists in this category" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  };

  deleteSubCategory = async (req, res) => {
    try {
      const result = await subcategoryService.deleteSubCategory(req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "SubCategory deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new SubCategoryController();
