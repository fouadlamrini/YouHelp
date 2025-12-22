const Post = require("../models/Post");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

class PostController {
  async createPost(req, res) {
    try {
      const {
        title,
        content,
        category,   
        subCategory,  
        tags,
        media
      } = req.body;

    
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return res.status(400).json({ message: "Category not found" });
      }

      let subCategoryId = null;

      if (subCategory) {
        const subCategoryDoc = await SubCategory.findOne({
          name: subCategory,
          category: categoryDoc._id
        });

        if (!subCategoryDoc) {
          return res.status(400).json({ message: "SubCategory not found" });
        }

        subCategoryId = subCategoryDoc._id;
      }

      const post = await Post.create({
        title,
        content,
        author: req.user._id,
        category: categoryDoc._id,
        subCategory: subCategoryId,
        tags,
        media
      });

      res.status(201).json({ success: true, data: post });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new PostController();
