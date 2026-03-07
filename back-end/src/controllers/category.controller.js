const categoryService = require("../services/category.service");

class CategoryController {
  getAllCategory = async (req, res) => {
    try {
      const result = await categoryService.getAll();
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  };

  createCategory = async (req, res) => {
    try {
      const result = await categoryService.create(req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || "Server error" });
    }
  };

  updateCategory = async (req, res) => {
    try {
      const result = await categoryService.update(req.params.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  };

  deleteCategory = async (req, res) => {
    try {
      const result = await categoryService.deleteCategory(req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new CategoryController();
