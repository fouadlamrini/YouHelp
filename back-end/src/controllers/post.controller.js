const Post = require("../models/Post");
const User = require("../models/User");
const Friend = require("../models/Friend");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Comment = require("../models/Comment");
const Engagement = require("../models/Engagement");
const Solution = require("../models/Solution");
const { areFriends, getMyFriendIds } = require("./friend.controller");

class PostController {
  async createPost(req, res) {
    try {
      const currentUser = await User.findById(req.user.id).select("status").lean();
      if (currentUser?.status !== "active") {
        return res.status(403).json({ message: "Seuls les comptes activés peuvent créer des posts." });
      }
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
      const sameContextIds = await User.find(filter).distinct("_id");
      const friendDocs = await Friend.find({
        $or: [{ user1: req.user.id }, { user2: req.user.id }],
      }).select("user1 user2");
      const myFriendIds = friendDocs.map((d) => {
        const u1 = d.user1.toString();
        const u2 = d.user2.toString();
        return u1 === req.user.id ? u2 : u1;
      });
      const authorIds = [...new Set([...sameContextIds.map(String), ...myFriendIds])];
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

  async _totalSameContextCount(authorId) {
    const author = await User.findById(authorId).select("campus class level");
    if (!author || (!author.campus && !author.class && !author.level)) return 0;
    const filter = {};
    if (author.campus) filter.campus = author.campus;
    if (author.class) filter.class = author.class;
    if (author.level) filter.level = author.level;
    return User.countDocuments(filter);
  }

  _sameContextAsAuthor(currentUser, post) {
    const author = post.author?.toObject ? post.author : post.author;
    if (!author?.campus && !author?.class && !author?.level) return false;
    const sameCampus = !!(currentUser.campus && author?.campus &&
      (currentUser.campus._id?.toString() || currentUser.campus.toString()) === (author.campus?._id?.toString() || author.campus?.toString()));
    const sameClass = !!(currentUser.class && author?.class &&
      (currentUser.class._id?.toString() || currentUser.class.toString()) === (author.class?._id?.toString() || author.class?.toString()));
    const sameLevel = !!(currentUser.level && author?.level &&
      (currentUser.level._id?.toString() || currentUser.level.toString()) === (author.level?._id?.toString() || author.level?.toString()));
    return sameCampus && sameClass && sameLevel;
  }

  async getAllPosts(req, res) {
    try {
      const filter = (req.query.filter || "all").toLowerCase();
      const allowedFilters = ["all", "friends", "my_campus"];
      const viewFilter = allowedFilters.includes(filter) ? filter : "all";

      const currentUser = await User.findById(req.user.id)
        .select("status campus class level role")
        .populate("campus class level")
        .populate("role", "name");
      if (!currentUser) return res.status(403).json({ message: "User not found" });

      let authorFilter = {};
      let noAuthors = false;
      if (currentUser.status === "active") {
        const friendIds = await getMyFriendIds(req.user.id);
        if (viewFilter === "friends") {
          if (friendIds.length === 0) {
            noAuthors = true;
          } else {
            authorFilter = { author: { $in: friendIds } };
          }
        } else if (viewFilter === "my_campus") {
          const campusId = currentUser.campus?._id || currentUser.campus;
          if (campusId) {
            const sameCampusIds = await User.find({ campus: campusId }).distinct("_id");
            if (sameCampusIds.length === 0) {
              noAuthors = true;
            } else {
              authorFilter = { author: { $in: sameCampusIds } };
            }
          }
        }
      }

      if (noAuthors) {
        return res.json({ success: true, data: [] });
      }

      const posts = await Post.find(authorFilter)
        .sort({ createdAt: -1 })
        .populate({ path: "author", select: "name email campus class level profilePicture role", populate: { path: "role", select: "name" } })
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");

      const withMeta = await Promise.all(
        posts.map(async (p) => {
          const authorId = p.author?._id || p.author;
          const sameContextReactionCount = await this._sameContextReactionCount(p._id, authorId);
          const totalSameContext = await this._totalSameContextCount(authorId);
          const commentCount = await Comment.countDocuments({ post: p._id });
          const canReact = await this._postCanReact(req.user.id, currentUser, p, viewFilter);
          const sameContextAsAuthor = this._sameContextAsAuthor(currentUser, p);
          const showDemandeWorkchopButton = totalSameContext > 0 && sameContextReactionCount >= totalSameContext * 0.5;
          return {
            ...p.toObject(),
            sameContextReactionCount,
            totalSameContext,
            commentCount,
            canReact,
            sameContextAsAuthor,
            showDemandeWorkchopButton,
          };
        })
      );
      res.json({ success: true, data: withMeta });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async _postCanReact(currentUserId, currentUser, post, viewFilter) {
    if (currentUser.status !== "active") return false;
    const authorId = post.author?._id || post.author;
    if (!authorId) return false;
    if (currentUserId.toString() === authorId.toString()) return true;
    const author = post.author?.toObject ? post.author.toObject() : post.author;
    if (currentUser.role?.name === "super_admin") return true;
    if (author?.role?.name === "super_admin") return true;
    if (viewFilter === "friends") return true;
    const sameCampus =
      currentUser.campus && author?.campus &&
      (currentUser.campus._id?.toString() || currentUser.campus.toString()) ===
        (author.campus?._id?.toString() || author.campus?.toString());
    const sameClass =
      currentUser.class && author?.class &&
      (currentUser.class._id?.toString() || currentUser.class.toString()) ===
        (author.class?._id?.toString() || author.class?.toString());
    const sameLevel =
      currentUser.level && author?.level &&
      (currentUser.level._id?.toString() || currentUser.level.toString()) ===
        (author.level?._id?.toString() || author.level?.toString());
    const sameContext = sameCampus && sameClass && sameLevel;
    if (viewFilter === "my_campus") return sameContext;
    const friend = await areFriends(currentUserId, authorId);
    return sameContext || friend;
  }

  async getPostById(req, res) {
    try {
      const post = await Post.findById(req.params.id)
        .populate({ path: "author", select: "name email campus class level profilePicture role", populate: { path: "role", select: "name" } })
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");
      if (!post) return res.status(404).json({ message: "Post not found" });
      const currentUser = await User.findById(req.user.id).select("status").lean();
      if (currentUser?.status !== "active") {
        const sameContextReactionCount = await this._sameContextReactionCount(req.params.id, post.author?._id || post.author);
        const commentCount = await Comment.countDocuments({ post: req.params.id });
        return res.json({ success: true, data: { ...post.toObject(), sameContextReactionCount, commentCount, canReact: false, showDemandeWorkchopButton: false, sameContextAsAuthor: false } });
      }
      const authorFilter = await this._postsAuthorFilter(req);
      if (authorFilter._id === -1) return res.status(403).json({ message: "Forbidden" });
      if (authorFilter.author && authorFilter.author.$in) {
        const authorId = post.author?._id?.toString() || post.author?.toString();
        const allowed = authorFilter.author.$in.some(id => id.toString() === authorId);
        if (!allowed) return res.status(403).json({ message: "Forbidden" });
      }
      const fullUser = await User.findById(req.user.id).select("status campus class level role").populate("campus class level").populate("role", "name");
      const authorId = post.author?._id || post.author;
      const sameContextReactionCount = await this._sameContextReactionCount(req.params.id, authorId);
      const totalSameContext = await this._totalSameContextCount(authorId);
      const commentCount = await Comment.countDocuments({ post: req.params.id });
      const canReact = await this._postCanReact(req.user.id, fullUser, post, "all");
      const sameContextAsAuthor = this._sameContextAsAuthor(fullUser, post);
      const showDemandeWorkchopButton = totalSameContext > 0 && sameContextReactionCount >= totalSameContext * 0.5;
      res.json({
        success: true,
        data: {
          ...post.toObject(),
          sameContextReactionCount,
          totalSameContext,
          commentCount,
          canReact,
          sameContextAsAuthor,
          showDemandeWorkchopButton,
        },
      });
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

      // ===== Media update (existing + new uploads) =====
      try {
        const existingMediaRaw = req.body.existingMedia;
        let existingMedia = [];
        if (existingMediaRaw) {
          if (Array.isArray(existingMediaRaw)) {
            existingMedia = existingMediaRaw;
          } else if (typeof existingMediaRaw === "string") {
            existingMedia = JSON.parse(existingMediaRaw || "[]");
          }
        }

        const uploadedMedia = (req.files || []).map((file) => {
          let type = "file";
          if (file.mimetype.startsWith("image")) type = "image";
          else if (file.mimetype.startsWith("video")) type = "video";
          else if (file.mimetype === "application/pdf") type = "pdf";
          else if (file.mimetype.includes("word")) type = "doc";

          let folder = "files";
          if (type === "image") folder = "images";
          else if (type === "video") folder = "videos";

          return { url: `/uploads/${folder}/${file.filename}`, type };
        });

        if (existingMedia.length || uploadedMedia.length) {
          updateData.media = [...existingMedia, ...uploadedMedia];
        }
      } catch (e) {
        console.error("Error parsing existingMedia for post update:", e);
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

      // Cleanup engagements (reactions + shares) related to this post
      await Engagement.deleteMany({ post: id });

      res.json({ success: true, message: "Post deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  /**
   * Check if current user can toggle solved status.
   * Allowed: super_admin, post owner, admin (same campus as author), formateur (same campus + class + level as author).
   */
  async _canToggleSolved(req, post) {
    const userId = req.user?.id;
    if (!userId) return false;
    if (req.user.role === "super_admin") return true;

    const authorId = post.author?._id?.toString() || post.author?.toString();
    if (authorId === userId.toString()) return true;

    const role = req.user.role;
    if (role !== "admin" && role !== "formateur") return false;

    const author = post.author?.toObject ? post.author : await User.findById(post.author).populate("campus class level").lean();
    const me = await User.findById(userId).populate("campus class level").lean();
    if (!me || !author) return false;

    const sameCampus = [me.campus?._id ?? me.campus, author.campus?._id ?? author.campus]
      .every(Boolean) && (me.campus?._id ?? me.campus).toString() === (author.campus?._id ?? author.campus).toString();
    if (role === "admin") return sameCampus;

    const sameClass = [me.class?._id ?? me.class, author.class?._id ?? author.class]
      .every(Boolean) && (me.class?._id ?? me.class).toString() === (author.class?._id ?? author.class).toString();
    const sameLevel = [me.level?._id ?? me.level, author.level?._id ?? author.level]
      .every(Boolean) && (me.level?._id ?? me.level).toString() === (author.level?._id ?? author.level).toString();
    return sameCampus && sameClass && sameLevel;
  }

  async toggleSolved(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id).populate("author", "campus class level");
      if (!post) return res.status(404).json({ message: "Post not found" });

      const canToggle = await this._canToggleSolved(req, post);
      if (!canToggle) {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à modifier le statut résolu de ce post",
        });
      }

      if (post.isSolved) {
        await Solution.deleteOne({ post: id });
        await Post.findByIdAndUpdate(id, { isSolved: false });
        return res.json({ success: true, data: { isSolved: false }, message: "Post marqué comme non résolu" });
      }

      const rawDescription = req.body?.description;
      const description =
        typeof rawDescription === "string" && rawDescription.trim().length > 0
          ? rawDescription.trim()
          : "Marqué comme résolu";

      await Solution.create({
        post: id,
        description,
        markedBy: req.user.id,
      });
      await Post.findByIdAndUpdate(id, { isSolved: true });
      return res.json({ success: true, data: { isSolved: true }, message: "Post marqué comme résolu" });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({ message: "Ce post a déjà une solution" });
      }
      res.status(500).json({ message: "Server error" });
    }
  }

  async toggleReaction(req, res) {
    try {
      const currentUser = await User.findById(req.user.id).select("status").lean();
      if (currentUser?.status !== "active") {
        return res.status(403).json({ message: "Seuls les comptes activés peuvent réagir aux posts." });
      }
      const { id } = req.params;
      const post = await Post.findById(id).populate({ path: "author", populate: { path: "role", select: "name" } });
      if (!post) return res.status(404).json({ message: "Post not found" });
      const userId = req.user.id;
      const isAuthorSuperAdmin = post.author?.role?.name === "super_admin";
      if (req.user.role !== "super_admin" && !isAuthorSuperAdmin && req.user.role === "etudiant") {
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

  async getMySharedPosts(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const engagements = await Engagement.find({
        type: "share",
        user: userId,
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "post",
          populate: [
            { path: "author", select: "name email campus class level profilePicture" },
            { path: "category", select: "name" },
            { path: "subCategory", select: "name" },
          ],
        })
        .populate({
          path: "knowledge",
          populate: [
            { path: "author", select: "name email campus class level profilePicture" },
            { path: "category", select: "name" },
            { path: "subCategory", select: "name" },
          ],
        })
        .lean();
      const withMeta = await Promise.all(
        engagements.map(async (e) => {
          if (e.post) {
            const post = e.post;
            const sameContextReactionCount = await this._sameContextReactionCount(
              post._id,
              post.author?._id || post.author
            );
            const commentCount = await Comment.countDocuments({ post: post._id });
            return {
              _id: e._id,
              sharedAt: e.createdAt,
              post: {
                ...post,
                sameContextReactionCount,
                commentCount,
              },
            };
          }

          if (e.knowledge) {
            const knowledge = e.knowledge;
            const commentCount = await Comment.countDocuments({ knowledge: knowledge._id });
            return {
              _id: e._id,
              sharedAt: e.createdAt,
              knowledge: {
                ...knowledge,
                commentCount,
              },
            };
          }

          return null;
        })
      );
      res.json({ success: true, data: withMeta.filter(Boolean) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async deleteShare(req, res) {
    try {
      const { shareId } = req.params;
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Non authentifié" });

      const engagement = await Engagement.findOne({
        _id: shareId,
        type: "share",
        user: userId,
      });

      if (!engagement) {
        return res.status(404).json({ message: "Partage introuvable" });
      }

      const postId = engagement.post;
      await Engagement.deleteOne({ _id: engagement._id });

      if (postId) {
        await Post.findByIdAndUpdate(postId, {
          $inc: { shareCount: -1 },
        });
      }

      return res.json({ success: true, message: "Partage supprimé" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async toggleShare(req, res) {
    try {
      const currentUser = await User.findById(req.user.id).select("status").lean();
      if (currentUser?.status !== "active") {
        return res.status(403).json({ message: "Seuls les comptes activés peuvent partager des posts." });
      }
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: "Post introuvable" });
      const userId = req.user.id;
      // Chaque clic = un nouveau partage, même sur son propre post
      await Engagement.create({ type: "share", user: userId, post: id });
      const updated = await Post.findByIdAndUpdate(
        id,
        { $inc: { shareCount: 1 } },
        { new: true }
      );
      return res.status(201).json({
        success: true,
        message: "Post partagé",
        totalShares: updated?.shareCount ?? post.shareCount + 1,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = new PostController();
