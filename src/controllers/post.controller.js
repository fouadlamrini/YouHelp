const Post = require("../models/Post");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Comment = require("../models/Comment");
class PostController {
  async createPost(req, res) {
    try {
      const { title, content, category, subCategory, tags } = req.body;

      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc)
        return res.status(400).json({ message: "Category not found" });

      let subCategoryId = null;
      if (subCategory) {
        const subCategoryDoc = await SubCategory.findOne({
          name: subCategory,
          category: categoryDoc._id,
        });
        if (!subCategoryDoc)
          return res.status(400).json({ message: "SubCategory not found" });
        subCategoryId = subCategoryDoc._id;
      }

      // Tags processing
      let tagsArray = [];
      if (tags) {
        tagsArray = tags
          .split(" ")
          .filter((tag) => tag.startsWith("#"))
          .map((tag) => tag.slice(1).trim())
          .filter((tag) => tag.length > 0);
      }

      // Media processing
      const mediaFiles = req.files.map((file) => {
        let type = "file";
        if (file.mimetype.startsWith("image")) type = "image";
        else if (file.mimetype.startsWith("video")) type = "video";
        else if (file.mimetype === "application/pdf") type = "pdf";
        else if (file.mimetype.includes("word")) type = "doc";
        return { url: `/uploads/${file.filename}`, type };
      });

      const post = await Post.create({
        title,
        content,
        author: req.user.id,
        category: categoryDoc._id,
        subCategory: subCategoryId,
        tags: tagsArray,
        media: mediaFiles,
      });

      res.status(201).json({ success: true, data: post });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getAllPosts(req, res) {
    try {
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate("author", "name email")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");
      res.json({ success: true, data: posts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getPostById(req, res) {
    try {
      const post = await Post.findById(req.params.id)
        .populate("author", "name email")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json({ success: true, data: post });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { category, subCategory, tags, ...rest } = req.body;
      let updateData = { ...rest };

      if (category) {
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc)
          return res.status(400).json({ message: "Category not found" });
        updateData.category = categoryDoc._id;
        if (subCategory) {
          const subCategoryDoc = await SubCategory.findOne({
            name: subCategory,
            category: categoryDoc._id,
          });
          if (!subCategoryDoc)
            return res.status(400).json({ message: "SubCategory not found" });
          updateData.subCategory = subCategoryDoc._id;
        }
      }

      if (tags) {
        updateData.tags = tags
          .split(" ")
          .filter((tag) => tag.startsWith("#"))
          .map((tag) => tag.slice(1).trim())
          .filter((tag) => tag.length > 0);
      }

      const post = await Post.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!post) return res.status(404).json({ message: "Post not found" });

      res.json({ success: true, data: post });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findByIdAndDelete(id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      res.json({ success: true, message: "Post deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async toggleReaction(req, res) {
  try {
    const { id } = req.params;

    if (req.user?.role === "connected") {
      return res.status(403).json({
        message: "Access restricted: request admin for reaction access",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;
    post.Reaction = post.Reaction || [];

    const hasReacted = post.Reaction.includes(userId);

    post.Reaction = hasReacted
      ? post.Reaction.filter((u) => u.toString() !== userId)
      : [...post.Reaction, userId];

    await post.save();

    return res.json({
      success: true,
      message: hasReacted ? "Reaction removed" : "Reacted to post",
      totalReactions: post.Reaction.length,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

}

module.exports = new PostController();
