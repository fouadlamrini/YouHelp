const User = require("../models/User");
const commentService = require("../services/comment.service");

class CommentController {
  async createComment(req, res) {
    try {
      const currentUser = await User.findById(req.user.id).select("status").lean();
      if (currentUser?.status !== "active") {
        return res.status(403).json({ message: "Seuls les comptes activés peuvent commenter." });
      }
      const result = await commentService.createComment(
        req.user.id,
        req.params.postId,
        req.body,
        req.files || []
      );
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async getCommentsByPost(req, res) {
    try {
      const result = await commentService.getCommentsByPost(req.params.postId);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async toggleLike(req, res) {
    try {
      const result = await commentService.toggleLike(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      const message = result.data.removed ? "Like retiré" : "Commentaire liké";
      return res.json({
        success: true,
        message,
        totalLikes: result.data.totalLikes,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async updateComment(req, res) {
    try {
      const result = await commentService.updateComment(
        req.user.id,
        req.user.role,
        req.params.id,
        req.body,
        req.files || []
      );
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async deleteComment(req, res) {
    try {
      const result = await commentService.deleteComment(req.user.id, req.user.role, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, deletedCount: result.data.deletedCount });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async createCommentForKnowledge(req, res) {
    try {
      const currentUser = await User.findById(req.user.id).select("status").lean();
      if (!currentUser || currentUser.status !== "active") {
        return res.status(403).json({
          message: "Seuls les comptes activés peuvent commenter les connaissances.",
        });
      }
      const result = await commentService.createCommentForKnowledge(
        req.user.id,
        req.params.knowledgeId,
        req.body,
        req.files || []
      );
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async getCommentsByKnowledge(req, res) {
    try {
      const result = await commentService.getCommentsByKnowledge(req.params.knowledgeId);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = new CommentController();
