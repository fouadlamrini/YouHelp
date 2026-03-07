const Category = require('../models/Category');
class CategoryController {
    // GET all categories
  async getAllCategory(req, res) {
    try {
      const categories = await Category.find().sort({ createdAt: -1 });
      res.json({ success: true, data: categories });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  // CREATE new category
  async createCategory(req, res) {
    try {
      const { name, icon, color } = req.body;
      const trimmedName = typeof name === 'string' ? name.trim() : '';
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
      if (existing) {
        return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà.' });
      }

      const category = await Category.create({
        name: trimmedName,
        icon: icon || null,
        color: color || null,
      });
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  }

  // UPDATE category
async updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

//delete category
async deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }}
}

module.exports = new CategoryController();