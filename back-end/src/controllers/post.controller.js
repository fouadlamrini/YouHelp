const Post = require("../models/Post");
const User = require("../models/User");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Comment = require("../models/Comment");
const Engagement = require("../models/Engagement");

class PostController {
  async createPost(req, res) {
    try {
      const { content, category, subCategory } = req.body;

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

      

      // ===== Media processing =====
      const mediaFiles = req.files.map((file) => {
        let type = "file";
        if (file.mimetype.startsWith("image")) type = "image";
        else if (file.mimetype.startsWith("video")) type = "video";
        else if (file.mimetype === "application/pdf") type = "pdf";
        else if (file.mimetype.includes("word")) type = "doc";

        // Folder correct path
        let folder = "files";
        if (type === "image") folder = "images";
        else if (type === "video") folder = "videos";

        return { url: `/uploads/${folder}/${file.filename}`, type };
      });

      const post = await Post.create({
        content,
        author: req.user.id,
        category: categoryDoc._id,
        subCategory: subCategoryId,
        media: mediaFiles,
      });

      res.status(201).json({ success: true, data: post });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async _postsAuthorFilter(req) {
    if (!req.user) return { _id: -1 };
    const role = req.user.role;
    if (role === "super_admin") return {};
    const current = await User.findById(req.user.id).populate("campus class level");
    if (!current) return { _id: -1 };
    if (role === "admin") {
      if (!current.campus) return {};
      const authorIds = await User.find({ campus: current.campus._id }).distinct("_id");
      return { author: { $in: authorIds } };
    }
    if (role === "formateur" || role === "etudiant") {
      const filter = {};
      if (current.campus) filter.campus = current.campus._id;
      if (current.class) filter.class = current.class._id;
      if (current.level) filter.level = current.level._id;
      const authorIds = await User.find(filter).distinct("_id");
      return { author: { $in: authorIds } };
    }
    return { _id: -1 };
  }

  async getAllPosts(req, res) {
    try {
      const authorFilter = await this._postsAuthorFilter(req);
      const posts = await Post.find(authorFilter)
        .sort({ createdAt: -1 })
        .populate("author", "name email campus class level")
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
        .populate("author", "name email campus class level")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");
      if (!post) return res.status(404).json({ message: "Post not found" });
      const authorFilter = await this._postsAuthorFilter(req);
      if (authorFilter._id === -1) return res.status(403).json({ message: "Forbidden" });
      if (authorFilter.author && authorFilter.author.$in) {
        const authorId = post.author?._id?.toString() || post.author?.toString();
        const allowed = authorFilter.author.$in.some(id => id.toString() === authorId);
        if (!allowed) return res.status(403).json({ message: "Forbidden" });
      }
      res.json({ success: true, data: post });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { category, subCategory, ...rest } = req.body;
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
      if (req.user?.role == null) {
        return res.status(403).json({
          message: "Access restricted: request admin for reaction access",
        });
      }
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: "Post not found" });
      const userId = req.user.id;
      const existing = await Engagement.findOne({ type: "reaction", user: userId, post: id });
      if (existing) {
        await Engagement.deleteOne({ _id: existing._id });
        await Post.findByIdAndUpdate(id, { $inc: { reactionCount: -1 } });
        return res.json({
          success: true,
          message: "Reaction removed",
          totalReactions: Math.max(0, (post.reactionCount || 0) - 1),
        });
      }
      await Engagement.create({ type: "reaction", user: userId, post: id });
      await Post.findByIdAndUpdate(id, { $inc: { reactionCount: 1 } });
      return res.json({
        success: true,
        message: "Reacted to post",
        totalReactions: (post.reactionCount || 0) + 1,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async toggleShare(req, res) {
    try {
      const { id } = req.params;
      if (req.user?.role == null) {
        return res.status(403).json({
          message: "Accès refusé: demander le rôle approprié pour partager",
        });
      }
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: "Post introuvable" });
      if (post.author.toString() === req.user.id) {
        return res.status(400).json({ message: "Vous ne pouvez pas partager votre propre post" });
      }
      const userId = req.user.id;
      const existing = await Engagement.findOne({ type: "share", user: userId, post: id });
      if (existing) {
        await Engagement.deleteOne({ _id: existing._id });
        await Post.findByIdAndUpdate(id, { $inc: { shareCount: -1 } });
        return res.json({ success: true, message: "Partage retiré" });
      }
      await Engagement.create({ type: "share", user: userId, post: id });
      await Post.findByIdAndUpdate(id, { $inc: { shareCount: 1 } });
      return res.status(201).json({ success: true, message: "Post partagé" });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({ message: "Vous avez déjà partagé ce post" });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = new PostController();
