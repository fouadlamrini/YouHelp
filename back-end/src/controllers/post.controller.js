const { mapFilesToMedia } = require("../utils/media");
const postService = require("../services/post.service");

class PostController {
  createPost = async (req, res) => {
    try {
      const mediaFiles = mapFilesToMedia(req.files);
      const result = await postService.createPost(req.user.id, req.body, mediaFiles);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getAllPosts = async (req, res) => {
    try {
      const filter = req.query.filter || "all";
      const result = await postService.getAllPosts(req.user.id, filter);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getPostById = async (req, res) => {
    try {
      const result = await postService.getPostById(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  updatePost = async (req, res) => {
    try {
      const uploadedMedia = mapFilesToMedia(req.files);
      const result = await postService.updatePost(req.params.id, req.body, uploadedMedia);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  deletePost = async (req, res) => {
    try {
      const result = await postService.deletePost(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Post deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  toggleSolved = async (req, res) => {
    try {
      const result = await postService.toggleSolved(req.user.id, req.params.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data, message: result.message });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({ message: "Ce post a déjà une solution" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  };

  toggleReaction = async (req, res) => {
    try {
      const result = await postService.toggleReaction(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      const message = result.data.removed ? "Reaction removed" : "Reacted to post";
      return res.json({ success: true, message, totalReactions: result.data.totalReactions });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getMySharedPosts = async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const result = await postService.getMySharedPosts(userId);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  deleteShare = async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const result = await postService.deleteShare(userId, req.params.shareId);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Partage supprimé" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  toggleShare = async (req, res) => {
    try {
      const result = await postService.toggleShare(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({
        success: true,
        message: "Post partagé",
        totalShares: result.data.totalShares,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
}

module.exports = new PostController();
