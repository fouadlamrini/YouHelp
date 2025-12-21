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
  
}