const { mapFilesToMedia } = require("../utils/media");
const knowledgeService = require("../services/knowledge.service");

class KnowledgeController {
  createKnowledge = async (req, res) => {
    try {
      const mediaFiles = mapFilesToMedia(req.files);
      const result = await knowledgeService.createKnowledge(req.user.id, req.body, mediaFiles);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({
        success: true,
        message: "Connaissance créée avec succès",
        data: result.data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };

  getAllKnowledge = async (req, res) => {
    try {
      const filter = req.query.filter || "all";
      const result = await knowledgeService.getAllKnowledge(req.user.id, filter);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };

  getKnowledgeById = async (req, res) => {
    try {
      const result = await knowledgeService.getKnowledgeById(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };

  updateKnowledge = async (req, res) => {
    try {
      const uploadedMedia = mapFilesToMedia(req.files);
      const result = await knowledgeService.updateKnowledge(req.user.id, req.params.id, req.body, uploadedMedia);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({
        success: true,
        message: "Connaissance mise à jour avec succès",
        data: result.data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };

  deleteKnowledge = async (req, res) => {
    try {
      const result = await knowledgeService.deleteKnowledge(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Connaissance supprimée avec succès" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };

  toggleReaction = async (req, res) => {
    try {
      const result = await knowledgeService.toggleReaction(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      const message = result.data.removed ? "Réaction retirée" : "Réaction ajoutée";
      return res.json({ success: true, message, reactionCount: result.data.reactionCount });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };

  toggleShare = async (req, res) => {
    try {
      const result = await knowledgeService.toggleShare(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({
        success: true,
        message: "Connaissance partagée",
        shareCount: result.data.shareCount,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
}

module.exports = new KnowledgeController();
