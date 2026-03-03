const Post = require("../models/Post");
const User = require("../models/User");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Comment = require("../models/Comment");
const Engagement = require("../models/Engagement");
const { areFriends } = require("./friend.controller");

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
      const mediaFiles = (req.files || []).map((file) => {
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
    if (role == null) {
      const campusId = req.query.campus;
      if (!campusId) return { _id: -1 };
      const authorIds = await User.find({ campus: campusId }).distinct("_id");
      return { author: { $in: authorIds } };
    }
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

  async _sameContextReactionCount(postId, authorId) {
    const author = await User.findById(authorId).select("campus class level");
    if (!author || (!author.campus && !author.class && !author.level)) return 0;
    const filter = {};
    if (author.campus) filter.campus = author.campus;
    if (author.class) filter.class = author.class;
    if (author.level) filter.level = author.level;
    const userIds = await User.find(filter).distinct("_id");
    return Engagement.countDocuments({
      type: "reaction",
      post: postId,
      user: { $in: userIds },
    });
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
      const withSameContextReactions = await Promise.all(
        posts.map(async (p) => {
          const sameContextReactionCount = await this._sameContextReactionCount(p._id, p.author?._id || p.author);
          return { ...p.toObject(), sameContextReactionCount };
        })
      );
      res.json({ success: true, data: withSameContextReactions });
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
      const sameContextReactionCount = await this._sameContextReactionCount(req.params.id, post.author?._id || post.author);
      res.json({ success: true, data: { ...post.toObject(), sameContextReactionCount } });
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
      const post = await Post.findById(id).populate("author");
      if (!post) return res.status(404).json({ message: "Post not found" });
      const userId = req.user.id;
      if (req.user.role === "etudiant") {
        const author = await User.findById(post.author._id || post.author).populate("campus class level");
        const me = await User.findById(userId).populate("campus class level");
        const sameCampus = me.campus && author.campus && me.campus._id.toString() === author.campus._id.toString();
        const sameClass = me.class && author.class && me.class._id.toString() === author.class._id.toString();
        const sameLevel = me.level && author.level && me.level._id.toString() === author.level._id.toString();
        const sameContext = sameCampus && sameClass && sameLevel;
        const friend = await areFriends(userId, post.author._id || post.author);
        if (!sameContext && !friend) {
          return res.status(403).json({
            message: "You can only react to posts from same campus/class/level or from friends",
          });
        }
      }
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
