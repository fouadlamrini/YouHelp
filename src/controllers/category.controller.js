const Category = require('../models/Category');
class CategoryController {
    // GET all categories
  async getAllCategory(req, res) {
    try {
      const categories = await Category.find().sort({ createdAt: -1 });
      res.json({ success: true, data: categories });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
  // CREATE new category
  async createCategory(req, res) {
    try {
      const { name } = req.body;
      const existing = await Category.findOne({ name });
      if (existing) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      const category = await Category.create({ name });
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  //update category
async updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name },              
      { new: true, runValidators: true } 
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }}
}